import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { connectDatabase } from './src/server/config/db.ts';
import authRoutes from './src/server/routes/authRoutes.ts';
import carouselRoutes from './src/server/routes/carouselRoutes.ts';
import clientRoutes from './src/server/routes/clientRoutes.ts';
import dashboardRoutes from './src/server/routes/dashboardRoutes.ts';
import expenditureRoutes from './src/server/routes/expenditureRoutes.ts';
import inquiryRoutes from './src/server/routes/inquiryRoutes.ts';
import transactionRoutes from './src/server/routes/transactionRoutes.ts';

dotenv.config();

async function startServer() {
  await connectDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Serve local uploaded carousel images when running without Cloudinary
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Prevent browser/proxy caching on sensitive owner API endpoints
  app.use(
    [
      '/api/auth',
      '/api/dashboard',
      '/api/clients',
      '/api/transactions',
      '/api/expenditures',
    ],
    (_req, res, next) => {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      );
      res.setHeader('Pragma', 'no-cache');
      next();
    }
  );

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/expenditures', expenditureRoutes);
  app.use('/api/carousel', carouselRoutes);
  app.use('/api/inquiries', inquiryRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Global error handler for clean, non-leaking API error responses
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) {
      next(err);
      return;
    }

    if (err instanceof multer.MulterError) {
      res.status(400).json({
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Uploaded file is too large (max 8 MB).'
            : 'Invalid file upload request.',
      });
      return;
    }

    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status?: number }).status === 400
    ) {
      res.status(400).json({ message: 'Malformed JSON request body.' });
      return;
    }

    const status =
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      typeof (err as { status?: unknown }).status === 'number'
        ? (err as { status: number }).status
        : 500;

    if (status < 500 && err instanceof Error) {
      res.status(status).json({ message: err.message });
      return;
    }

    console.error('Unhandled API error:', err);
    res.status(500).json({ message: 'An unexpected server error occurred.' });
  });

  // Mount Vite middleware in development, or serve static dist/ in production
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
