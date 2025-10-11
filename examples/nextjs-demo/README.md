# Snowflix Next.js Demo

This is a demo of the `videojs-snowflix` plugin integrated with Next.js 15 (App Router).

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Run the development server:**

```bash
npm run dev
```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Key Integration Points

### VideoPlayer Component
- Located in `components/VideoPlayer.tsx`
- Uses `'use client'` directive for client-side rendering
- Dynamically imports the Snowflix plugin to prevent SSR issues
- Properly handles Video.js player lifecycle (initialization and cleanup)

### Page Component
- Located in `app/page.tsx`
- Uses `dynamic()` from Next.js to load VideoPlayer with `ssr: false`
- Provides a loading placeholder during hydration

### CSS Imports
The component imports both Video.js and Snowflix CSS:
```typescript
import 'video.js/dist/video-js.css';
import 'videojs-snowflix/dist/videojs-snowflix.css';
```

## Plugin Options

### Video.js Options
```typescript
{
  autoplay: false,
  controls: true,
  responsive: true,
  fluid: true,
  sources: [{
    src: 'video-url.mp4',
    type: 'video/mp4'
  }]
}
```

### Snowflix Options
```typescript
{
  float: 'top-right',  // Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  lang: 'en',          // Language code
  isMuted: false       // Initial mute state
}
```

## Technologies

- **Next.js 15** - App Router with Turbopack
- **React 19** - Latest React version
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Video.js 8** - Video player
- **videojs-snowflix** - Accessibility filters plugin

## Learn More

- [Snowflix Plugin Repository](https://github.com/ssv445/videojs-snowflix-plugin)
- [Video.js Documentation](https://videojs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
