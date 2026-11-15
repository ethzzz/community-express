import { Providers } from './providers';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '社区',
  description: 'Express + Next.js 社区项目',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
