import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface UploadedImageResult {
  url: string;
  publicId: string;
  storage: 'cloudinary' | 'local';
}

export function isCloudinaryConfigured(): boolean {
  return hasCloudinaryConfig;
}

export async function uploadImageToStorage(
  buffer: Buffer,
  mimetype: string,
  originalName: string
): Promise<UploadedImageResult> {
  if (hasCloudinaryConfig) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mallikarjuna_sugarcane_clients',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            storage: 'cloudinary',
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local disk storage fallback when Cloudinary credentials are not provided
  const extFromName = path.extname(originalName).toLowerCase();
  const extFromMime =
    mimetype === 'image/png'
      ? '.png'
      : mimetype === 'image/webp'
      ? '.webp'
      : '.jpg';
  const ext = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extFromName)
    ? extFromName
    : extFromMime;

  const uniqueName = `carousel_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, uniqueName);
  await fs.promises.writeFile(targetPath, buffer);

  return {
    url: `/uploads/${uniqueName}`,
    publicId: `local:${uniqueName}`,
    storage: 'local',
  };
}

export async function deleteImageFromStorage(publicId: string): Promise<void> {
  if (!publicId || publicId.startsWith('seed:')) {
    return;
  }

  if (publicId.startsWith('local:')) {
    const filename = publicId.replace('local:', '');
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => {});
    }
    return;
  }

  if (hasCloudinaryConfig) {
    await cloudinary.uploader.destroy(publicId).catch((err) => {
      console.error('Cloudinary destroy error:', err);
    });
  }
}
