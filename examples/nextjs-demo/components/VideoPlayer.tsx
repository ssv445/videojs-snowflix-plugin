'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix/dist/videojs-snowflix.css';

interface VideoPlayerProps {
  options?: {
    autoplay?: boolean;
    controls?: boolean;
    responsive?: boolean;
    fluid?: boolean;
    sources?: Array<{
      src: string;
      type: string;
    }>;
  };
  snowflixOptions?: {
    float?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    lang?: string;
    targetId?: string;
    isMuted?: boolean;
  };
}

export default function VideoPlayer({
  options = {},
  snowflixOptions = {}
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [pluginLoaded, setPluginLoaded] = useState(false);

  // Load plugin dynamically - ensure videojs is on window first
  useEffect(() => {
    if (typeof window !== 'undefined' && !pluginLoaded) {
      // Make sure videojs is available globally before loading plugin
      if (!(window as any).videojs) {
        (window as any).videojs = videojs;
      }

      import('videojs-snowflix').then(() => {
        console.log('Snowflix plugin module loaded');
        setPluginLoaded(true);
      }).catch((err) => {
        console.error('Failed to load Snowflix plugin:', err);
      });
    }
  }, [pluginLoaded]);

  useEffect(() => {
    // Make sure Video.js player is only initialized once and plugin is loaded
    if (!playerRef.current && videoRef.current && pluginLoaded) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        crossOrigin: 'anonymous', // Required for WebGL texture creation
        ...options,
      }));

      // Initialize Snowflix plugin after player is ready
      player.ready(() => {
        // Wait a bit to ensure plugin registration is complete
        setTimeout(() => {
          if (typeof (player as any).snowflix === 'function') {
            (player as any).snowflix(snowflixOptions);
            console.log('Snowflix plugin initialized successfully');
          } else {
            console.error('Snowflix plugin not available on player instance');
          }
        }, 100);
      });
    }
  }, [options, snowflixOptions, pluginLoaded]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}
