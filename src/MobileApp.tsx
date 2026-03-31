import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  Clipboard, 
  Trash2, 
  ChevronRight, 
  Menu, 
  X, 
  ChevronDown,
  ExternalLink,
  Search,
  Zap,
  Stethoscope,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reutilizando as especialidades e frases (mesma lógica do Desktop)
const SPECIALTIES = [
  { id: 'mamografia', name: 'Mamografia', icon: <Stethoscope size={18} /> },
  { id: 'ultrassom', name: 'Ultrassom', icon: <Zap size={18} /> },
  { id: 'raio-x', name: 'Raio-X', icon: <FileText size={18} /> },
  { id: 'tomografia', name: 'Tomografia', icon: <FileText size={18} /> },
  { id: 'ressonancia', name: 'Ressonância', icon: <FileText size={18} /> },
];

const PHRASES_BY_SPECIALTY: Record<string, { id: string; title: string; content: string }[]> = {
  mamografia: [
    { id: 'm1', title: 'Mamas Densas', content: 'Mamas com padrão de densidade fibroglandular difusa, o que pode mascarar eventuais lesões nodulares.' },
    { id: 'm2', title: 'BIRADS 2', content: 'Achados benignos. Controle radiológico anual recomendado.' },
    { id: 'm3', title: 'Calcificações', content: 'Microcalcificações de aspecto tipicamente benigno, esparsas e bilaterais.' },
  ],
  ultrassom: [
    { id: 'u1', title: 'Esteatose Leve', content: 'Fígado com dimensões normais, apresentando aumento discreto da ecogenicidade de forma difusa, compatível com esteatose grau I.' },
    { id: 'u2', title: 'Cisto Renal', content: 'Cisto simples cortical no rim direito, medindo {medida} cm.' },
  ],
};

export default function MobileApp() {
  const [activeSpecialty, setActiveSpecialty] = useState('mamografia');
  const [editorContent, setEditorContent] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'specialties' | 'phrases'>('specialties');
  const [aiConfirm, setAiConfirm] = useState<{ show: boolean; ai: string; url: string } | null>(null);

  const handleAddPhrase = (content: string) => {
    setEditorContent(prev => prev + (prev ? '\n\n' : '') + content);
    setIsDrawerOpen(false);
  };

  const handleAIAction = (ai: 'chatgpt' | 'gemini' | 'claude') => {
    const text = editorContent.trim();
    if (!text) return;

    const prompt = `Você é um assistente especializado em edição e revisão de laudos radiológicos... (Menu de Opções: Revisão, Volumes, Consistência)\n\nLAUDO:\n\n${text}`;
    
    navigator.clipboard.writeText(prompt);

    let url = '';
    let aiName = '';
    switch (ai) {
      case 'chatgpt':
        url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
        aiName = 'ChatGPT';
        break;
      case 'gemini':
        url = `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`;
        aiName = 'Gemini';
        break;
      case 'claude':
        url = `https://claude.ai/new`;
        aiName = 'Claude';
        break;
    }

    if (ai === 'chatgpt') {
      window.open(url, '_blank');
    } else {
      setAiConfirm({ show: true, ai: aiName, url });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Sparkles size={18} />
          </div>
          <span className="font-black text-lg tracking-tighter text-slate-900">LAUDO<span className="text-purple-600">AI</span></span>
        </div>
        <button 
          onClick={() => {
            setDrawerTab('specialties');
            setIsDrawerOpen(true);
          }}
          className="p-2 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-transform"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Editor Principal */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor de Laudo</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditorContent('')}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(editorContent)}
                className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
              >
                <Clipboard size={16} />
              </button>
            </div>
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Toque para digitar ou adicione frases prontas..."
            className="flex-1 p-6 text-base leading-relaxed focus:outline-none resize-none bg-transparent"
          />
        </div>

        {/* Botões de IA - Mobile */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => handleAIAction('chatgpt')}
            className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">ChatGPT</span>
          </button>
          <button 
            onClick={() => handleAIAction('gemini')}
            className="flex flex-col items-center justify-center gap-2 py-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Gemini</span>
          </button>
          <button 
            onClick={() => handleAIAction('claude')}
            className="flex flex-col items-center justify-center gap-2 py-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-100 active:scale-95 transition-all"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Claude</span>
          </button>
        </div>
      </main>

      {/* Drawer (Gaveta) de Frases e Especialidades */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-50 max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
              
              <div className="flex px-6 gap-4 border-b border-slate-100">
                <button 
                  onClick={() => setDrawerTab('specialties')}
                  className={cn(
                    "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                    drawerTab === 'specialties' ? "text-purple-600" : "text-slate-400"
                  )}
                >
                  Especialidades
                  {drawerTab === 'specialties' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setDrawerTab('phrases')}
                  className={cn(
                    "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                    drawerTab === 'phrases' ? "text-purple-600" : "text-slate-400"
                  )}
                >
                  Frases Prontas
                  {drawerTab === 'phrases' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full" />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {drawerTab === 'specialties' ? (
                  <div className="grid grid-cols-1 gap-3">
                    {SPECIALTIES.map(spec => (
                      <button
                        key={spec.id}
                        onClick={() => {
                          setActiveSpecialty(spec.id);
                          setDrawerTab('phrases');
                        }}
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-95",
                          activeSpecialty === spec.id 
                            ? "bg-purple-50 border-purple-200 text-purple-700" 
                            : "bg-slate-50 border-slate-100 text-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeSpecialty === spec.id ? "bg-purple-600 text-white" : "bg-white text-slate-400 shadow-sm"
                          )}>
                            {spec.icon}
                          </div>
                          <span className="font-bold">{spec.name}</span>
                        </div>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-2">
                       <button onClick={() => setDrawerTab('specialties')} className="p-2 text-purple-600"><ArrowLeft size={18}/></button>
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{activeSpecialty}</span>
                    </div>
                    {PHRASES_BY_SPECIALTY[activeSpecialty]?.map(phrase => (
                      <button
                        key={phrase.id}
                        onClick={() => handleAddPhrase(phrase.content)}
                        className="text-left p-5 bg-white border border-slate-100 rounded-2xl shadow-sm active:bg-purple-50 active:border-purple-200 transition-all"
                      >
                        <h4 className="font-black text-slate-800 text-sm mb-1">{phrase.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{phrase.content}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Confirmation Modal (Igual ao Desktop para consistência) */}
      <AnimatePresence>
        {aiConfirm && aiConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiConfirm(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 shadow-inner">
                <Sparkles size={40} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-900 mb-3">Copiado!</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  O laudo foi copiado. Na nova aba, basta <span className="text-purple-600 font-bold">Pressionar e Colar</span>.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    window.open(aiConfirm.url, '_blank');
                    setAiConfirm(null);
                  }}
                  className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Abrir {aiConfirm.ai} <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => setAiConfirm(null)}
                  className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
