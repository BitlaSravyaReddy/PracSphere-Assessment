// @ts-ignore - Next.js handles CSS imports
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  const root = document.documentElement;
                  root.setAttribute('data-theme', theme);
                  root.classList.remove('light', 'dark');
                  root.classList.add(theme);
                  const isDark = theme === 'dark';
                  root.style.setProperty('--background', isDark ? '#0a0a0a' : '#ffffff');
                  root.style.setProperty('--foreground', isDark ? '#ededed' : '#171717');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
