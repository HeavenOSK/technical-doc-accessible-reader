import OpenAI from 'openai';
import { StreamingTextResponse } from 'ai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // リクエストボディからテキストを取得
    const { text } = await req.json();

    if (!text) {
      return new Response('テキストが提供されていません', { status: 400 });
    }

    // OpenAI API を使用してストリーミングレスポンスを生成
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `
あなたは技術文書を読み上げ可能なアクセシブルな日本語に変換する翻訳アシスタントです。
ユーザーから受け取った技術文書を以下のルールに従って変換してください：

# Rules
1. 基本的に文書は原文ママで翻訳する。
2. 技術文書内のコードブロックは、「\`\`\`Xxx 言語のコードブロック: \nこのコードブロックでは...」という書き出しでコードブロックの内容を文章で説明する内容に変換してマークダウン記法のバッククオーとで囲む。元のコードブロックの挿入は変換後の文書には含めない。
3. 画像や図表は、「画像(or図表) {title} この画像は...」という書き出しで画像や図表の内容を文章で説明する内容に変換する。元の画像や図表の挿入は変換後の文書には含めない。

`
        },
        {
          role: 'user',
          content: text,
        }
      ],
      stream: true,
    });

    // OpenAI のストリームを ReadableStream に変換
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
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
