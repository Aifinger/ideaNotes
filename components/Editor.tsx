import React, { useState, useEffect, useCallback } from 'react';
import { Note, NoteCategory } from '../types';
import { GeminiService } from '../services/geminiService';
import { Button } from './Button';
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  ChevronLeft, 
  MoreVertical,
  PenLine
} from 'lucide-react';

interface EditorProps {
  note: Note;
  onChange: (updates: Partial<Note>) => void;
  onBack: () => void;
  isMobile: boolean;
}

export const Editor: React.FC<EditorProps> = ({ note, onChange, onBack, isMobile }) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  
  // Local state to handle input performance
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]); // Only reset when note ID changes, not on every parent update

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onChange({ title, content });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, content, onChange, note.title, note.content]);

  const handleAiAction = async (action: 'polish' | 'summary' | 'continue' | 'title') => {
    if (!process.env.API_KEY) {
      alert("请先配置 API Key (process.env.API_KEY)");
      return;
    }
    
    setIsAiProcessing(true);
    setShowAiMenu(false);
    
    try {
      let result = '';
      switch (action) {
        case 'polish':
          result = await GeminiService.polishText(content);
          setContent(result);
          break;
        case 'summary':
          result = await GeminiService.summarizeText(content);
          setContent(prev => prev + '\n\n### AI 总结\n' + result);
          break;
        case 'continue':
          result = await GeminiService.continueWriting(content);
          setContent(prev => prev + ' ' + result);
          break;
        case 'title':
          result = await GeminiService.generateTitle(content);
          setTitle(result);
          break;
      }
    } catch (error) {
      console.error(error);
      alert("AI 请求失败，请稍后重试");
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <ChevronLeft size={20} />
            </button>
          )}
          <select
            value={note.category}
            onChange={(e) => onChange({ category: e.target.value as NoteCategory })}
            className="text-xs font-medium bg-slate-100 border-none rounded-md px-2 py-1 text-slate-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="DAILY">日常记录</option>
            <option value="WORK">工作事项</option>
            <option value="IDEA">灵感想法</option>
          </select>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            上次编辑: {new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(note.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Sparkles size={16} className="text-indigo-500" />}
              onClick={() => setShowAiMenu(!showAiMenu)}
              isLoading={isAiProcessing}
            >
              <span className="hidden sm:inline">AI 助手</span>
            </Button>
            
            {showAiMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                   <div className="p-1">
                     <button 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2"
                        onClick={() => handleAiAction('polish')}
                      >
                        <Wand2 size={14} /> 润色优化
                     </button>
                     <button 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2"
                        onClick={() => handleAiAction('summary')}
                      >
                        <FileText size={14} /> 生成总结
                     </button>
                     <button 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2"
                        onClick={() => handleAiAction('continue')}
                      >
                        <PenLine size={14} /> 续写内容
                     </button>
                     <div className="h-px bg-slate-100 my-1"></div>
                     <button 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2"
                        onClick={() => handleAiAction('title')}
                      >
                        ✨ 自动生成标题
                     </button>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="笔记标题..."
            className="w-full text-3xl font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent mb-6"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此输入内容..."
            className="w-full h-[calc(100vh-250px)] resize-none text-lg text-slate-700 leading-relaxed placeholder-slate-300 border-none focus:ring-0 p-0 bg-transparent font-sans"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
