import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), 'server', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (isImage || isVideo) cb(null, true);
  else cb(new Error('Unsupported file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 30 * 1024 * 1024 } });

router.post('/image', requireAuth, upload.single('file'), (req, res) => {
  const rel = `/uploads/${path.basename(req.file.path)}`;
  res.json({ url: rel });
});

router.post('/video', requireAuth, upload.single('file'), (req, res) => {
  const rel = `/uploads/${path.basename(req.file.path)}`;
  res.json({ url: rel });
});

export default router;



