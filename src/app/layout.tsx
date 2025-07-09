import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Custom Chat Character',
  description: 'Create your own AI character companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeSetterScript = `
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        if (theme && ['sunset', 'ocean', 'forest'].includes(theme)) {
          document.documentElement.classList.add('theme-' + theme);
        }
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === null || darkMode === 'true') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        console.error('Failed to set theme from localStorage', e);
      }
    })();
  `;

  // Generate a timestamp for cache busting.
  // Note: In a real app, you might want this to be a build-time constant
  // or a hash of the file if the favicon changes, to avoid changing it on every request
  // if the component re-renders server-side frequently without actual favicon changes.
  // However, for explicitly trying to break a stubborn cache, a dynamic value is fine for now.
  const faviconVersion = new Date().getTime();

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSetterScript }} />
        <link rel="icon" href={`/favicon.ico?v=${faviconVersion}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
