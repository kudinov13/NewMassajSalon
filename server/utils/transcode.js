const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execFileAsync = util.promisify(execFile);

const uploadsDir = path.join(__dirname, '..', 'uploads');
const hlsDir = path.join(uploadsDir, 'hls');

if (!fs.existsSync(hlsDir)) fs.mkdirSync(hlsDir, { recursive: true });

/**
 * Transcode a video to HLS with multiple quality levels.
 * Returns the URL path to the master.m3u8 playlist.
 * 
 * @param {string} inputFilename - filename in uploads dir (e.g. "video-123.mp4")
 * @returns {Promise<string>} - HLS URL path (e.g. "/uploads/hls/video-123/master.m3u8")
 */
async function transcodeToHLS(inputFilename) {
    const inputPath = path.join(uploadsDir, inputFilename);
    const baseName = path.parse(inputFilename).name;
    const outputDir = path.join(hlsDir, baseName);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const masterPlaylist = path.join(outputDir, 'master.m3u8');

    // Check if already transcoded
    if (fs.existsSync(masterPlaylist)) {
        return `/uploads/hls/${baseName}/master.m3u8`;
    }

    // ffmpeg command: transcode to 3 quality levels with HLS segments
    const args = [
        '-i', inputPath,
        '-filter_complex',
        '[0:v]split=3[v1][v2][v3];' +
        '[v1]scale=w=640:h=360[v1out];' +
        '[v2]scale=w=1280:h=720[v2out];' +
        '[v3]scale=w=1920:h=1080[v3out]',
        // 360p
        '-map', '[v1out]', '-c:v:0', 'libx264', '-x264-params', 'nal-hrd=cbr:force-cfr=1',
        '-b:v:0', '800k', '-maxrate:v:0', '856k', '-bufsize:v:0', '1200k',
        '-preset', 'fast', '-g', '48', '-keyint_min', '48',
        // 720p
        '-map', '[v2out]', '-c:v:1', 'libx264', '-x264-params', 'nal-hrd=cbr:force-cfr=1',
        '-b:v:1', '2500k', '-maxrate:v:1', '2675k', '-bufsize:v:1', '3750k',
        '-preset', 'fast', '-g', '48', '-keyint_min', '48',
        // 1080p
        '-map', '[v3out]', '-c:v:2', 'libx264', '-x264-params', 'nal-hrd=cbr:force-cfr=1',
        '-b:v:2', '5000k', '-maxrate:v:2', '5350k', '-bufsize:v:2', '7500k',
        '-preset', 'fast', '-g', '48', '-keyint_min', '48',
        // Audio: copy for all levels
        '-map', 'a:0', '-c:a:0', 'aac', '-b:a:0', '128k', '-ac', '2',
        '-map', 'a:0', '-c:a:1', 'aac', '-b:a:1', '128k', '-ac', '2',
        '-map', 'a:0', '-c:a:2', 'aac', '-b:a:2', '128k', '-ac', '2',
        // HLS settings
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_playlist_type', 'vod',
        '-hls_flags', 'independent_segments',
        '-hls_segment_type', 'mpegts',
        '-hls_segment_filename', path.join(outputDir, 'stream_%v_%03d.ts'),
        '-master_pl_name', 'master.m3u8',
        '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2',
        path.join(outputDir, 'stream_%v.m3u8'),
    ];

    // Run ffmpeg (can take a while for large files)
    await execFileAsync('ffmpeg', args, {
        timeout: 3600000, // 1 hour max
        maxBuffer: 10 * 1024 * 1024,
    });

    // Verify master playlist exists
    if (!fs.existsSync(masterPlaylist)) {
        throw new Error('HLS transcoding failed: master.m3u8 not created');
    }

    return `/uploads/hls/${baseName}/master.m3u8`;
}

/**
 * Transcode video to web-optimized MP4 (H.264, faststart).
 * Used as fallback or for non-HLS playback.
 * 
 * @param {string} inputFilename - filename in uploads dir
 * @returns {Promise<string>} - URL path to optimized MP4
 */
async function transcodeToWebMP4(inputFilename) {
    const inputPath = path.join(uploadsDir, inputFilename);
    const baseName = path.parse(inputFilename).name;
    const outputFilename = `${baseName}-web.mp4`;
    const outputPath = path.join(uploadsDir, outputFilename);

    if (fs.existsSync(outputPath)) {
        return `/uploads/${outputFilename}`;
    }

    const args = [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-profile:v', 'high',
        '-level', '4.0',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=-2:720',
        '-c:a', 'aac', '-b:a', '128k', '-ac', '2',
        '-movflags', '+faststart',
        '-y',
        outputPath,
    ];

    await execFileAsync('ffmpeg', args, {
        timeout: 3600000,
        maxBuffer: 10 * 1024 * 1024,
    });

    return `/uploads/${outputFilename}`;
}

module.exports = { transcodeToHLS, transcodeToWebMP4 };
