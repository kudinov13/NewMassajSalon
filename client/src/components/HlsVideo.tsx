import React, { useEffect, useRef, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const video = videoRef.current;
    if (!video) return;

    const url = hlsUrl || src;
    const isHls = url.endsWith('.m3u8') || !!hlsUrl;

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

    if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    video.src = src;
  }, [hlsUrl, src, isVisible]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
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
    </div>
  );
};

export default HlsVideo;
