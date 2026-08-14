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

    // Native HLS support (Safari, iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    // HLS.js for other browsers
    if (Hls.isSupported() && (url.endsWith('.m3u8') || hlsUrl)) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        startLevel: -1, // auto quality
        capLevelToPlayerSize: true,
        abrEwmaDefaultEstimate: 1000000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }

    // Fallback: direct video URL
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
