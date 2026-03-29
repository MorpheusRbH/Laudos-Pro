import React, { useState, useEffect } from 'react';
import { X, Calculator, Copy, Plus, Activity, Calendar, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalculadoraBarcelonaProps {
  onClose: () => void;
  onInsert: (content: string) => void;
}

export function CalculadoraBarcelona({ onClose, onInsert }: CalculadoraBarcelonaProps) {
  const [activeTab, setActiveTab] = useState<'biometria' | 'doppler' | 'guia'>('biometria');
  const [semanas, setSemanas] = useState<string>('');
  const [dias, setDias] = useState<string>('');
  const [dbp, setDbp] = useState<string>('');
  const [cc, setCc] = useState<string>('');
  const [ca, setCa] = useState<string>('');
  const [cf, setCf] = useState<string>('');
  
  const [pesoEstimado, setPesoEstimado] = useState<number | null>(null);
  const [percentil, setPercentil] = useState<number | null>(null);

  // Doppler fields
  const [ipUt, setIpUt] = useState<string>('');
  const [statusUt, setStatusUt] = useState<string>('normal');
  const [ipUmb, setIpUmb] = useState<string>('');
  const [statusUmb, setStatusUmb] = useState<string>('normal');
  const [ipAcm, setIpAcm] = useState<string>('');
  const [statusAcm, setStatusAcm] = useState<string>('normal');
  const [rcp, setRcp] = useState<string>('');
  const [statusRcp, setStatusRcp] = useState<string>('normal');

  useEffect(() => {
    if (dbp && cc && ca && cf) {
      const dbpNum = parseFloat(dbp);
      const ccNum = parseFloat(cc);
      const caNum = parseFloat(ca);
      const cfNum = parseFloat(cf);
      
      if (!isNaN(dbpNum) && !isNaN(ccNum) && !isNaN(caNum) && !isNaN(cfNum)) {
        // Hadlock 4 formula
        const log10BW = 1.3596 - (0.00386 * caNum * cfNum / 100) + (0.0064 * ccNum) + (0.00061 * dbpNum * caNum) + (0.0424 * caNum) + (0.174 * cfNum);
        const bw = Math.pow(10, log10BW);
        setPesoEstimado(Math.round(bw));

        // Simplified percentile calculation for demo
        if (semanas) {
          const semNum = parseInt(semanas);
          const baseWeight = 1000 + (semNum - 28) * 150;
          const diff = bw - baseWeight;
          const p = Math.max(1, Math.min(99, 50 + (diff / 10)));
          setPercentil(Math.round(p));
        }
      }
    } else {
      setPesoEstimado(null);
      setPercentil(null);
    }
  }, [dbp, cc, ca, cf, semanas]);

  const getPercentileColor = (p: number) => {
    if (p < 3) return 'bg-red-600';
    if (p < 10) return 'bg-amber-500';
    if (p > 97) return 'bg-red-600';
    if (p > 90) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getPercentileText = (p: number) => {
    if (p < 3) return 'RCIU / Muito Pequeno';
    if (p < 10) return 'Pequeno para IG';
    if (p > 97) return 'Macrossomia / Muito Grande';
    if (p > 90) return 'Grande para IG';
    return 'Adequado para IG';
  };

  const handleInsert = () => {
    let content = `Biometria Fetal (Barcelona):\n`;
    if (semanas) content += `- IG: ${semanas}s${dias ? dias + 'd' : ''}\n`;
    if (pesoEstimado) content += `- Peso Estimado: ${pesoEstimado}g (p${percentil})\n`;
    
    if (ipUt || ipUmb || ipAcm) {
      content += `\nEstudo Doppler:\n`;
      if (ipUt) content += `- Artérias Uterinas (IP Médio): ${ipUt} (${statusUt})\n`;
      if (ipUmb) content += `- Artéria Umbilical (IP): ${ipUmb} (${statusUmb})\n`;
      if (ipAcm) content += `- Artéria Cerebral Média (IP): ${ipAcm} (${statusAcm})\n`;
      if (rcp) content += `- Relação Cérebro-Placentária: ${rcp} (${statusRcp})\n`;
    }

    onInsert(content);
  };

  const handleCopy = () => {
    let content = `Biometria Fetal (Barcelona):\n`;
    if (semanas) content += `- IG: ${semanas}s${dias ? dias + 'd' : ''}\n`;
    if (pesoEstimado) content += `- Peso Estimado: ${pesoEstimado}g (p${percentil})\n`;
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Calculadora Barcelona</h2>
              <p className="text-xs text-slate-500">Curvas de crescimento fetal e Doppler</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            onClick={() => setActiveTab('biometria')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'biometria' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Biometria Fetal
          </button>
          <button
            onClick={() => setActiveTab('doppler')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'doppler' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Estudo Doppler
          </button>
          <button
            onClick={() => setActiveTab('guia')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'guia' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Guia Rápido
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'biometria' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Calendar size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">IG Clínica</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Semanas</label>
                    <input 
                      type="number" 
                      value={semanas} 
                      onChange={(e) => setSemanas(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dias</label>
                    <input 
                      type="number" 
                      value={dias} 
                      onChange={(e) => setDias(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Medidas (mm)</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">DBP</label>
                    <input 
                      type="number" 
                      value={dbp} 
                      onChange={(e) => setDbp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CC</label>
                    <input 
                      type="number" 
                      value={cc} 
                      onChange={(e) => setCc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CA</label>
                    <input 
                      type="number" 
                      value={ca} 
                      onChange={(e) => setCa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CF</label>
                    <input 
                      type="number" 
                      value={cf} 
                      onChange={(e) => setCf(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Peso Estimado</p>
                    <div className="text-3xl font-black text-blue-900">
                      {pesoEstimado ? `${pesoEstimado}g` : '---'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Percentil</p>
                    <div className="text-3xl font-black text-blue-900 flex items-center justify-center gap-2">
                      {percentil !== null ? `p${percentil}` : '---'}
                    </div>
                  </div>
                </div>
                
                {percentil !== null && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Distribuição</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-white ${getPercentileColor(percentil)}`}>
                        {getPercentileText(percentil)}
                      </span>
                    </div>
                    <div className="h-4 bg-blue-100 rounded-full overflow-hidden border border-blue-200/50 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, percentil))}%` }}
                        className={`h-full rounded-full ${getPercentileColor(percentil)} shadow-sm`}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-blue-300 uppercase tracking-tighter px-1">
                      <span>p3</span>
                      <span>p10</span>
                      <span>p50</span>
                      <span>p90</span>
                      <span>p97</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'doppler' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Artérias Uterinas</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">IP Médio</label>
                    <input 
                      type="number" 
                      value={ipUt} 
                      onChange={(e) => setIpUt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status</label>
                    <select 
                      value={statusUt}
                      onChange={(e) => setStatusUt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="alterado">Alterado ({'>'}p95)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Artéria Umbilical</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">IP</label>
                    <input 
                      type="number" 
                      value={ipUmb} 
                      onChange={(e) => setIpUmb(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status</label>
                    <select 
                      value={statusUmb}
                      onChange={(e) => setStatusUmb(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="p95">Alterado ({'>'}p95)</option>
                      <option value="ausente">Diástole Ausente</option>
                      <option value="reversa">Diástole Reversa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cerebral Média / RCP</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">ACM (IP)</label>
                    <input 
                      type="number" 
                      value={ipAcm} 
                      onChange={(e) => setIpAcm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">RCP (IP)</label>
                    <input 
                      type="number" 
                      value={rcp} 
                      onChange={(e) => setRcp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status ACM</label>
                    <select 
                      value={statusAcm}
                      onChange={(e) => setStatusAcm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="alterado">Alterado ({'<'}p5)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status RCP</label>
                    <select 
                      value={statusRcp}
                      onChange={(e) => setStatusRcp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="alterado">Alterado ({'<'}p5)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guia' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500" />
                  Classificação RCIU
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-blue-600 mb-1">Pequeno para IG (PIG)</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Peso entre p3 e p10 com Doppler normal.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-red-600 mb-1">RCIU Estágio I</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Peso {'<'} p3 OU (Peso {'<'} p10 + Doppler alterado: RCP {'<'} p5, ACM {'<'} p5 ou UtA {'>'} p95).</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-red-700 mb-1">RCIU Estágio II</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Diástole ausente na artéria umbilical.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 leading-relaxed italic">
                  * Baseado nos critérios de Barcelona para restrição de crescimento fetal.
                </p>
              </div>
            </div>
          )}
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
