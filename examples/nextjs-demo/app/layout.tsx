import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snowflix Plugin Demo - Video.js Accessibility',
  description: 'Demo of videojs-snowflix plugin with visual effect filters for enhanced video accessibility',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
