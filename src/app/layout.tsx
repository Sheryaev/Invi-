import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Инви — обзор портфеля',
  description: 'Аналитический дашборд инвестиционного портфеля',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/app-icon.png" />
        {/* Set theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var saved = localStorage.getItem('invest_theme');
            var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.dataset.theme = theme;
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
