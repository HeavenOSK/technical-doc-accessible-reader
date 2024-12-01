'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

export interface SavedDocument {
  inputText: string;
  generatedText: string;
  savedAt: string;
}

// Save Document
export async function saveDocument(inputText: string, generatedText: string): Promise<void> {
  const document: SavedDocument = {
    inputText,
    generatedText,
    savedAt: new Date().toISOString(),
  };

  try {
    // knowledge/projects/shared/documents ディレクトリに保存
    const saveDir = path.join(process.cwd(), 'knowledge', 'projects', 'shared', 'documents');
    await fs.mkdir(saveDir, { recursive: true });
    
    const fileName = `doc-${Date.now()}.json`;
    await fs.writeFile(
      path.join(saveDir, fileName),
      JSON.stringify(document, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to save document:', error);
    throw new Error('ドキュメントの保存に失敗しました');
  }
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      showWeather: {
        description: 'Show the weather for a given location.',
        parameters: z.object({
          city: z.string().describe('The city to show the weather for.'),
          unit: z
            .enum(['F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          return `Here's the weather for ${city}!`; 
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join(),
      },
    ],
  };
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}
