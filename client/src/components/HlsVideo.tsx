import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoProps {
  hlsUrl?: string | null;
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  muted?: boolean;
  style?: React.CSSProperties;
}

const HlsVideo: React.FC<HlsVideoProps> = ({
  hlsUrl,
  src,
  poster,
  className,
  controls = true,
  autoPlay = false,
  playsInline = false,
  muted = false,
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const url = hlsUrl || src;
    const isHls = url.endsWith('.m3u8') || !!hlsUrl;

    // Prefer hls.js over native HLS — hls.js respects CSS object-fit,
    // native HLS players often stretch video
    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        startLevel: -1,
        capLevelToPlayerSize: true,
        abrEwmaDefaultEstimate: 1000000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('[HLS] Fatal error, falling back to direct:', data.type);
          hls.destroy();
          video.src = src;
        }
      });

      return () => {
        hls.destroy();
      };
    }

    // Native HLS support (Safari, iOS) — fallback only
    if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    // Fallback: direct video URL (MP4)
    video.src = src;
  }, [hlsUrl, src]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      playsInline={playsInline}
      muted={muted}
      poster={poster}
      preload="metadata"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
};

export default HlsVideo;
