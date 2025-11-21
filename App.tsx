import React, { useState, useEffect } from 'react';
import { Note, NoteCategory, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { Plus, Menu } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('smart-notes-data');
    if (saved) {
      try {
        return JSON.parse(saved).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
        }));
      } catch (e) {
        console.error("Failed to parse notes", e);
        return [];
      }
    }
    return [];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<NoteCategory | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Effects
  useEffect(() => {
    localStorage.setItem('smart-notes-data', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('mobile');
        setIsSidebarOpen(false);
      } else {
        setViewMode('desktop');
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      category: activeCategory === 'ALL' ? 'DAILY' : activeCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    if (viewMode === 'mobile') setIsSidebarOpen(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const filteredNotes = notes
    .filter(n => activeCategory === 'ALL' || n.category === activeCategory)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const activeNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Mobile Overlay */}
      {viewMode === 'mobile' && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white border-r border-slate-200 flex flex-col
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span>灵感笔记</span>
          </div>
          {viewMode === 'mobile' && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-500">
               <Menu size={20}/>
            </button>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={18} />
            <span>新建笔记</span>
          </button>
        </div>

        <Sidebar 
          activeCategory={activeCategory} 
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            if(viewMode === 'mobile') setIsSidebarOpen(false);
          }}
          totalNotes={notes.length}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
             <Menu />
           </button>
           <span className="font-semibold text-slate-800">
             {activeCategory === 'ALL' ? '全部笔记' : activeCategory === 'WORK' ? '工作事项' : '日常记录'}
           </span>
           <div className="w-8"></div> {/* Spacer */}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Note List Panel */}
          <div className={`
            w-full md:w-80 bg-slate-50/50 border-r border-slate-200 flex flex-col
            ${selectedNoteId && viewMode === 'mobile' ? 'hidden' : 'flex'}
          `}>
            <NoteList 
              notes={filteredNotes}
              selectedId={selectedNoteId}
              onSelect={(id) => setSelectedNoteId(id)}
              onDelete={deleteNote}
            />
          </div>

          {/* Editor Panel */}
          <div className={`
            flex-1 bg-white h-full flex flex-col
            ${!selectedNoteId && viewMode === 'mobile' ? 'hidden' : 'flex'}
          `}>
             {selectedNoteId && activeNote ? (
               <Editor 
                 note={activeNote}
                 onChange={(updates) => updateNote(activeNote.id, updates)}
                 onBack={() => setSelectedNoteId(null)}
                 isMobile={viewMode === 'mobile'}
               />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-slate-700 mb-2">选择或创建一个笔记</h3>
                 <p className="max-w-xs text-sm">开始记录你的想法、工作总结或日常灵感。使用 AI 功能来辅助你的写作。</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;