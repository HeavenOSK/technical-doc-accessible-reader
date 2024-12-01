'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { saveDocument } from './actions';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = () => {
    // TODO: ここで技術文書を読みやすい形式に変換する処理を実装
    setPreviewText(inputText);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(previewText);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const handleSave = async () => {
    if (!inputText || !previewText) return;
    
    try {
      setIsSaving(true);
      await saveDocument(inputText, previewText);
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
          <div className="flex-grow overflow-auto border rounded-lg p-2 mb-4 flex justify-center items-center">
            {previewText || '生成されたテキストがここに表示されます'}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleGenerate}>生成</Button>
            <Button className="flex-1" onClick={handleSpeak}>読み上げ</Button>
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
