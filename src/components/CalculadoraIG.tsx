import React, { useState, useEffect } from 'react';
import { X, Calendar, Copy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalculadoraIGProps {
  onClose: () => void;
  onInsert: (content: string) => void;
}

export function CalculadoraIG({ onClose, onInsert }: CalculadoraIGProps) {
  const [activeTab, setActiveTab] = useState<'dum' | 'usg'>('dum');
  
  // DUM state
  const [dum, setDum] = useState('');
  
  // USG state
  const [dataUsg, setDataUsg] = useState('');
  const [semanasUsg, setSemanasUsg] = useState('');
  const [diasUsg, setDiasUsg] = useState('');

  // Calculations
  const [igSemanas, setIgSemanas] = useState<number | null>(null);
  const [igDias, setIgDias] = useState<number | null>(null);
  const [dpp, setDpp] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'dum' && dum) {
      const dumDate = new Date(dum);
      // Adjust for timezone offset to prevent off-by-one errors
      dumDate.setMinutes(dumDate.getMinutes() + dumDate.getTimezoneOffset());
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - dumDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0) {
        setIgSemanas(Math.floor(diffDays / 7));
        setIgDias(diffDays % 7);
        
        const dppDate = new Date(dumDate);
        dppDate.setDate(dppDate.getDate() + 280);
        setDpp(dppDate.toLocaleDateString('pt-BR'));
      } else {
        setIgSemanas(null);
        setIgDias(null);
        setDpp(null);
      }
    } else if (activeTab === 'usg' && dataUsg && semanasUsg) {
      const usgDate = new Date(dataUsg);
      usgDate.setMinutes(usgDate.getMinutes() + usgDate.getTimezoneOffset());
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - usgDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const totalDays = (parseInt(semanasUsg) * 7) + (parseInt(diasUsg) || 0) + diffDays;
      
      if (totalDays >= 0) {
        setIgSemanas(Math.floor(totalDays / 7));
        setIgDias(totalDays % 7);
        
        const dppDate = new Date(usgDate);
        dppDate.setDate(dppDate.getDate() + (280 - ((parseInt(semanasUsg) * 7) + (parseInt(diasUsg) || 0))));
        setDpp(dppDate.toLocaleDateString('pt-BR'));
      } else {
        setIgSemanas(null);
        setIgDias(null);
        setDpp(null);
      }
    } else {
      setIgSemanas(null);
      setIgDias(null);
      setDpp(null);
    }
  }, [dum, dataUsg, semanasUsg, diasUsg, activeTab]);

  const handleInsert = () => {
    if (igSemanas !== null && dpp) {
      const content = `Idade Gestacional: ${igSemanas} semanas e ${igDias} dias\nDPP: ${dpp}`;
      onInsert(content);
    }
  };

  const handleCopy = () => {
    if (igSemanas !== null && dpp) {
      const content = `Idade Gestacional: ${igSemanas} semanas e ${igDias} dias\nDPP: ${dpp}`;
      navigator.clipboard.writeText(content);
    }
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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Calculadora de IG e DPP</h2>
              <p className="text-xs text-slate-500">Cálculo preciso baseado em DUM ou USG</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            onClick={() => setActiveTab('dum')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dum' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Por DUM
          </button>
          <button
            onClick={() => setActiveTab('usg')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'usg' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Por USG
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'dum' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Data da DUM</label>
              <input 
                type="date" 
                value={dum}
                onChange={(e) => setDum(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700"
              />
            </div>
          )}

          {activeTab === 'usg' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Data da USG</label>
                <input 
                  type="date" 
                  value={dataUsg}
                  onChange={(e) => setDataUsg(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Semanas na USG</label>
                  <input 
                    type="number" 
                    value={semanasUsg}
                    onChange={(e) => setSemanasUsg(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700"
                    placeholder="Ex: 8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Dias na USG</label>
                  <input 
                    type="number" 
                    value={diasUsg}
                    onChange={(e) => setDiasUsg(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700"
                    placeholder="Ex: 2"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
            <div className="mb-4">
              <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Idade Gestacional Atual</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-black text-blue-900">{igSemanas !== null ? igSemanas : '0'}</span>
                <span className="text-sm font-bold text-blue-700">sem</span>
                <span className="text-4xl font-black text-blue-900">{igDias !== null ? igDias : '0'}</span>
                <span className="text-sm font-bold text-blue-700">dias</span>
              </div>
            </div>
            
            <div className="w-full h-px bg-blue-200/50 mb-4"></div>
            
            <div>
              <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Data Provável do Parto (DPP)</p>
              <p className="text-xl font-bold text-blue-900">{dpp || '-'}</p>
            </div>
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
