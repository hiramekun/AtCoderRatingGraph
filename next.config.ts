import type { NextConfig } from 'next';

// GitHub Pages (project pages) は https://<user>.github.io/<repo>/ に配信されるため、
// CI ではリポジトリ名を basePath として渡す。ローカル開発時は空文字。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
