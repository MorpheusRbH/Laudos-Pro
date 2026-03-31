import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalculadoraTiradsProps {
  onClose: () => void;
  onInsert: (text: string) => void;
}

interface Nodule {
  id: string;
  location: string;
  position: string;
  size: { l: string, h: string, w: string };
  composition: string;
  echogenicity: string;
  shape: string;
  margin: string;
  echogenicFoci: string[];
}

export function CalculadoraTirads({ onClose, onInsert }: CalculadoraTiradsProps) {
  const [nodules, setNodules] = useState<Nodule[]>([{
    id: '1',
    location: 'lobo direito',
    position: 'terço médio',
    size: { l: '', h: '', w: '' },
    composition: '',
    echogenicity: '',
    shape: '',
    margin: '',
    echogenicFoci: []
  }]);

  const [activeTab, setActiveTab] = useState('1');

  const addNodule = () => {
    const newId = (nodules.length + 1).toString();
    setNodules([...nodules, {
      id: newId,
      location: 'lobo direito',
      position: 'terço médio',
      size: { l: '', h: '', w: '' },
      composition: '',
      echogenicity: '',
      shape: '',
      margin: '',
      echogenicFoci: []
    }]);
    setActiveTab(newId);
  };

  const removeNodule = (id: string) => {
    if (nodules.length === 1) return;
    const newNodules = nodules.filter(n => n.id !== id);
    setNodules(newNodules);
    if (activeTab === id) {
      setActiveTab(newNodules[0].id);
    }
  };

  const updateNodule = (id: string, field: keyof Nodule, value: any) => {
    setNodules(nodules.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const toggleFoci = (id: string, foci: string) => {
    setNodules(nodules.map(n => {
      if (n.id === id) {
        const hasFoci = n.echogenicFoci.includes(foci);
        let newFoci = hasFoci ? n.echogenicFoci.filter(f => f !== foci) : [...n.echogenicFoci, foci];
        
        // If 'nenhum' is selected, remove others. If others are selected, remove 'nenhum'.
        if (foci === 'nenhum' && !hasFoci) {
          newFoci = ['nenhum'];
        } else if (foci !== 'nenhum' && !hasFoci) {
          newFoci = newFoci.filter(f => f !== 'nenhum');
        }
        
        return { ...n, echogenicFoci: newFoci };
      }
      return n;
    }));
  };

  const calculatePoints = (n: Nodule) => {
    let pts = 0;
    if (n.composition === 'misto') pts += 1;
    if (n.composition === 'solido') pts += 2;

    if (n.echogenicity === 'hiperecogenico') pts += 1;
    if (n.echogenicity === 'hipoecogenico') pts += 2;
    if (n.echogenicity === 'muito_hipoecogenico') pts += 3;

    if (n.shape === 'mais_alto') pts += 3;

    if (n.margin === 'lobulada') pts += 2;
    if (n.margin === 'extensao') pts += 3;

    if (n.echogenicFoci.includes('macrocalcificacao')) pts += 1;
    if (n.echogenicFoci.includes('periferica')) pts += 2;
    if (n.echogenicFoci.includes('pontilhada')) pts += 3;

    return pts;
  };

  const getTirads = (pts: number) => {
    if (pts === 0) return 'TR1';
    if (pts <= 2) return 'TR2';
    if (pts === 3) return 'TR3';
    if (pts >= 4 && pts <= 6) return 'TR4';
    return 'TR5';
  };

  const getTiradsLabel = (tr: string) => {
    switch (tr) {
      case 'TR1': return 'Benigno';
      case 'TR2': return 'Não suspeito';
      case 'TR3': return 'Levemente suspeito';
      case 'TR4': return 'Moderadamente suspeito';
      case 'TR5': return 'Altamente suspeito';
      default: return '';
    }
  };

  const generateText = () => {
    let text = '';
    nodules.forEach((n, index) => {
      if (!n.composition) return; // Skip empty nodules

      const pts = calculatePoints(n);
      const tr = getTirads(pts);

      let desc = `Nódulo ${index + 1}: Formação nodular `;
      
      const compLabel = {
        'cisto': 'cística',
        'espongiforme': 'espongiforme',
        'misto': 'mista (sólido-cística)',
        'solido': 'sólida'
      }[n.composition] || '';

      const ecoLabel = {
        'anecoico': 'anecoica',
        'hiperecogenico': 'hiperecogênica/isoecogênica',
        'hipoecogenico': 'hipoecogênica',
        'muito_hipoecogenico': 'muito hipoecogênica'
      }[n.echogenicity] || '';

      const shapeLabel = {
        'mais_largo': 'mais larga que alta',
        'mais_alto': 'mais alta que larga'
      }[n.shape] || '';

      const marginLabel = {
        'lisa': 'margens lisas',
        'mal_definida': 'margens mal definidas',
        'lobulada': 'margens lobuladas/irregulares',
        'extensao': 'extensão extratireoidiana'
      }[n.margin] || '';

      const fociLabels = n.echogenicFoci.map(f => {
        return {
          'nenhum': 'sem focos ecogênicos',
          'macrocalcificacao': 'macrocalcificações',
          'periferica': 'calcificações periféricas',
          'pontilhada': 'focos ecogênicos pontilhados'
        }[f];
      }).filter(Boolean).join(', ');

      desc += `${compLabel}, ${ecoLabel}, ${shapeLabel}, com ${marginLabel}`;
      if (fociLabels) {
        desc += ` e ${fociLabels}`;
      }

      desc += `, localizado no ${n.position} do ${n.location}`;
      
      if (n.size.l || n.size.h || n.size.w) {
        desc += `, medindo ${n.size.l || '__'} x ${n.size.h || '__'} x ${n.size.w || '__'} cm`;
      }
      
      desc += `. (ACR TI-RADS ${tr.replace('TR', '')} - ${pts} pontos).\n\n`;
      text += desc;
    });

    return text.trim();
  };

  const [error, setError] = useState<string | null>(null);

  const handleInsert = () => {
    // Validation
    const invalidNoduleIndex = nodules.findIndex(n => 
      !n.composition || !n.echogenicity || !n.shape || !n.margin || n.echogenicFoci.length === 0
    );

    if (invalidNoduleIndex !== -1) {
      setError(`Preencha todos os critérios (Composição, Ecogenicidade, Forma, Margem e Focos) para o Nódulo ${invalidNoduleIndex + 1}.`);
      setActiveTab(nodules[invalidNoduleIndex].id);
      return;
    }

    setError(null);
    const text = generateText();
    if (text) {
      onInsert(text);
    }
  };

  const activeNodule = nodules.find(n => n.id === activeTab) || nodules[0];

  const OptionButton = ({ field, value, label, color = 'blue' }: any) => {
    const isActive = activeNodule[field as keyof Nodule] === value;
    return (
      <button 
        onClick={() => updateNodule(activeNodule.id, field as keyof Nodule, value)} 
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 text-center ${
          isActive 
            ? `bg-${color}-500 border-${color}-500 text-white shadow-lg shadow-${color}-500/20` 
            : `bg-white/5 border-white/10 text-white/60 hover:bg-white/10`
        }`}
      >
        {label}
      </button>
    );
  };

  const FociButton = ({ value, label, color = 'blue' }: any) => {
    const isActive = activeNodule.echogenicFoci.includes(value);
    return (
      <button 
        onClick={() => toggleFoci(activeNodule.id, value)} 
        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 text-center ${
          isActive 
            ? `bg-${color}-500 border-${color}-500 text-white shadow-lg shadow-${color}-500/20` 
            : `bg-white/5 border-white/10 text-white/60 hover:bg-white/10`
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Calculadora TI-RADS</h2>
              <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-500 uppercase tracking-widest">ACR</div>
            </div>
            <p className="text-xs text-white/40 mt-1">Classificação de Nódulos Tireoidianos</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Nodules List */}
          <div className="w-64 border-r border-white/5 bg-black/20 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {nodules.map((n, i) => (
              <div 
                key={n.id}
                onClick={() => setActiveTab(n.id)}
                className={`p-3 rounded-xl cursor-pointer border transition-all relative group ${
                  activeTab === n.id 
                    ? 'bg-blue-500/10 border-blue-500/30 text-white' 
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-sm mb-1">Nódulo {i + 1}</div>
                <div className="text-[10px] opacity-70 truncate">{n.location} - {n.position}</div>
                
                {nodules.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeNodule(n.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            
            <button 
              onClick={addNodule}
              className="mt-2 p-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> Adicionar Nódulo
            </button>
          </div>

          {/* Main Content - Active Nodule */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-8 max-w-3xl mx-auto">
              
              {/* Location & Size */}
              <div className="grid grid-cols-2 gap-6">
                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Localização</label>
                  <div className="flex gap-2 mb-3">
                    <OptionButton field="location" value="lobo direito" label="Lobo Direito" />
                    <OptionButton field="location" value="lobo esquerdo" label="Lobo Esquerdo" />
                    <OptionButton field="location" value="istmo" label="Istmo" />
                  </div>
                  <div className="flex gap-2">
                    <OptionButton field="position" value="terço superior" label="Terço Superior" />
                    <OptionButton field="position" value="terço médio" label="Terço Médio" />
                    <OptionButton field="position" value="terço inferior" label="Terço Inferior" />
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 block">Dimensões (cm)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white text-center focus:border-blue-500/50 outline-none" value={activeNodule.size.l} onChange={e => updateNodule(activeNodule.id, 'size', {...activeNodule.size, l: e.target.value})} />
                      <span className="absolute -top-2 left-3 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/40 uppercase tracking-widest">LON</span>
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white text-center focus:border-blue-500/50 outline-none" value={activeNodule.size.h} onChange={e => updateNodule(activeNodule.id, 'size', {...activeNodule.size, h: e.target.value})} />
                      <span className="absolute -top-2 left-3 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/40 uppercase tracking-widest">AP</span>
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="0.0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white text-center focus:border-blue-500/50 outline-none" value={activeNodule.size.w} onChange={e => updateNodule(activeNodule.id, 'size', {...activeNodule.size, w: e.target.value})} />
                      <span className="absolute -top-2 left-3 px-1 bg-[#0f0f0f] text-[8px] font-black text-white/40 uppercase tracking-widest">TRA</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* TI-RADS Criteria */}
              <div className="space-y-6">
                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 flex justify-between">
                    <span>Composição</span>
                    <span className="text-blue-400">Escolha 1</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <OptionButton field="composition" value="cisto" label="Cístico ou quase cístico (0)" />
                    <OptionButton field="composition" value="espongiforme" label="Espongiforme (0)" />
                    <OptionButton field="composition" value="misto" label="Misto sólido-cístico (1)" />
                    <OptionButton field="composition" value="solido" label="Sólido ou quase sólido (2)" />
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 flex justify-between">
                    <span>Ecogenicidade</span>
                    <span className="text-blue-400">Escolha 1</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <OptionButton field="echogenicity" value="anecoico" label="Anecoico (0)" />
                    <OptionButton field="echogenicity" value="hiperecogenico" label="Hiperecogênico/Isoecogênico (1)" />
                    <OptionButton field="echogenicity" value="hipoecogenico" label="Hipoecogênico (2)" />
                    <OptionButton field="echogenicity" value="muito_hipoecogenico" label="Muito hipoecogênico (3)" />
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 flex justify-between">
                    <span>Forma</span>
                    <span className="text-blue-400">Escolha 1</span>
                  </label>
                  <div className="flex gap-2">
                    <OptionButton field="shape" value="mais_largo" label="Mais largo que alto (0)" />
                    <OptionButton field="shape" value="mais_alto" label="Mais alto que largo (3)" />
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 flex justify-between">
                    <span>Margem</span>
                    <span className="text-blue-400">Escolha 1</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <OptionButton field="margin" value="lisa" label="Lisa (0)" />
                    <OptionButton field="margin" value="mal_definida" label="Mal definida (0)" />
                    <OptionButton field="margin" value="lobulada" label="Lobulada ou irregular (2)" />
                    <OptionButton field="margin" value="extensao" label="Extensão extratireoidiana (3)" />
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-3 flex justify-between">
                    <span>Focos Ecogênicos</span>
                    <span className="text-blue-400">Escolha todos que se aplicam</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FociButton value="nenhum" label="Nenhum ou artefato em cauda de cometa (0)" />
                    <FociButton value="macrocalcificacao" label="Macrocalcificações (1)" />
                    <FociButton value="periferica" label="Calcificações periféricas (2)" />
                    <FociButton value="pontilhada" label="Focos ecogênicos pontilhados (3)" />
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl text-sm font-medium">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Pontuação Total:</span>
                <span className="text-2xl font-black text-white">{calculatePoints(activeNodule)}</span>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Classificação:</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-lg">
                  {getTirads(calculatePoints(activeNodule))}
                </span>
                <span className="text-sm text-white/60 ml-2">
                  ({getTiradsLabel(getTirads(calculatePoints(activeNodule)))})
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleInsert}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Check size={18} />
              Inserir no Laudo
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
