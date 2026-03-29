import React, { useState } from 'react';
import { X, Calculator, Copy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalculadoraBishopProps {
  onClose: () => void;
  onInsert: (content: string) => void;
}

export function CalculadoraBishop({ onClose, onInsert }: CalculadoraBishopProps) {
  const [dilatacao, setDilatacao] = useState(0);
  const [apagamento, setApagamento] = useState(0);
  const [consistencia, setConsistencia] = useState(0);
  const [posicao, setPosicao] = useState(0);
  const [estatura, setEstatura] = useState(0);

  const totalScore = dilatacao + apagamento + consistencia + posicao + estatura;

  const getInterpretation = (score: number) => {
    if (score <= 5) return 'Colo desfavorável (Indução com prostaglandinas recomendada)';
    if (score >= 9) return 'Colo favorável (Indução com ocitocina recomendada)';
    return 'Indeterminado (Avaliação clínica individualizada)';
  };

  const getScoreColor = (score: number) => {
    if (score <= 5) return 'text-red-600';
    if (score >= 9) return 'text-emerald-600';
    return 'text-amber-600';
  };

  const getScoreBg = (score: number) => {
    if (score <= 5) return 'bg-red-50 border-red-100';
    if (score >= 9) return 'bg-emerald-50 border-emerald-100';
    return 'bg-amber-50 border-amber-100';
  };

  const handleInsert = () => {
    const content = `Índice de Bishop: ${totalScore}/13 (${getInterpretation(totalScore)})`;
    onInsert(content);
  };

  const handleCopy = () => {
    const content = `Índice de Bishop: ${totalScore}/13 (${getInterpretation(totalScore)})`;
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Índice de Bishop</h2>
              <p className="text-xs text-slate-500">Avaliação do colo uterino para indução</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">DILATAÇÃO (CM)</label>
              <div className="relative">
                <select 
                  value={dilatacao}
                  onChange={(e) => setDilatacao(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-bold text-slate-700 text-sm"
                >
                  <option value={0}>Fechado (0)</option>
                  <option value={1}>1-2 cm (1)</option>
                  <option value={2}>3-4 cm (2)</option>
                  <option value={3}>{'>= 5 cm (3)'}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ESVAECIMENTO (%)</label>
              <div className="relative">
                <select 
                  value={apagamento}
                  onChange={(e) => setApagamento(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-bold text-slate-700 text-sm"
                >
                  <option value={0}>0-30% (0)</option>
                  <option value={1}>40-50% (1)</option>
                  <option value={2}>60-70% (2)</option>
                  <option value={3}>{'>= 80% (3)'}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CONSISTÊNCIA</label>
              <div className="relative">
                <select 
                  value={consistencia}
                  onChange={(e) => setConsistencia(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-bold text-slate-700 text-sm"
                >
                  <option value={0}>Firme (0)</option>
                  <option value={1}>Médio (1)</option>
                  <option value={2}>Amolecido (2)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">POSIÇÃO</label>
              <div className="relative">
                <select 
                  value={posicao}
                  onChange={(e) => setPosicao(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-bold text-slate-700 text-sm"
                >
                  <option value={0}>Posterior (0)</option>
                  <option value={1}>Mediano (1)</option>
                  <option value={2}>Anterior (2)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ALTURA DA APRESENTAÇÃO (DE LEE)</label>
              <div className="relative">
                <select 
                  value={estatura}
                  onChange={(e) => setEstatura(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-bold text-slate-700 text-sm"
                >
                  <option value={0}>-3 (0)</option>
                  <option value={1}>-2 (1)</option>
                  <option value={2}>-1 ou 0 (2)</option>
                  <option value={3}>{'+1 ou +2 (3)'}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border text-center transition-all duration-300 ${getScoreBg(totalScore)}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${getScoreColor(totalScore)} opacity-80`}>PONTUAÇÃO TOTAL</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className={`text-5xl font-black ${getScoreColor(totalScore)}`}>{totalScore}</span>
              <span className={`text-xl font-bold ${getScoreColor(totalScore)} opacity-50`}>/13</span>
            </div>
            <p className={`text-sm font-bold ${getScoreColor(totalScore)}`}>{getInterpretation(totalScore)}</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={handleCopy}
            className="flex-1 py-3.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={16} /> Copiar
          </button>
          <button 
            onClick={handleInsert}
            className="flex-[2] py-3.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Inserir no Laudo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
