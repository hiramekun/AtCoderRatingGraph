# AtCoder Rating Graph

複数ユーザーの AtCoder レーティング推移を、AtCoder の色帯（灰・茶・緑…）を背景に重ねて比較できる Web アプリです。

**https://hiramekun.github.io/AtCoderRatingGraph/**

![image](https://user-images.githubusercontent.com/20180425/79305365-3d2ffe00-7f2e-11ea-8626-90e717293688.png)

## 機能

- AtCoder ID を複数入力して「比較する」を押すと、各ユーザーのレーティング推移を 1 つのグラフに重ねて表示
- 開始日・終了日、または「全期間 / 直近1年 / 直近3年 / 直近5年」で表示期間を絞り込み
- 存在しない ID など、取得に失敗したユーザーはエラーとして表示し、他のユーザーのグラフはそのまま描画

## 技術構成

- TypeScript / React 19 / Next.js 16 (App Router, `output: 'export'` による静的書き出し)
- グラフ描画: [Recharts](https://recharts.org/)。レート帯の背景色・目盛り・罫線は AtCoder 公式のレーティンググラフに合わせ、
  折れ線とマーカーだけをユーザーごとに色分けしています。
- データ取得: AtCoder の `/users/<user>/history/json`。atcoder.jp は CORS ヘッダを返さずブラウザから直接取得できないため、
  [AtCoder Problems](https://kenkoooo.com/atcoder/) が公開しているプロキシ (`https://kenkoooo.com/atcoder/proxy/...`) を経由しています。
- サーバー処理は無く、すべてブラウザ上で完結する静的サイトです。

## 開発

Node.js 20 以上が必要です。

```bash
npm ci
npm run dev
```

http://localhost:3000 で確認できます。その他のコマンド:

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` は `out/` に静的ファイルを書き出します。GitHub Pages と同じパス構成で確認したい場合は
`NEXT_PUBLIC_BASE_PATH=/AtCoderRatingGraph npm run build` としてください。

## デプロイ

`master` へ push されると [GitHub Actions](.github/workflows/deploy.yml) がビルドして GitHub Pages へ自動デプロイします。
Pull Request では lint / typecheck / build のみ実行し、デプロイは行いません。

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する必要があります。

## Jupyter Notebook 版（旧実装）

移行前の実装として `compare_rating.ipynb` を残しています。Python 3.6 以上で以下を実行してください。

```bash
pip install -r requirements.txt
jupyter lab
```

`users` のリストを書き換えて全セルを実行するとグラフが表示されます。
