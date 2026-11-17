import '@fontsource-variable/fraunces';
import '@fontsource-variable/instrument-sans';
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '围炉 · 一个能聊事的社区',
    template: '%s · 围炉',
  },
  description: '围炉，一个用 Express + Next.js 搭建的社区。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
