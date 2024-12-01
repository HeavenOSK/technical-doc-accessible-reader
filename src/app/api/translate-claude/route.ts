import Anthropic from '@anthropic-ai/sdk';
import { StreamingTextResponse } from 'ai';

// Anthropic クライアントの初期化
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // リクエストボディからテキストを取得
    const { text } = await req.json();

    if (!text) {
      return new Response('テキストが提供されていません', { status: 400 });
    }

    // Anthropic API を使用してストリーミングレスポンスを生成
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'user',
          content: `
以下のルールに従って、技術文書を読み上げ可能なアクセシブルな日本語に変換してください：

# Rules
1. 基本的に文書は原文ママで翻訳する。
2. 技術文書内のコードブロックは、「\`\`\`Xxx 言語のコードブロック: \nこのコードブロックでは...」という書き出しでコードブロックの内容を文章で説明する内容に変換してマークダウン記法のバッククオーとで囲む。元のコードブロックの挿入は変換後の文書には含めない。
3. 画像や図表は、「画像(or図表) {title} この画像は...」という書き出しで画像や図表の内容を文章で説明する内容に変換する。元の画像や図表の挿入は変換後の文書には含めない。

変換対象の文書:
${text}`,
        }
      ],
      stream: true,
      max_tokens: 4096,
    });

    // Anthropic のストリームを ReadableStream に変換
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    // StreamingTextResponse を使用してストリーミングレスポンスを返す
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Translation error:', error);
    return new Response('翻訳処理中にエラーが発生しました', { status: 500 });
  }
}
