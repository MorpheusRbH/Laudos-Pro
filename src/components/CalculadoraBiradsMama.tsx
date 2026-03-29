import React, { useState, useEffect } from 'react';
import { X, Info, Check, Copy, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalculadoraBiradsMamaProps {
  onClose: () => void;
  onInsert: (text: string, birads: string, side: 'dir' | 'esq', conclusao: string, recomendacao: string) => void;
}

const CalculadoraBiradsMama: React.FC<CalculadoraBiradsMamaProps> = ({ onClose, onInsert }) => {
  const [side, setSide] = useState<'dir' | 'esq'>('dir');
  const [lesionType, setLesionType] = useState('nódulo sólido');
  const [shape, setShape] = useState('');
  const [orientation, setOrientation] = useState('');
  const [margin, setMargin] = useState('');
  const [echoPattern, setEchoPattern] = useState('');
  const [posterior, setPosterior] = useState('');
  const [vascularization, setVascularization] = useState('');
  const [associatedFeatures, setAssociatedFeatures] = useState<string[]>([]);
  const [size, setSize] = useState({ l: '', h: '', w: '' });
  const [location, setLocation] = useState('');
  const [quadrant, setQuadrant] = useState('');
  
  const [generatedText, setGeneratedText] = useState('');
  const [suggestedBirads, setSuggestedBirads] = useState('1');
  const [biradsSubcategory, setBiradsSubcategory] = useState('');
  const [manualBirads, setManualBirads] = useState<string | null>(null);

  const quadrants = [
    { id: 'QSE', label: 'QSE' },
    { id: 'QSI', label: 'QSI' },
    { id: 'QIE', label: 'QIE' },
    { id: 'QII', label: 'QII' },
    { id: 'UQS', label: 'UQS' },
    { id: 'UQI', label: 'UQI' },
    { id: 'UQL', label: 'UQL' },
    { id: 'UQM', label: 'UQM' },
    { id: 'Retroareolar', label: 'Retroareolar' }
  ];

  const associatedOptions = [
    { id: 'espessamento_pele', label: 'Espessamento de pele' },
    { id: 'retracao_pele', label: 'Retração de pele' },
    { id: 'edema', label: 'Edema' },
    { id: 'distorcao', label: 'Distorção arquitetural' },
    { id: 'dilatacao_ductal', label: 'Dilatação ductal' },
    { id: 'linfonodo_suspeito', label: 'Linfonodo axilar suspeito' }
  ];

  useEffect(() => {
    generateDescription();
  }, [side, lesionType, shape, orientation, margin, echoPattern, posterior, vascularization, associatedFeatures, size, location, quadrant]);

  const generateDescription = () => {
    if (!shape && !margin && !echoPattern && lesionType === 'nódulo sólido' && associatedFeatures.length === 0) {
      setGeneratedText('');
      setSuggestedBirads('1');
      setBiradsSubcategory('');
      return;
    }

    let birads = '2';
    let sub = '';
    let text = '';

    const locText = quadrant ? `${quadrant}${location ? `, ${location}` : ''}` : location || '___';

    if (lesionType === 'cisto simples') {
      text = `Identificada formação cística de conteúdo anecoico em ${locText}, medindo ${size.l || '__'} x ${size.h || '__'} x ${size.w || '__'} cm, apresentando forma oval, margens circunscritas e reforço acústico posterior, compatível com cisto simples. `;
      birads = '2';
    } else if (lesionType === 'cisto complicado') {
      text = `Identificada formação cística em ${locText}, medindo ${size.l || '__'} x ${size.h || '__'} x ${size.w || '__'} cm, apresentando forma oval, margens circunscritas e conteúdo com ecos internos finos em suspensão (debris), sem evidência de componente sólido ou vascularização ao Doppler, compatível com cisto complicado. `;
      birads = '3';
    } else if (lesionType === 'microcistos agrupados') {
      text = `Identificado agrupamento de pequenas formações císticas (microcistos agrupados) em ${locText}, medindo em conjunto ${size.l || '__'} x ${size.h || '__'} x ${size.w || '__'} cm, sem componente sólido evidente ou vascularização ao Doppler. `;
      birads = '3';
    } else {
      const typeLabel = lesionType === 'cisto complexo' ? 'Formação nodular de natureza mista (cística e sólida - complexa)' : 'Formação nodular de natureza sólida';
      text = `${typeLabel} visibilizada em ${locText}, medindo ${size.l || '__'} x ${size.h || '__'} x ${size.w || '__'} cm. `;
      
      const descriptors = [];
      if (shape) descriptors.push(`apresenta forma ${shape}`);
      if (orientation) descriptors.push(`orientação ${orientation}`);
      if (margin) descriptors.push(`margens ${margin}`);
      if (echoPattern) descriptors.push(`ecotextura predominantemente ${echoPattern}`);
      if (posterior && posterior !== 'sem alteração') descriptors.push(`características acústicas posteriores de ${posterior}`);
      
      if (descriptors.length > 0) {
        text += `A referida lesão ${descriptors.join(', ')}. `;
      }

      if (vascularization && vascularization !== 'ausente') {
        text += `Ao estudo com Doppler, observa-se vascularização do tipo ${vascularization}. `;
      }

      if (associatedFeatures.length > 0) {
        const featuresLabels = associatedFeatures.map(f => associatedOptions.find(o => o.id === f)?.label);
        text += `Nota-se ainda como achados associados: ${featuresLabels.join(', ')}. `;
      }

      // BI-RADS Logic
      const suspiciousCount = [
        margin === 'espiculada', 
        margin === 'angular', 
        margin === 'microlobulada', 
        margin === 'indistinta',
        shape === 'irregular',
        shape === 'redonda',
        orientation === 'não paralela',
        posterior === 'sombra',
        vascularization === 'central',
        vascularization === 'mista',
        associatedFeatures.includes('distorcao'),
        associatedFeatures.includes('espessamento_pele'),
        associatedFeatures.includes('retracao_pele')
      ].filter(Boolean).length;

      if (margin === 'espiculada' || margin === 'angular' || associatedFeatures.includes('distorcao')) {
        birads = '5';
      } else if (lesionType === 'cisto complexo') {
        birads = '4';
        if (suspiciousCount >= 2) sub = 'C';
        else if (suspiciousCount === 1) sub = 'B';
        else sub = 'A';
      } else if (suspiciousCount >= 2) {
        birads = '4';
        if (suspiciousCount >= 3) sub = 'C';
        else sub = 'B';
      } else if (suspiciousCount === 1 || shape === 'redonda') {
        birads = '4';
        sub = 'A';
      } else if (shape === 'oval' && margin === 'circunscrita' && orientation === 'paralela') {
        birads = '3';
      } else {
        birads = '2';
      }
    }

    setGeneratedText(text);
    setSuggestedBirads(birads);
    setBiradsSubcategory(sub);
  };

  const getBiradsLabel = (b: string, s: string) => {
    const biradsLabel = b === '4' && s ? `4${s}` : b;
    const labels: Record<string, string> = {
      '0': 'Incompleto (Categoria 0)',
      '1': 'Ausência de achados patológicos (Categoria I)',
      '2': 'Achados benignos (Categoria II)',
      '3': 'Achados provavelmente benignos (Categoria III) — controle ultrassonográfico em 6 meses',
      '4': 'Achados suspeitos (Categoria IV)',
      '4A': 'Achados suspeitos (Categoria IV-A)',
      '4B': 'Achados suspeitos (Categoria IV-B)',
      '4C': 'Achados suspeitos (Categoria IV-C)',
      '5': 'Achados altamente suspeitos de malignidade (Categoria V)',
      '6': 'Malignidade comprovada (Categoria VI)'
    };
    return labels[biradsLabel] || '';
  };

  const handleInsert = () => {
    const finalBirads = manualBirads || suggestedBirads;
    const finalSub = manualBirads ? '' : biradsSubcategory;
    const biradsFull = getBiradsLabel(finalBirads, finalSub);
    
    const sideLabel = side === 'dir' ? 'MD' : 'ME';
    let conclusaoPrefix = '';
    if (lesionType === 'nódulo sólido') conclusaoPrefix = 'Nódulo sólido';
    else if (lesionType === 'cisto simples') conclusaoPrefix = 'Cisto simples';
    else if (lesionType === 'cisto complicado') conclusaoPrefix = 'Cisto complicado';
    else if (lesionType === 'microcistos agrupados') conclusaoPrefix = 'Microcistos agrupados';
    else if (lesionType === 'cisto complexo') conclusaoPrefix = 'Massa cística e sólida (Cisto complexo)';

    const conclusao = `${conclusaoPrefix} em ${sideLabel} (${getBiradsLabel(finalBirads, finalSub).split(' — ')[0]})`;
    
    let recomendacao = '';
    if (finalBirads === '4' || finalBirads === '5') {
      recomendacao = 'Recomenda-se correlação histopatológica (Core Biopsy ou PAAF).';
    } else if (finalBirads === '3') {
      recomendacao = 'Controle ultrassonográfico em 6 meses.';
    } else if (finalBirads === '0') {
      recomendacao = 'Necessária avaliação complementar com mamografia ou comparação com exames anteriores.';
    }

    onInsert(generatedText, biradsFull, side, conclusao, recomendacao);
  };

  const toggleFeature = (id: string) => {
    setAssociatedFeatures(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const OptionButton = ({ value, label, current, onClick, color = 'orange', isSuspicious = false, tooltip = '' }: any) => (
    <button 
      onClick={() => onClick(value)} 
      title={tooltip}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${
        current === value 
          ? `bg-${color}-500 border-${color}-500 text-white shadow-lg shadow-${color}-500/20` 
          : `bg-white/5 border-white/10 text-white/60 hover:bg-white/10 ${isSuspicious ? 'hover:border-red-500/50' : 'hover:border-emerald-500/50'}`
      }`}
    >
      {label || value}
      {isSuspicious && current !== value && <AlertCircle size={10} className="text-red-400/50" />}
    </button>
  );

  const currentBirads = manualBirads || suggestedBirads;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto"
      >
        {/* Left Panel: Inputs */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-white/5 space-y-8 custom-scrollbar">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Assistente BI-RADS®</h2>
                <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest">v2.1</div>
              </div>
              <p className="text-xs text-white/30 font-medium">Léxico de Ultrassonografia Mamária (ACR 5ª Ed.)</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setSide('dir')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all tracking-widest ${side === 'dir' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-white/30 hover:text-white'}`}
              >
                MAMA DIREITA
              </button>
              <button 
                onClick={() => setSide('esq')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all tracking-widest ${side === 'esq' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-white/30 hover:text-white'}`}
              >
                MAMA ESQUERDA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Lesion Type & Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Tipo de Lesão</label>
                <div className="flex flex-wrap gap-2">
                  <OptionButton value="nódulo sólido" current={lesionType} onClick={setLesionType} color="blue" />
                  <OptionButton value="cisto simples" current={lesionType} onClick={setLesionType} color="emerald" />
                  <OptionButton value="cisto complicado" current={lesionType} onClick={setLesionType} color="orange" />
                  <OptionButton value="microcistos agrupados" current={lesionType} onClick={setLesionType} color="orange" />
                  <OptionButton value="cisto complexo" current={lesionType} onClick={setLesionType} color="red" />
                </div>
              </section>
              <section>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Localização e Quadrante</label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {quadrants.map(q => (
                      <button 
                        key={q.id}
                        onClick={() => setQuadrant(q.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${quadrant === q.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ex: às 2h, a 3cm do mamilo"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white text-center focus:border-orange-500/50" value={size.l} onChange={e => setSize({...size, l: e.target.value})} />
                      <span className="absolute -top-2 left-4 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/20 uppercase tracking-widest">LON</span>
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white text-center focus:border-orange-500/50" value={size.h} onChange={e => setSize({...size, h: e.target.value})} />
                      <span className="absolute -top-2 left-4 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/20 uppercase tracking-widest">TRA</span>
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white text-center focus:border-orange-500/50" value={size.w} onChange={e => setSize({...size, w: e.target.value})} />
                      <span className="absolute -top-2 left-4 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/20 uppercase tracking-widest">AP</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {lesionType !== 'cisto simples' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black block">Forma</label>
                      <HelpCircle size={10} className="text-white/10" title="Oval: elipsoide. Redonda: circular. Irregular: não oval nem redonda." />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="oval" current={shape} onClick={setShape} color="emerald" />
                      <OptionButton value="redonda" current={shape} onClick={setShape} color="blue" />
                      <OptionButton value="irregular" current={shape} onClick={setShape} color="red" isSuspicious />
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Orientação</label>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="paralela" current={orientation} onClick={setOrientation} color="emerald" />
                      <OptionButton value="não paralela" current={orientation} onClick={setOrientation} color="red" isSuspicious />
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Margem</label>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="circunscrita" current={margin} onClick={setMargin} color="emerald" />
                      <OptionButton value="indistinta" current={margin} onClick={setMargin} color="orange" isSuspicious />
                      <OptionButton value="angular" current={margin} onClick={setMargin} color="red" isSuspicious />
                      <OptionButton value="microlobulada" current={margin} onClick={setMargin} color="red" isSuspicious />
                      <OptionButton value="espiculada" current={margin} onClick={setMargin} color="red" isSuspicious />
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Ecotextura</label>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="anecoico" current={echoPattern} onClick={setEchoPattern} color="blue" />
                      <OptionButton value="hiperecogênico" current={echoPattern} onClick={setEchoPattern} color="emerald" />
                      <OptionButton value="complexo" current={echoPattern} onClick={setEchoPattern} color="red" isSuspicious />
                      <OptionButton value="hipoecogênico" current={echoPattern} onClick={setEchoPattern} color="blue" />
                      <OptionButton value="isoecogênico" current={echoPattern} onClick={setEchoPattern} color="blue" />
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Posterior</label>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="sem alteração" current={posterior} onClick={setPosterior} color="blue" />
                      <OptionButton value="reforço" current={posterior} onClick={setPosterior} color="emerald" />
                      <OptionButton value="sombra" current={posterior} onClick={setPosterior} color="red" isSuspicious />
                      <OptionButton value="padrão combinado" current={posterior} onClick={setPosterior} color="orange" />
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Vascularização (Doppler)</label>
                    <div className="flex flex-wrap gap-2">
                      <OptionButton value="ausente" current={vascularization} onClick={setVascularization} color="blue" />
                      <OptionButton value="periférica" current={vascularization} onClick={setVascularization} color="emerald" />
                      <OptionButton value="central" current={vascularization} onClick={setVascularization} color="orange" />
                      <OptionButton value="mista" current={vascularization} onClick={setVascularization} color="red" />
                    </div>
                  </section>
                </div>
              </div>
            )}

            <section>
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4 block">Achados Associados</label>
              <div className="flex flex-wrap gap-2">
                {associatedOptions.map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => toggleFeature(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      associatedFeatures.includes(opt.id) 
                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-red-500/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel: Summary & Result */}
        <div className="w-full md:w-[400px] bg-white/[0.02] p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Classificação</span>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className={`text-8xl font-black transition-all duration-700 tracking-tighter ${
                  currentBirads === '4' || currentBirads === '5' || currentBirads === '6' ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                  currentBirads === '3' || currentBirads === '0' ? 'text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}>
                  {currentBirads}{!manualBirads && biradsSubcategory}
                </div>
                {manualBirads && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-4 -right-12 px-2 py-1 bg-white text-black text-[8px] font-black rounded-md shadow-xl uppercase tracking-widest"
                  >
                    Modo Manual
                  </motion.div>
                )}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                {manualBirads ? (
                  <span className="text-white">BI-RADS® Selecionado Manualmente</span>
                ) : (
                  <span className="text-white/40">BI-RADS® Sugerido Automaticamente</span>
                )}
              </div>
              
              {!manualBirads && (
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[8px] text-white/30 leading-tight">
                    A sugestão baseia-se nos descritores selecionados (Léxico ACR). 
                    {lesionType === 'cisto complexo' && " Cistos complexos (sólido-císticos) são inerentemente categoria 4."}
                  </p>
                </div>
              )}
              
              {/* Manual Override Buttons */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {['0', '1', '2', '3', '4', '5', '6'].map(b => (
                  <button 
                    key={b}
                    onClick={() => setManualBirads(b)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border flex items-center justify-center ${
                      manualBirads === b 
                        ? 'bg-white text-black border-white shadow-lg shadow-white/20' 
                        : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'
                    }`}
                  >
                    {b}
                  </button>
                ))}
                {manualBirads && (
                  <button 
                    onClick={() => setManualBirads(null)}
                    className="w-full mt-2 py-1.5 text-[8px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={10} />
                    Voltar para Sugestão Automática
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 relative group">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-3 block">Prévia da Descrição</label>
                <div className="text-[11px] text-white/80 italic leading-relaxed min-h-[100px] max-h-[180px] overflow-y-auto custom-scrollbar">
                  {generatedText || "Aguardando descritores técnicos..."}
                </div>
                {generatedText && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedText);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {(currentBirads === '4' || currentBirads === '5') && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Conduta Sugerida</p>
                      <p className="text-[10px] text-red-400/80 leading-tight">Achados suspeitos. Recomenda-se correlação histopatológica (Core Biopsy ou PAAF).</p>
                    </div>
                  </motion.div>
                )}
                {currentBirads === '3' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl"
                  >
                    <Info size={18} className="text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Conduta Sugerida</p>
                      <p className="text-[10px] text-orange-400/80 leading-tight">Achados provavelmente benignos. Recomenda-se controle em 6 meses.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <button 
              onClick={handleInsert}
              disabled={!generatedText}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              <Check size={20} />
              Incorporar ao Laudo
            </button>
            <button 
              onClick={() => {
                setShape(''); setOrientation(''); setMargin(''); setEchoPattern(''); setPosterior(''); setVascularization(''); setSize({l:'', h:'', w:''}); setLocation(''); setLesionType('nódulo sólido'); setQuadrant(''); setAssociatedFeatures([]); setManualBirads(null);
              }}
              className="w-full py-3 text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-[0.3em] transition-all"
            >
              Limpar Campos
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalculadoraBiradsMama;
