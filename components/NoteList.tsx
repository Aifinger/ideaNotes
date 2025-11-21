import React, { useState } from 'react';
import { Note } from '../types';
import { Search, Trash2 } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, selectedId, onSelect, onDelete }) => {
  const [search, setSearch] = useState('');

  const displayNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="搜索笔记..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayNotes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            没有找到笔记
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {displayNotes.map((note) => (
              <li key={note.id} className="group relative">
                <button
                  onClick={() => onSelect(note.id)}
                  className={`
                    w-full text-left p-4 transition-colors hover:bg-slate-100
                    ${selectedId === note.id ? 'bg-white border-l-4 border-indigo-600 shadow-sm z-10' : 'border-l-4 border-transparent'}
                  `}
                >
                  <h3 className={`font-medium truncate mb-1 ${!note.title ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                    {note.title || '无标题'}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8 mb-2">
                    {note.content || '无内容...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-full font-medium
                        ${note.category === 'WORK' ? 'bg-blue-100 text-blue-700' : 
                          note.category === 'IDEA' ? 'bg-amber-100 text-amber-700' : 
                          'bg-green-100 text-green-700'}
                      `}>
                        {note.category === 'WORK' ? '工作' : note.category === 'IDEA' ? '灵感' : '日常'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('确定要删除这个笔记吗？')) onDelete(note.id);
                  }}
                  className="absolute right-2 top-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
