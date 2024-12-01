'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SavedDocument {
  inputText: string;
  generatedText: string;
  savedAt: string;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputText) return;
    
    try {
      setIsGenerating(true);
      setPreviewText(''); // リセット

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('翻訳リクエストに失敗しました');
      }

      // レスポンスをストリームとして読み込む
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ストリームの読み込みに失敗しました');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 受信したチャンクをデコードして表示テキストに追加
        const chunk = decoder.decode(value, { stream: true });
        setPreviewText((prev) => prev + chunk);
        setIsGenerating(false);
      }

    } catch (error) {
      console.error('生成エラー:', error);
      alert('テキストの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(previewText);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    if (!inputText || !previewText) return;
    
    try {
      setIsSaving(true);
      const document: SavedDocument = {
        inputText,
        generatedText: previewText,
        savedAt: new Date().toISOString(),
      };

      // 既存のドキュメントを取得
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      // 新しいドキュメントを追加
      savedDocs.push(document);
      // 保存
      localStorage.setItem('documents', JSON.stringify(savedDocs));
      
      alert('ドキュメントを保存しました');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">技術文書読み上げアシスタント</h1>
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
        {/* 左側：入力エリア */}
        <div className="border rounded-lg p-4">
          <textarea
            className="w-full h-full p-2 border rounded-lg resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="ここに技術文書を入力してください..."
          />
        </div>

        {/* 右側：プレビューエリア */}
        <div className="border rounded-lg p-4 flex flex-col">
          <div className="flex-grow overflow-auto border rounded-lg p-2 mb-4">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse">生成中...</div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {previewText || '生成されたテキストがここに表示されます'}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleGenerate}
              disabled={isGenerating || !inputText}
            >
              {isGenerating ? '生成中...' : '生成'}
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSpeak}
              disabled={isGenerating || !previewText}
            >
              読み上げ
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSave}
              disabled={isSaving || !inputText || !previewText}
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
