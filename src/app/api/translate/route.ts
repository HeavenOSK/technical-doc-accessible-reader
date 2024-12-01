import OpenAI from 'openai';
import { StreamingTextResponse } from 'ai';
import { outdent } from 'outdent';

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
          content: outdent`あなたは技術文書に対して、読み上げ可能な文章を作成するアクセシビリティの専門家です。
          # Objectives
          - あなたの仕事は、ユーザーから受け取った技術文書を、そのまま読み上げると人間にとって理解が難しい部分を読み上げても問題なく理解できるように、読み上げ用の文章を作成することです。
    
          # Rules
          1. あなたは元の技術文書の構成を変更してはいけません。そのままの構成で変換を加えた上で全文を返します。
          2. 基本的には原文を保ちますが、コードブロックのみ読み上げ用の文章に変換してください。
          3. 読み上げ用の文章は、「〇〇(プログラミング言語)のコードブロック: \\nこのコードブロックでは...」という書き出しスタイルで統一します。
          4. 成果物の文書以外のコメントは不要です。
    
          # Example
          ## UserInput
          Next.js で開発中のページを公開したくない状況がありました。
    
          Custom Page Extension を利用してリリースに含めるかどうかをコントロールすることができたので、その方法を紹介します。
          
          # TL;DR
          - Custom Page Extension で \`page.tsx\` を設定する
          - 開発用に \`next dev\` 時の Custom Page Extension の制限を緩くする
    
          # next.config.js で Custom Page Extensions を設定する
          以下のように設定すると、ビルド対象を \`page.tsx\` の拡張子のファイルに限定することができます。
    
          \`\`\`js
          module.exports = {
            pageExtensions: ['page.tsx'],
          }
          \`\`\`
          ## Your Output
                Next.js で開発中のページを公開したくない状況がありました。
    
          Custom Page Extension を利用してリリースに含めるかどうかをコントロールすることができたので、その方法を紹介します。
          
          # TL;DR
          - Custom Page Extension で \`page.tsx\` を設定する
          - 開発用に \`next dev\` 時の Custom Page Extension の制限を緩くする
    
          # next.config.js で Custom Page Extensions を設定する
          以下のように設定すると、ビルド対象を \`page.tsx\` の拡張子のファイルに限定することができます。
    
          \`\`\`
          JavaScript のコードブロック：
          このコードブロックでは、module.exports に page.tsx を含む配列を pageExtensions として設定しています。
          \`\`\`
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
