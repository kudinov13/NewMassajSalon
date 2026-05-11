const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getDb } = require('../db/db');

const bowlsRouter = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

const canEditBowls = async (req, res, next) => {
  const token = req.cookies.token;
  const userId = await getUserIdByToken(token);
  if (!userId) return res.status(401).json({ message: 'Не авторизован' });
  const user = await getUserById(userId);
  if (!user || (!user.isAdmin && !user.isBowlsSpecialist)) return res.status(403).json({ message: 'Доступ запрещён' });
  req.user = user;
  next();
};

bowlsRouter.get('/audio', async (req, res) => {
  const row = await getDb().get('SELECT value FROM settings WHERE key = ?', 'bowlsAudioUrl');
  res.json({ url: row?.value || '' });
});

bowlsRouter.post('/audio', canEditBowls, upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
  const ext = path.extname(req.file.originalname || '').toLowerCase() || '.mp3';
  const filename = `bowls-${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, req.file.buffer);
  const url = `/uploads/${filename}`;
  await getDb().run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'bowlsAudioUrl', url);
  res.json({ url });
});

module.exports = bowlsRouter;
