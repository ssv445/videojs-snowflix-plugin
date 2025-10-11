'use client';

import dynamic from 'next/dynamic';

// Dynamically import VideoPlayer with SSR disabled
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-gray-200 animate-pulse rounded-lg" />,
});

export default function Home() {
  // Example video options
  // IMPORTANT: Video must be served with CORS headers for WebGL filters to work
  const videoOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    html5: {
      vhs: {
        overrideNative: true
      },
      nativeVideoTracks: false,
      nativeAudioTracks: false,
      nativeTextTracks: false
    },
    sources: [
      {
        // Using HLS test stream from Mux (CORS-enabled)
        src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        type: 'application/x-mpegURL',
      },
    ],
  };

  // Snowflix accessibility plugin options
  const snowflixOptions = {
    float: 'top-right' as const,
    lang: 'en',
    isMuted: false,
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Snowflix Plugin Demo
          </h1>
          <p className="text-xl text-gray-300">
            Video.js Accessibility Plugin with Visual Effect Filters
          </p>
          <div className="flex gap-4 justify-center text-sm text-gray-400">
            <span>🎬 Billboard</span>
            <span>📺 TV</span>
            <span>🔦 Flashlight</span>
            <span>🎨 Desaturation</span>
            <span>🖼️ Toon</span>
            <span>🌈 RGB</span>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
          <VideoPlayer options={videoOptions} snowflixOptions={snowflixOptions} />
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4 text-gray-300">
          <h2 className="text-2xl font-bold text-white">How to Use</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Look for the Snowflix accessibility button in the video player controls</li>
            <li>Click it to open the filter panel</li>
            <li>Try different visual effect filters to enhance your viewing experience</li>
            <li>All filters use WebGL/Three.js for real-time video processing</li>
          </ul>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Available Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-700 p-3 rounded">
                <strong>Billboard:</strong> 3D billboard effect
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <strong>TV:</strong> Vintage TV screen
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <strong>Flashlight:</strong> Spotlight focus
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <strong>Desaturation:</strong> Color adjustment
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <strong>Toon:</strong> Cartoon shader
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <strong>RGB:</strong> Color channel effects
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p>Built with Next.js 15 + Video.js 8 + Three.js</p>
          <p>
            <a
              href="https://github.com/ssv445/videojs-snowflix-plugin"
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
