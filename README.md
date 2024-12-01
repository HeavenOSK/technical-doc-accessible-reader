# Technical Document Accessible Reader

技術文書の読み上げテキストを生成するデモアプリケーションです。

## 概要

このプロジェクトは、技術文書をより分かりやすい読み上げテキストに変換するデモンストレーションを提供します。OpenAI APIとAnthropicのClaude APIを活用して、技術的な内容をよりアクセシブルな形式に変換します。

## 機能

- 技術文書の読み上げテキスト生成
- OpenAIとClaude Sonnetモデルの切り替え機能
- 生成されたテキストの読み上げ機能
- ドキュメントの保存と履歴管理
- 選択したモデルの設定保存

## 技術スタック

- [Next.js 14](https://nextjs.org/)
- [OpenAI SDK](https://platform.openai.com/)
- [Anthropic Claude SDK](https://www.anthropic.com/)
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
- 必要なAPIキーを設定:
```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 開発サーバーの起動

開発サーバーを起動するには、以下のコマンドを実行します：

```bash
npm run dev
# または
pnpm dev
```

[http://localhost:3000](http://localhost:3000)をブラウザで開いて、アプリケーションにアクセスできます。

## 使用方法

1. 画面上部のボタンでOpenAIまたはClaudeモデルを選択
2. 左側のパネルに技術文書を入力
3. 「生成」ボタンをクリックして読み上げテキストを生成
4. 「読み上げ」ボタンで生成されたテキストを音声で確認
5. 「保存」ボタンでドキュメントを保存

選択したモデルの設定は自動的に保存され、ブラウザを再起動しても維持されます。
