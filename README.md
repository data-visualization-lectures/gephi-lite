# Gephi Lite

Gephi Lite はネットワークとグラフを可視化・探索するための、無料のオープンソースWebアプリケーションです。デスクトップ版の [Gephi](https://gephi.org/) の軽量Web版です。

**[gephi.org/gephi-lite](https://gephi.org/gephi-lite)** で試すことができます。

本プロジェクトは活発に開発中のため、機能は迅速に進化する可能性があります。バグ報告や機能リクエストは [issues board](https://github.com/gephi/gephi-lite/issues) でお願いします。

## ライセンス

Gephi Lite のソースコードは [GNU General Public License v3](http://www.gnu.org/licenses/gpl.html) の下で配布されています。

## リポジトリ構成

コードベースは [monorepo](https://en.wikipedia.org/wiki/Monorepo) として構成されています：

- **[packages/gephi-lite](packages/gephi-lite)** - Gephi Lite アプリケーション本体
- **[packages/sdk](packages/sdk) ([`@gephi/gephi-lite-sdk` on NPM](https://www.npmjs.com/package/@gephi/gephi-lite))** - コア型とユーティリティ
- **[packages/broadcast](packages/broadcast) ([`@gephi/gephi-lite-broadcast` on NPM](https://www.npmjs.com/package/@gephi/gephi-lite-sdk))** - 別タブ・フレームから Gephi Lite を制御するためのTypeScript ヘルパー

## ローカルでの実行

Gephi Lite は [TypeScript](https://www.typescriptlang.org/) と [React](https://react.dev/) で記述されたWebアプリケーションです。スタイルは [SASS](https://sass-lang.com/) で書かれており、[Bootstrap v5](https://getbootstrap.com/) に基づいています。

グラフレンダリングに [sigma.js](https://www.sigmajs.org/) を、グラフモデルとグラフアルゴリズムに [graphology](https://graphology.github.io/) を使用しています。[Vite](https://vitejs.dev/) でビルドされています。

### 必要な環境

- [Node.js](https://nodejs.org/en) の最新バージョン
- [NPM](https://www.npmjs.com/)

### ローカルインストール

#### ステップ1: 依存関係のインストール

```bash
npm install --legacy-peer-deps
```

**注**: `graphology` のバージョン競合を解決するため、`--legacy-peer-deps` フラグが必要です。

#### ステップ2: 開発サーバーの起動

```bash
npm start
```

開発モードでアプリケーションが起動します。
ブラウザで [http://localhost:5173/gephi-lite](http://localhost:5173/gephi-lite) を開いて確認できます。

ファイルを編集すると、ページが自動的にリロードされます。
コンソールにはリント エラーが表示されます。

### テストの実行

#### ユニットテスト

```bash
npm test
```

インタラクティブな watch モードでテストランナーを起動します。

#### E2E テスト（Playwright）

まず、ブラウザをインストールします：

```bash
npx playwright install
```

その後、E2E テストを実行します：

```bash
npm run test:e2e
```

プロジェクトのスタイル・レイアウトを変更した場合は、`/e2e/*.spec.ts-snapshots/` に保存されたスクリーンショットを削除してから、E2E テストを再度実行してスクリーンショットを再生成してください。

## ビルド

### ローカルビルド（本番用）

```bash
npm run build
```

本番用にアプリケーションを `build` フォルダにビルドします。

- React は本番モードで正しくバンドルされます
- ビルドは最小化されファイル名にハッシュが付きます
- Gephi Lite はデプロイ可能な状態になります

**ビルド結果**:
- `build/index.html` - HTML エントリーポイント
- `build/assets/` - バンドルされた JavaScript・CSS・フォント

### Vercel でのリモートビルド

本プロジェクトは Vercel での自動ビルド・デプロイに対応しています。

#### ビルドコマンド

`vercel.json` で定義されているビルドコマンド：

```bash
npm install && npx preconstruct build && npm run build --workspace=@gephi/gephi-lite
```

#### デプロイフロー

1. コードを GitHub にプッシュ
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Vercel が自動的に以下を実行
   - 依存関係のインストール
   - SDK・Broadcast パッケージのビルド（Preconstruct）
   - メインアプリケーションのビルド

3. 完了後、`packages/gephi-lite/build/` が本番環境にデプロイされます

#### 環境変数

GitHub との連携が必要な場合、以下の環境変数を Vercel のダッシュボードで設定してください：

```
VITE_GITHUB_PROXY=https://your-domain.com
```

**注**: 詳細は [デプロイメント](#デプロイメント) セクションを参照してください。

## Docker

Docker を使用すると、NPM や依存関係をホストシステムにインストールせずに、制御された環境で Gephi Lite をビルド・実行できます。

### 開発用 Docker Compose

このリポジトリの Docker Compose は **ローカル開発用** です。

#### 前提条件

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/linux/) プラグイン（Docker Desktop 2023年7月以降は統合）

#### コマンド

イメージをビルド：
```bash
docker compose build
```

プリビルドイメージで起動：
```bash
docker compose up
```

コンテナを停止してリソースを解放：
```bash
docker compose down
```

### 本番用 Dockerfile

このリポジトリの Dockerfile は **本番環境用** です。
アプリケーションがビルドされ、nginx で提供されます。

ビルド：
```bash
export BASE_URL="./"
npm run build
```

Docker イメージをビルド：
```bash
docker build -f Dockerfile -t gephi-lite .
```

コンテナを作成・実行：
```bash
docker run -p 80:80 gephi-lite
```

### カスタム NPM コマンド

Docker コンテナ内でシェルを起動：
```bash
docker compose run --entrypoint sh gephi-lite
```

これで上記のすべての NPM コマンドを実行できます。

## デプロイメント

ユーザーが GitHub にデータを同期できるようにするため、Gephi Lite は CORS の問題を回避するためにリバースプロキシが必要です。ローカル開発では、[`http-proxy-middleware`](https://github.com/gephi/gephi-lite/blob/main/vite.config.js) を使用しています。

### デプロイ手順

1. ビルド前に環境変数を設定：

```bash
export VITE_GITHUB_PROXY=mydomain.for.github.auth.proxy.com
npm install
npm run build
```

2. `build` ディレクトリをサーバーにデプロイ

#### Gephi.org での設定例

[gephi.org/gephi-lite](https://gephi.org/gephi-lite) では、以下の設定を使用しています：

```
VITE_GITHUB_PROXY: "https://githubapi.gephi.org"
```

NGINX リバースプロキシ設定例：

```nginx
server {
    listen 443 ssl;
    server_name githubapi.gephi.org;

    ssl_certificate /etc/letsencrypt/live/githubapi.gephi.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/githubapi.gephi.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

   location /login {
     add_header Access-Control-Allow-Origin "https://gephi.org";
     add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
     add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, user-agent";
     if ($request_method = OPTIONS) {
        return 204;
     }
     proxy_pass https://github.com/login;
   }

   location / {
     return 404;
   }
}
```

**注**: `server_name` と SSL 設定、`Access-Control-Allow-Origin` の値を環境に合わせて変更してください。

## トラブルシューティング

### unplugin-typia のエラーが出る場合

開発サーバー起動時に `unplugin-typia` 関連のエラーが表示される場合は、以下を実行：

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### ビルドエラー

本番ビルドで問題が生じた場合：

```bash
npm run build
```

を実行して、エラーメッセージを確認してください。
