const { transcodeToHLS } = require('./utils/transcode');
const { initDb, getDb } = require('./db/db');
const path = require('path');

(async () => {
    try {
        await initDb();
        const db = getDb();
        const videos = await db.all('SELECT id, videoUrl FROM course_videos WHERE hlsUrl IS NULL');
        console.log('Found', videos.length, 'videos to transcode');
        for (const v of videos) {
            const filename = path.basename(v.videoUrl);
            console.log('Transcoding', v.id, filename);
            try {
                const hlsUrl = await transcodeToHLS(filename);
                await db.run('UPDATE course_videos SET hlsUrl = ? WHERE id = ?', hlsUrl, v.id);
                console.log('Done', v.id, hlsUrl);
            } catch(e) {
                console.error('Failed', v.id, e.message);
            }
        }
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
