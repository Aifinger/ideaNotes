import React from 'react';
import { NoteCategory } from '../types';
import { Layout, Briefcase, Sun, Lightbulb } from 'lucide-react';

interface SidebarProps {
  activeCategory: NoteCategory | 'ALL';
  onSelectCategory: (cat: NoteCategory | 'ALL') => void;
  totalNotes: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const navItems = [
    { id: 'ALL', label: '全部笔记', icon: <Layout size={18} /> },
    { id: 'DAILY', label: '日常记录', icon: <Sun size={18} /> },
    { id: 'WORK', label: '工作事项', icon: <Briefcase size={18} /> },
    { id: 'IDEA', label: '灵感/想法', icon: <Lightbulb size={18} /> },
  ];

  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        分类
      </div>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectCategory(item.id as any)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${activeCategory === item.id 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
          `}
        >
          <span className={`${activeCategory === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
};
