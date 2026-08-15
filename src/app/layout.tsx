import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AtCoder Rating Graph',
  description: '複数ユーザーの AtCoder レーティング推移を比較して表示します。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
