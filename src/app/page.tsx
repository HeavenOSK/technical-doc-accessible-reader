'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface SavedDocument {
  inputText: string;
  generatedText: string;
  savedAt: string;
}

type TabType = 'input' | 'preview' | 'saved';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);

  useEffect(() => {
    // コンポーネントマウント時に localStorage からデータを読み込む
    try {
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      setSavedDocuments(savedDocs);
    } catch (error) {
      console.error('保存データの読み込みに失敗しました:', error);
    }

    // コンポーネントのクリーンアップ時に読み上げを停止
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

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
      // 既に読み上げ中の場合は停止
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(previewText);
      utterance.lang = 'ja-JP';
      
      // 読み上げ終了時のハンドラ
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      // 読み上げ開始
      setIsSpeaking(true);
      speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
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

      // 新しいドキュメントを追加
      const updatedDocs = [...savedDocuments, document];
      setSavedDocuments(updatedDocs);
      // localStorage に保存
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
      
      alert('ドキュメントを保存しました');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDocument = (doc: SavedDocument) => {
    setInputText(doc.inputText);
    setPreviewText(doc.generatedText);
    setActiveTab('input');
  };

  return (
    <main className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">技術文書読み上げアシスタント</h1>
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
        {/* 左側：タブ付きパネル */}
        <div className="border rounded-lg flex flex-col overflow-hidden">
          {/* タブヘッダー（固定） */}
          <div className="flex border-b h-12 flex-shrink-0">
            <button
              className={`flex-1 px-4 py-2 text-center ${
                activeTab === 'input'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('input')}
            >
              入力
            </button>
            <button
              className={`flex-1 px-4 py-2 text-center ${
                activeTab === 'preview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              プレビュー
            </button>
            <button
              className={`flex-1 px-4 py-2 text-center ${
                activeTab === 'saved'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              保存済み
            </button>
          </div>
          
          {/* タブコンテンツ（スクロール可能） */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'input' ? (
              <textarea
                className="w-full h-full p-4 resize-none border-none outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ここに技術文書を入力してください..."
              />
            ) : activeTab === 'preview' ? (
              <div className="p-4 prose prose-sm max-w-none">
                <ReactMarkdown className="markdown">{inputText || '入力テキストがありません'}</ReactMarkdown>
              </div>
            ) : (
              <div className="p-4">
                {savedDocuments.length === 0 ? (
                  <p className="text-gray-500">保存されたドキュメントはありません</p>
                ) : (
                  <div className="space-y-4">
                    {savedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="border rounded p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleLoadDocument(doc)}
                      >
                        <p className="font-medium mb-2">
                          {doc.inputText.slice(0, 100)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          保存日時: {new Date(doc.savedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右側：生成結果エリア */}
        <div className="border rounded-lg flex flex-col overflow-hidden">
          {/* コンテンツエリア（スクロール可能） */}
          <div className="flex-1 overflow-auto p-4">
            <div className="prose prose-sm max-w-none">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse">生成中...</div>
                </div>
              ) : (
                <ReactMarkdown className="markdown">
                  {previewText || '生成されたテキストがここに表示されます'}
                </ReactMarkdown>
              )}
            </div>
          </div>
          
          {/* ボタングループ（固定） */}
          <div className="flex gap-2 p-4 border-t bg-white flex-shrink-0">
            <Button 
              className="flex-1" 
              onClick={handleGenerate}
              disabled={isGenerating || !inputText}
            >
              {isGenerating ? '生成中...' : '生成'}
            </Button>
            <Button 
              className="flex-1" 
              onClick={isSpeaking ? handleStopSpeak : handleSpeak}
              disabled={isGenerating || !previewText}
            >
              {isSpeaking ? '停止' : '読み上げ'}
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
