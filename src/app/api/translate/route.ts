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
あなたは技術文書を読み上げやすい日本語に変換するアシスタントです。
以下のガイドラインに従って変換してください：

1. 技術用語は可能な限り分かりやすい日本語で説明する
2. 長い文章は適切な箇所で分割する
3. 箇条書きやコードブロックは文章として自然に読めるように変換する
4. 略語や記号は読み上げやすい形に展開する
5. 文章の構造を維持しながら、より自然な日本語の流れになるよう調整する
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
