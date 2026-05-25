const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
let ffmpegStaticPath;
try {
    ffmpegStaticPath = require('ffmpeg-static');
} catch (_) {
    ffmpegStaticPath = null;
}
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const { getAllStreams, addStream, updateStream, deleteStream } = require('../db/streams');

const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = await getUserIdByToken(token);
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });
    const user = await getUserById(userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Доступ запрещён' });
    req.user = user;
    next();
};

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const streamsRouter = express.Router();

streamsRouter.get('/', async (req, res) => {
    const streams = await getAllStreams();
    // Return only active streams: live OR scheduled in the future; exclude completed and past
    const now = new Date();
    const active = streams.filter(s => {
        if (s.status === 'completed') return false;
        if (s.isLive) return true;
        try {
            const [h, m] = String(s.time || '00:00').split(':').map(Number);
            const d = new Date(String(s.date) + 'T00:00:00');
            if (!isNaN(h) && !isNaN(m)) d.setHours(h, m, 0, 0);
            return d.getTime() >= now.getTime();
        } catch {
            return true; // if parse fails, do not hide
        }
    });
    res.json(active);
});

streamsRouter.post('/', requireAdmin, async (req, res) => {
    const { title, description, date, time, speaker, status, price, previewUrl } = req.body;
    if (!title || !date || !time) {
        return res.status(400).json({ message: 'Заполните обязательные поля' });
    }
    const stream = await addStream({ title, description: description || '', date, time, speaker: speaker || '', status: status || 'planned', price: price || 0, previewUrl: previewUrl || null });
    res.json(stream);
});

streamsRouter.put('/:id', requireAdmin, async (req, res) => {
    const { title, description, date, time, speaker, status, price, previewUrl } = req.body;
    if (!title || !date || !time) {
        return res.status(400).json({ message: 'Заполните обязательные поля' });
    }
    const stream = await updateStream(parseInt(req.params.id), { title, description: description || '', date, time, speaker: speaker || '', status: status || 'planned', price: price || 0, previewUrl: previewUrl || null });
    res.json(stream);
});

// Upload preview video
streamsRouter.post('/:id/preview', requireAdmin, upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
    const originalExt = path.extname(req.file.originalname || '').toLowerCase() || '.mp4';
    const inFilename = `stream-preview-upload-${req.params.id}-${Date.now()}${originalExt}`;
    const inPath = path.join(uploadsDir, inFilename);
    fs.writeFileSync(inPath, req.file.buffer);

    const outFilename = `stream-preview-${req.params.id}-${Date.now()}.mp4`;
    const outPath = path.join(uploadsDir, outFilename);

    const tryTranscode = () => new Promise((resolve) => {
        const ffBinary = ffmpegStaticPath || 'ffmpeg';
        const ff = spawn(ffBinary, ['-y', '-i', inPath,
            '-c:v', 'libx264', '-preset', 'veryfast', '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '128k', outPath
        ]);
        ff.on('close', (code) => resolve(code === 0));
        ff.on('error', () => resolve(false));
    });

    let previewUrl = '';
    const ok = await tryTranscode();
    if (ok && fs.existsSync(outPath)) {
        // Delete original upload to save space
        try { fs.unlinkSync(inPath); } catch(e) {}
        previewUrl = `/uploads/${outFilename}`;
    } else {
        // Fallback to original file if ffmpeg not available
        previewUrl = `/uploads/${inFilename}`;
    }

    // Update only previewUrl to avoid overwriting other fields
    const { getDb } = require('../db/db');
    const db = getDb();
    await db.run('UPDATE streams SET previewUrl = ? WHERE id = ?', previewUrl, req.params.id);
    const updated = await db.get('SELECT * FROM streams WHERE id = ?', req.params.id);
    res.json(updated);
});

streamsRouter.delete('/:id', requireAdmin, async (req, res) => {
    await deleteStream(parseInt(req.params.id));
    res.json({ ok: true });
});

module.exports = streamsRouter;
