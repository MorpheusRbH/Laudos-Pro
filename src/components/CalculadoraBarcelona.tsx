import React, { useState, useEffect } from 'react';
import { X, Calculator, Info, BookOpen, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateHadlockEFW, calculatePercentile } from '../utils/obstetrics';

interface CalculadoraBarcelonaProps {
  onClose: () => void;
  onInsert: (content: string) => void;
}

export function CalculadoraBarcelona({ onClose, onInsert }: CalculadoraBarcelonaProps) {
  const [activeTab, setActiveTab] = useState<'biometria' | 'doppler' | 'guia'>('biometria');
  
  // Biometria state
  const [semanas, setSemanas] = useState('');
  const [dias, setDias] = useState('');
  const [dbp, setDbp] = useState('');
  const [cc, setCc] = useState('');
  const [ca, setCa] = useState('');
  const [cf, setCf] = useState('');
  
  // Doppler state
  const [ipUterinas, setIpUterinas] = useState('');
  const [ipUmbilical, setIpUmbilical] = useState('');
  const [ipAcm, setIpAcm] = useState('');
  const [rcp, setRcp] = useState('');
  const [ipDuctoVenoso, setIpDuctoVenoso] = useState('');

  // Doppler status
  const [ipUterinasStatus, setIpUterinasStatus] = useState<'normal' | 'elevado'>('normal');
  const [ipUmbilicalStatus, setIpUmbilicalStatus] = useState<'normal' | 'elevado' | 'ausente' | 'reverso'>('normal');
  const [ipAcmStatus, setIpAcmStatus] = useState<'normal' | 'baixo'>('normal');
  const [rcpStatus, setRcpStatus] = useState<'normal' | 'baixo'>('normal');
  const [ipDuctoVenosoStatus, setIpDuctoVenosoStatus] = useState<'normal' | 'elevado' | 'onda_a_reversa'>('normal');
  const [ctgStatus, setCtgStatus] = useState<'normal' | 'alterada'>('normal');

  // Calculations
  const [pesoEstimado, setPesoEstimado] = useState<number | null>(null);
  const [percentil, setPercentil] = useState<number | null>(null);
  const [estagio, setEstagio] = useState<string | null>(null);

  useEffect(() => {
    const dbpNum = parseFloat(dbp);
    const ccNum = parseFloat(cc);
    const caNum = parseFloat(ca);
    const cfNum = parseFloat(cf);
    const semNum = parseInt(semanas);
    const diasNum = parseInt(dias) || 0;

    if (!isNaN(dbpNum) && !isNaN(ccNum) && !isNaN(caNum) && !isNaN(cfNum)) {
      const weight = calculateHadlockEFW(dbpNum, ccNum, caNum, cfNum);
      setPesoEstimado(weight);
      
      if (weight && !isNaN(semNum)) {
         const perc = calculatePercentile(weight, semNum, diasNum);
         setPercentil(perc);
      } else {
        setPercentil(null);
      }
    } else {
      setPesoEstimado(null);
      setPercentil(null);
    }
  }, [dbp, cc, ca, cf, semanas, dias]);

  useEffect(() => {
    let currentStage = null;

    if (ipDuctoVenosoStatus === 'onda_a_reversa' || ctgStatus === 'alterada') {
      currentStage = 'Estágio IV (Alta Suspeita de Acidose Fetal)';
    } else if (ipUmbilicalStatus === 'reverso' || ipDuctoVenosoStatus === 'elevado') {
      currentStage = 'Estágio III (Suspeita de Acidose Fetal de Baixo Grau)';
    } else if (ipUmbilicalStatus === 'ausente') {
      currentStage = 'Estágio II (Insuficiência Placentária Grave)';
    } else if (
      (percentil !== null && percentil < 3) ||
      rcpStatus === 'baixo' ||
      ipUmbilicalStatus === 'elevado' ||
      ipUterinasStatus === 'elevado' ||
      ipAcmStatus === 'baixo'
    ) {
      currentStage = 'Estágio I (Insuficiência Placentária Leve)';
    }

    setEstagio(currentStage);
  }, [percentil, ipUterinasStatus, ipUmbilicalStatus, ipAcmStatus, rcpStatus, ipDuctoVenosoStatus, ctgStatus]);

  const handleInsert = () => {
    let content = `<b>Biometria Fetal:</b><br>`;
    if (dbp) content += `Diâmetro biparietal (DBP): ${dbp} mm<br>`;
    if (cc) content += `Circunferência craniana (CC): ${cc} mm<br>`;
    if (ca) content += `Circunferência abdominal (CA): ${ca} mm<br>`;
    if (cf) content += `Comprimento femoral (CF): ${cf} mm<br>`;
    
    if (pesoEstimado) {
      const igText = semanas ? ` para a IG clínica de ${semanas}s${dias || '0'}d` : '';
      content += `Peso fetal estimado (Hadlock 4): ${pesoEstimado} g (Percentil ${percentil !== null ? percentil : '-'}${igText} - Ref: Barcelona/Hadlock)<br>`;
    }

    if (ipUterinas || ipUmbilical || ipAcm || rcp || ipDuctoVenoso || estagio) {
      content += `<br><b>Estudo Doplervelocimétrico:</b><br>`;
      if (ipUterinas) content += `IP Médio das Artérias Uterinas: ${ipUterinas} (${ipUterinasStatus === 'elevado' ? '> p95' : 'Normal'})<br>`;
      if (ipUmbilical) {
        let umbStatusText = 'Normal';
        if (ipUmbilicalStatus === 'elevado') umbStatusText = '> p95';
        if (ipUmbilicalStatus === 'ausente') umbStatusText = 'Diástole Ausente';
        if (ipUmbilicalStatus === 'reverso') umbStatusText = 'Diástole Reversa';
        content += `Artéria Umbilical (IP): ${ipUmbilical} (${umbStatusText})<br>`;
      }
      if (ipAcm) content += `Artéria Cerebral Média (IP): ${ipAcm} (${ipAcmStatus === 'baixo' ? '< p5' : 'Normal'})<br>`;
      if (rcp) content += `Relação Cérebro-Placentária (RCP): ${rcp} (${rcpStatus === 'baixo' ? '< p5' : 'Normal'})<br>`;
      if (ipDuctoVenoso) {
        let dvStatusText = 'Normal';
        if (ipDuctoVenosoStatus === 'elevado') dvStatusText = '> p95';
        if (ipDuctoVenosoStatus === 'onda_a_reversa') dvStatusText = 'Onda A Reversa';
        content += `Ducto Venoso (IP): ${ipDuctoVenoso} (${dvStatusText})<br>`;
      }
      if (ctgStatus === 'alterada') {
        content += `Cardiotocografia (CTG): Alterada (Variabilidade reduzida ou desacelerações)<br>`;
      }
      
      if (estagio) {
        content += `<br><b>Conclusão Doppler (Critérios de Barcelona):</b><br>${estagio}<br>`;
      }
    }

    onInsert(content);
  };

  const getPercentileColor = (p: number | null) => {
    if (p === null) return 'bg-slate-200';
    if (p < 10) return 'bg-red-500';
    if (p > 90) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getPercentileText = (p: number | null) => {
    if (p === null) return '-';
    if (p < 3) return 'Abaixo do p3 (RCIU)';
    if (p < 10) return 'Entre p3 e p10 (PIG)';
    if (p > 90) return 'Acima do p90 (GIG)';
    return 'Adequado (AIG)';
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
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'biometria' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Biometria Fetal
          </button>
          <button
            onClick={() => setActiveTab('doppler')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'doppler' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Estudo Doppler
          </button>
          <button
            onClick={() => setActiveTab('guia')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'guia' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Guia Rápido
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'biometria' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Calculator size={16} className="text-blue-500" />
                  IG Clínica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Semanas</label>
                    <input 
                      type="number" 
                      value={semanas} 
                      onChange={(e) => setSemanas(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Ex: 32"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Dias</label>
                    <input 
                      type="number" 
                      value={dias} 
                      onChange={(e) => setDias(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="Ex: 4"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Medidas (mm)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">DBP</label>
                    <input 
                      type="number" 
                      value={dbp} 
                      onChange={(e) => setDbp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">CC</label>
                    <input 
                      type="number" 
                      value={cc} 
                      onChange={(e) => setCc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">CA</label>
                    <input 
                      type="number" 
                      value={ca} 
                      onChange={(e) => setCa(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">CF</label>
                    <input 
                      type="number" 
                      value={cf} 
                      onChange={(e) => setCf(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Peso Estimado (Hadlock 4)</p>
                    <div className="text-2xl font-bold text-slate-800">
                      {pesoEstimado ? `${pesoEstimado} g` : '-'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Percentil (Barcelona)</p>
                    <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      {percentil !== null ? percentil : '-'}
                      {percentil !== null && (
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getPercentileColor(percentil)}`}>
                          {getPercentileText(percentil)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {percentil !== null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 px-1">
                      <span>p3</span>
                      <span>p10</span>
                      <span>p50</span>
                      <span>p90</span>
                      <span>p97</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex relative">
                      <div className="h-full bg-red-400" style={{ width: '10%' }}></div>
                      <div className="h-full bg-emerald-400" style={{ width: '80%' }}></div>
                      <div className="h-full bg-orange-400" style={{ width: '10%' }}></div>
                      
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-slate-800 shadow-sm z-10 transition-all duration-500"
                        style={{ left: `${Math.min(Math.max(percentil, 0), 100)}%`, marginLeft: '-2px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'doppler' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Índices de Pulsatilidade (IP)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Art. Uterinas (Médio)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={ipUterinas} 
                        onChange={(e) => setIpUterinas(e.target.value)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="IP"
                        step="0.01"
                      />
                      <select
                        value={ipUterinasStatus}
                        onChange={(e) => setIpUterinasStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="elevado">&gt; p95</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Artéria Umbilical</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={ipUmbilical} 
                        onChange={(e) => setIpUmbilical(e.target.value)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="IP"
                        step="0.01"
                      />
                      <select
                        value={ipUmbilicalStatus}
                        onChange={(e) => setIpUmbilicalStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="elevado">&gt; p95</option>
                        <option value="ausente">Diástole Ausente</option>
                        <option value="reverso">Diástole Reversa</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Art. Cerebral Média</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={ipAcm} 
                        onChange={(e) => setIpAcm(e.target.value)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="IP"
                        step="0.01"
                      />
                      <select
                        value={ipAcmStatus}
                        onChange={(e) => setIpAcmStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="baixo">&lt; p5</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Relação Cérebro-Placentária</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={rcp} 
                        onChange={(e) => setRcp(e.target.value)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="RCP"
                        step="0.01"
                      />
                      <select
                        value={rcpStatus}
                        onChange={(e) => setRcpStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="baixo">&lt; p5</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Ducto Venoso</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={ipDuctoVenoso} 
                        onChange={(e) => setIpDuctoVenoso(e.target.value)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="IP"
                        step="0.01"
                      />
                      <select
                        value={ipDuctoVenosoStatus}
                        onChange={(e) => setIpDuctoVenosoStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="elevado">&gt; p95</option>
                        <option value="onda_a_reversa">Onda A Reversa</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Cardiotocografia (CTG)</label>
                    <select
                      value={ctgStatus}
                      onChange={(e) => setCtgStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="alterada">Alterada (Variabilidade reduzida/desacelerações)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800 leading-relaxed">
                  <strong>Classificação Atual:</strong>
                  <p className="mt-1 font-semibold">{estagio || 'Normal (Sem critérios para RCIU)'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guia' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Estadiamento RCIU (Barcelona)
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">Estágio I: Insuficiência Placentária Leve</strong>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Peso fetal &lt; p3</li>
                      <li>RCP &lt; p5</li>
                      <li>IP Art. Umbilical &gt; p95</li>
                      <li>IP Art. Uterinas &gt; p95</li>
                      <li>IP ACM &lt; p5</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">Estágio II: Insuficiência Placentária Grave</strong>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Artéria Umbilical com fluxo diastólico ausente</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">Estágio III: Suspeita de Acidose Fetal de Baixo Grau</strong>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Artéria Umbilical com fluxo diastólico reverso</li>
                      <li>Ducto Venoso com IP &gt; p95</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">Estágio IV: Alta Suspeita de Acidose Fetal</strong>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Ducto Venoso com onda A reversa</li>
                      <li>CTG com variabilidade reduzida ou desacelerações</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleInsert}
            className="w-full py-3.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            Inserir no Laudo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
