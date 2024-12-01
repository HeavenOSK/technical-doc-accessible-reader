# Technical Document Accessible Reader

技術文書の読み上げテキストを生成するデモアプリケーションです。

## 概要

このプロジェクトは、技術文書をより分かりやすい読み上げテキストに変換するデモンストレーションを提供します。OpenAI APIを活用して、技術的な内容をよりアクセシブルな形式に変換します。

## 技術スタック

- [Next.js 14](https://nextjs.org/)
- [OpenAI SDK](https://platform.openai.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## セットアップ

1. リポジトリのクローン:
```bash
git clone https://github.com/HeavenOSK/technical-doc-accessible-reader.git
cd technical-doc-accessible-reader
```

2. 依存関係のインストール:
```bash
npm install
# または
pnpm install
```

3. 環境変数の設定:
- `.env.example`ファイルを`.env`にコピー
- OpenAI APIキーを設定:
```
OPENAI_API_KEY=your_api_key_here
```

## 開発サーバーの起動

開発サーバーを起動するには、以下のコマンドを実行します：

```bash
npm run dev
# または
pnpm dev
```

[http://localhost:3000](http://localhost:3000)をブラウザで開いて、アプリケーションにアクセスできます。
