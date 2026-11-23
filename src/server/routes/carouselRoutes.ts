import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import multer from 'multer';
import {
  deleteImageFromStorage,
  uploadImageToStorage,
} from '../config/cloudinary.ts';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import {
  isGroqConfigured,
  transcribeAudioCaption,
  translateCaptionToTeluguAndHindi,
} from '../services/groqTranslator.ts';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB max per image
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed.'));
    }
  },
});

const ALLOWED_AUDIO_EXTENSIONS = /\.(m4a|mp3|wav|webm|ogg|flac|mp4|mpeg|mpga)$/i;

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per audio clip
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/webm' ||
      ALLOWED_AUDIO_EXTENSIONS.test(file.originalname || '')
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only audio files (M4A, MP3, WAV, WebM, OGG, FLAC) are supported.'
        )
      );
    }
  },
});

function sanitizeCaptionInput(value: unknown, maxLen = 300): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

// Public GET endpoint for Happy Clients section on landing page
router.get('/', async (_req: Request, res: Response) => {
  try {
    const images = await repo.listCarouselImages();
    res.json(
      images.map((img) => ({
        _id: img._id,
        url: img.url,
        caption: img.caption,
        captionTe: img.captionTe || '',
        captionHi: img.captionHi || '',
        uploadedAt: img.uploadedAt,
        createdAt: img.createdAt,
      }))
    );
  } catch (err) {
    console.error('List carousel images error:', err);
    res.status(500).json({ message: 'Failed to load gallery images.' });
  }
});

// Protected status endpoint letting owner UI know if Groq auto-translation/Whisper is configured
router.get(
  '/capabilities',
  requireAuth,
  (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      groqConfigured: isGroqConfigured(),
    });
  }
);

// Protected Whisper audio transcription + automatic Telugu/Hindi translation
router.post(
  '/transcribe-caption',
  requireAuth,
  audioUpload.single('audio'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res
          .status(400)
          .json({ message: 'Please provide an audio file or voice recording.' });
        return;
      }

      const result = await transcribeAudioCaption(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        text: result.text,
        captionTe: result.captionTe,
        captionHi: result.captionHi,
        translated: result.translated,
        note: result.note,
        groqConfigured: isGroqConfigured(),
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to transcribe audio caption.';
      const status = msg.includes('GROQ_API_KEY') ? 503 : 500;
      res.status(status).json({ message: msg });
    }
  }
);

// Protected POST endpoint with strict 10-image FIFO rotation rule + Groq translation
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res
          .status(400)
          .json({ message: 'Please select an image file to upload.' });
        return;
      }

      const caption =
        sanitizeCaptionInput(req.body?.caption) ||
        'Happy Client & Sugarcane Supply Dispatch';

      let captionTe = sanitizeCaptionInput(req.body?.captionTe);
      let captionHi = sanitizeCaptionInput(req.body?.captionHi);
      let translated = Boolean(captionTe && captionHi);
      let translationNote: string | undefined;

      if (!captionTe || !captionHi) {
        const aiTranslation = await translateCaptionToTeluguAndHindi(caption);
        if (!captionTe && aiTranslation.captionTe) {
          captionTe = aiTranslation.captionTe;
        }
        if (!captionHi && aiTranslation.captionHi) {
          captionHi = aiTranslation.captionHi;
        }
        translated = Boolean(captionTe || captionHi);
        translationNote = aiTranslation.note;
      }

      const uploaded = await uploadImageToStorage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      const { created, removedOldest } = await repo.addCarouselImageAndRotate({
        url: uploaded.url,
        publicId: uploaded.publicId,
        caption,
        captionTe,
        captionHi,
      });

      // Automatically clean up oldest rotated-out images from Cloudinary / storage
      for (const oldImg of removedOldest) {
        await deleteImageFromStorage(oldImg.publicId);
      }

      const currentImages = await repo.listCarouselImages();

      res.status(201).json({
        uploaded: created,
        rotatedOutCount: removedOldest.length,
        images: currentImages,
        translated,
        translationNote,
        groqConfigured: isGroqConfigured(),
      });
    } catch (err) {
      console.error('Upload carousel image error:', err);
      res.status(500).json({
        message:
          err instanceof Error
            ? err.message
            : 'Failed to upload carousel image.',
      });
    }
  }
);

// Protected PATCH endpoint to edit captions or trigger Groq Auto-Translate
router.patch(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const existing = await repo.getCarouselImageById(id);
      if (!existing) {
        res.status(404).json({ message: 'Carousel image not found.' });
        return;
      }

      const nextCaption =
        typeof req.body?.caption === 'string'
          ? sanitizeCaptionInput(req.body.caption) || existing.caption
          : existing.caption;

      const autoTranslate = req.body?.autoTranslate === true;
      let nextTe =
        typeof req.body?.captionTe === 'string'
          ? sanitizeCaptionInput(req.body.captionTe)
          : existing.captionTe || '';
      let nextHi =
        typeof req.body?.captionHi === 'string'
          ? sanitizeCaptionInput(req.body.captionHi)
          : existing.captionHi || '';

      let translated = false;
      let translationNote: string | undefined;

      if (autoTranslate) {
        const aiResult = await translateCaptionToTeluguAndHindi(nextCaption);
        if (aiResult.captionTe) nextTe = aiResult.captionTe;
        if (aiResult.captionHi) nextHi = aiResult.captionHi;
        translated = aiResult.translated;
        translationNote = aiResult.note;
      }

      const updated = await repo.updateCarouselImageCaptions(id, {
        caption: nextCaption,
        captionTe: nextTe,
        captionHi: nextHi,
      });

      const images = await repo.listCarouselImages();

      res.json({
        updated,
        images,
        translated,
        translationNote,
        groqConfigured: isGroqConfigured(),
      });
    } catch (err) {
      console.error('Update carousel caption error:', err);
      res.status(500).json({ message: 'Failed to update carousel caption.' });
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const removed = await repo.deleteCarouselImage(id);
      if (!removed) {
        res.status(404).json({ message: 'Carousel image not found.' });
        return;
      }
      await deleteImageFromStorage(removed.publicId);
      const images = await repo.listCarouselImages();
      res.json({ message: 'Image removed successfully.', images });
    } catch (err) {
      console.error('Delete carousel image error:', err);
      res.status(500).json({ message: 'Failed to delete image.' });
    }
  }
);

router.use(
  (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
);

export default router;
