import React, { useState } from 'react';
import { X, Calculator, Copy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalculadoraOradsProps {
  onClose: () => void;
  onInsert: (content: string) => void;
}

export function CalculadoraOrads({ onClose, onInsert }: CalculadoraOradsProps) {
  const [oradsData, setOradsData] = useState({
    laterality: 'right' as 'right' | 'left',
    category: 'classic',
    classicType: 'simple',
    size1: '',
    size2: '',
    size3: '',
    margin: 'smooth',
    solidCysticType: 'papillary',
    papillaryCount: '1-3',
    solidContour: 'smooth',
    colorScore: 1,
    ascites: false
  });

  const generateOradsText = (data: typeof oradsData) => {
    let text = '';
    let score = 'O-RADS 1';
    let risk = 'Risco normal';

    const sizes = [data.size1, data.size2, data.size3].filter(s => s !== '').map(s => parseFloat(s));
    const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;
    
    let sizeText = [data.size1, data.size2, data.size3].filter(s => s !== '').join(' x ');
    if (sizes.length > 0) sizeText += ' cm';
    
    if (sizes.length === 3) {
      const volume = (sizes[0] * sizes[1] * sizes[2] * 0.523).toFixed(1);
      sizeText += ` (Volume: ${volume} cm³)`;
    }

    const lateralityText = data.laterality === 'right' ? 'Ovário Direito: ' : 'Ovário Esquerdo: ';

    if (data.category === 'classic') {
      const descriptions = {
        simple: 'Lesão cística unilocular, anecóica, com paredes finas e lisas, apresentando reforço acústico posterior, sem septos ou componentes sólidos, compatível com cisto simples',
        hemorrhagic: 'Lesão cística unilocular apresentando conteúdo com ecos internos finos e reticulares (aspecto em "teia de aranha"), sem evidência de fluxo ao estudo Doppler, compatível com cisto hemorrágico',
        endometrioma: 'Lesão cística unilocular com conteúdo homogêneo de baixa ecogenicidade (aspecto em "vidro fosco"), sem componentes sólidos ou projeções papilares, compatível com endometrioma',
        dermoid: 'Lesão cística apresentando componente hiperecogênico focal com sombra acústica posterior (nódulo de Rokitansky) e/ou linhas e pontos hiperecogênicos (sebo e pelos), compatível com teratoma cístico maduro (dermóide)',
        paraovarian: 'Lesão cística unilocular de paredes finas e conteúdo anecóico, localizada adjacente ao ovário mas dele independente (sinal do deslizamento positivo), compatível com cisto paraovariano',
        inclusion: 'Coleção líquida multilocular de contornos irregulares, moldada às estruturas pélvicas e seguindo os planos peritoneais, com o ovário visualizado na periferia ou aprisionado pela lesão, compatível com cisto de inclusão peritoneal',
        hydrosalpinx: 'Estrutura tubular alongada com conteúdo anecóico, apresentando septos incompletos e aspecto em "roda dentada" (cogwheel sign) em cortes transversais, compatível com hidrossalpinge'
      };
      text = `${descriptions[data.classicType as keyof typeof descriptions]}`;
      if (sizeText) text += `, medindo ${sizeText}`;
      
      if (data.classicType === 'simple') {
        if (maxSize < 3) score = 'O-RADS 1';
        else if (maxSize < 10) score = 'O-RADS 2';
        else score = 'O-RADS 3';
      } else {
        if (maxSize < 10) score = 'O-RADS 2';
        else score = 'O-RADS 3';
      }
    } else if (data.category === 'unilocular') {
      text = `Lesão cística unilocular`;
      if (sizeText) text += `, medindo ${sizeText}`;
      if (data.margin === 'irregular') {
        text += `, apresentando margem interna irregular (< 3mm)`;
        score = 'O-RADS 4';
      } else {
        text += `, apresentando margem interna lisa e conteúdo anecóico`;
        if (maxSize < 10) score = 'O-RADS 3';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'multilocular') {
      text = `Lesão cística multilocular`;
      if (sizeText) text += `, medindo ${sizeText}`;
      if (data.margin === 'irregular') {
        text += `, apresentando margem interna irregular (< 3mm) e/ou septo espesso (≥ 3mm)`;
        score = 'O-RADS 4';
      } else {
        text += `, apresentando margens internas e septos lisos`;
        if (maxSize < 10 && data.colorScore <= 3) score = 'O-RADS 3';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'solid-cystic') {
      text = `Lesão sólida-cística (componente sólido < 80%)`;
      if (sizeText) text += `, medindo ${sizeText}`;
      
      if (data.solidCysticType === 'papillary') {
        text += `, apresentando projeções papilares (${data.papillaryCount === '1-3' ? '1 a 3' : '4 ou mais'})`;
        if (data.papillaryCount === '4+') score = 'O-RADS 5';
        else score = 'O-RADS 4';
      } else {
        text += `, apresentando componente sólido com contorno ${data.solidContour === 'smooth' ? 'regular' : 'irregular'}`;
        if (data.solidContour === 'irregular' || data.colorScore >= 3) score = 'O-RADS 5';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'solid') {
      text = `Lesão sólida (componente sólido ≥ 80%)`;
      if (sizeText) text += `, medindo ${sizeText}`;
      text += `, apresentando contorno ${data.solidContour === 'smooth' ? 'regular' : 'irregular'}`;
      
      if (data.solidContour === 'irregular' || data.colorScore >= 3) score = 'O-RADS 5';
      else score = 'O-RADS 4';
    }

    if (data.ascites) {
      text += ` e presença de ascite`;
      score = 'O-RADS 5';
    }

    if (score === 'O-RADS 2') risk = 'Quase certamente benigno (< 1% risco de malignidade)';
    if (score === 'O-RADS 3') risk = 'Baixo risco de malignidade (1% a < 10%)';
    if (score === 'O-RADS 4') risk = 'Risco intermediário de malignidade (10% a < 50%)';
    if (score === 'O-RADS 5') risk = 'Alto risco de malignidade (≥ 50%)';

    return {
      fullText: `${lateralityText}${text}.\nClassificação: ${score} - ${risk}.`,
      score,
      risk
    };
  };

  const result = generateOradsText(oradsData);

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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">Calculadora O-RADS</h2>
              <p className="text-xs text-slate-500 font-medium">Classificação de Risco Ovariano</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Laterality */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white">L</div>
              Lateralidade
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'right', label: 'Ovário Direito' },
                { id: 'left', label: 'Ovário Esquerdo' }
              ].map(lat => (
                <button
                  key={lat.id}
                  onClick={() => setOradsData(prev => ({ ...prev, laterality: lat.id as any }))}
                  className={cn(
                    "p-3.5 rounded-xl border text-sm font-bold transition-all text-center",
                    oradsData.laterality === lat.id 
                      ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                  )}
                >
                  {lat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calculator size={14} className="text-purple-500" />
              Categoria da Lesão
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'classic', label: 'Lesão Benigna Clássica' },
                { id: 'unilocular', label: 'Cisto Unilocular' },
                { id: 'multilocular', label: 'Cisto Multilocular' },
                { id: 'solid-cystic', label: 'Lesão Sólido-Cística' },
                { id: 'solid', label: 'Lesão Sólida (≥ 80%)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setOradsData(prev => ({ ...prev, category: cat.id as any }))}
                  className={cn(
                    "p-3.5 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between group",
                    oradsData.category === cat.id 
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/30"
                  )}
                >
                  {cat.label}
                  {oradsData.category === cat.id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Classic Type (only if classic) */}
              {oradsData.category === 'classic' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtipo Benigno</label>
                  <select
                    value={oradsData.classicType}
                    onChange={(e) => setOradsData(prev => ({ ...prev, classicType: e.target.value as any }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-slate-700 text-sm"
                  >
                    <option value="simple">Cisto Simples</option>
                    <option value="hemorrhagic">Cisto Hemorrágico</option>
                    <option value="endometrioma">Endometrioma</option>
                    <option value="dermoid">Teratoma Cístico Maduro (Dermóide)</option>
                    <option value="paraovarian">Cisto Paraovariano</option>
                    <option value="inclusion">Cisto de Inclusão Peritoneal</option>
                    <option value="hydrosalpinx">Hidrossalpinge</option>
                  </select>
                </div>
              )}

              {/* Size */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center block">Medidas da Lesão (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <input 
                      type="number"
                      value={oradsData.size1 || ''}
                      onChange={(e) => setOradsData(prev => ({ ...prev, size1: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      value={oradsData.size2 || ''}
                      onChange={(e) => setOradsData(prev => ({ ...prev, size2: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      value={oradsData.size3 || ''}
                      onChange={(e) => setOradsData(prev => ({ ...prev, size3: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-slate-700 text-center"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-medium">O maior diâmetro será usado para a classificação</p>
                {oradsData.size1 && oradsData.size2 && oradsData.size3 && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100 text-center">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Volume Calculado</p>
                    <p className="text-sm font-black text-purple-700">
                      {(parseFloat(oradsData.size1) * parseFloat(oradsData.size2) * parseFloat(oradsData.size3) * 0.523).toFixed(1)} cm³
                    </p>
                  </div>
                )}
              </div>

              {/* Margin (unilocular or multilocular) */}
              {(oradsData.category === 'unilocular' || oradsData.category === 'multilocular') && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Interna</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['smooth', 'irregular'].map(margin => (
                      <button
                        key={margin}
                        onClick={() => setOradsData(prev => ({ ...prev, margin: margin as any }))}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-bold transition-all text-left",
                          oradsData.margin === margin 
                            ? "bg-purple-50 border-purple-500 text-purple-700" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                        )}
                      >
                        {margin === 'smooth' && 'Regular / Lisa'}
                        {margin === 'irregular' && 'Irregular (< 3mm)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Solid-Cystic Details */}
              {oradsData.category === 'solid-cystic' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Componente Sólido</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'papillary', label: 'Cisto Unilocular com Projeções Papilares' },
                        { id: 'multilocular_solid', label: 'Cisto Multilocular com Componente Sólido' },
                        { id: 'other_solid', label: 'Outro Componente Sólido (ex: Nódulo Mural)' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setOradsData(prev => ({ ...prev, solidCysticType: type.id as any }))}
                          className={cn(
                            "p-3 rounded-xl border text-xs font-bold transition-all text-left",
                            oradsData.solidCysticType === type.id 
                              ? "bg-purple-50 border-purple-500 text-purple-700" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {oradsData.solidCysticType === 'papillary' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Projeções Papilares</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['1-3', '4+'].map(count => (
                          <button
                            key={count}
                            onClick={() => setOradsData(prev => ({ ...prev, papillaryCount: count as any }))}
                            className={cn(
                              "p-3 rounded-xl border text-xs font-bold transition-all text-center",
                              oradsData.papillaryCount === count 
                                ? "bg-purple-50 border-purple-500 text-purple-700" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                            )}
                          >
                            {count === '1-3' ? '1 a 3' : '4 ou mais'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Solid Contour (solid or other_solid) */}
              {(oradsData.category === 'solid' || (oradsData.category === 'solid-cystic' && oradsData.solidCysticType === 'other_solid')) && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contorno Externo do Componente Sólido</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['smooth', 'irregular'].map(solidContour => (
                      <button
                        key={solidContour}
                        onClick={() => setOradsData(prev => ({ ...prev, solidContour: solidContour as any }))}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-bold transition-all text-left",
                          oradsData.solidContour === solidContour 
                            ? "bg-purple-50 border-purple-500 text-purple-700" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                        )}
                      >
                        {solidContour === 'smooth' && 'Contorno Regular'}
                        {solidContour === 'irregular' && 'Contorno Irregular'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Color Score (solid or solid-cystic) */}
              {(oradsData.category === 'solid' || oradsData.category === 'solid-cystic') && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escore de Cor (Doppler)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(score => (
                      <button
                        key={score}
                        onClick={() => setOradsData(prev => ({ ...prev, colorScore: score as any }))}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-bold transition-all text-center",
                          oradsData.colorScore === score 
                            ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-tight">
                    <p><strong>1:</strong> Sem fluxo | <strong>2:</strong> Mínimo</p>
                    <p><strong>3:</strong> Moderado | <strong>4:</strong> Intenso</p>
                  </div>
                </div>
              )}

              {/* Ascites */}
              <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="ascites"
                    checked={oradsData.ascites}
                    onChange={(e) => setOradsData(prev => ({ ...prev, ascites: e.target.checked }))}
                    className="w-6 h-6 rounded-lg border-slate-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="ascites" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Presença de Ascite
                </label>
              </div>

              {/* Result Card */}
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center space-y-2">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Resultado Estimado</p>
                <div className="text-2xl font-black text-purple-900">
                  {result.score}
                </div>
                <p className="text-xs font-bold text-purple-600 leading-tight">
                  {result.risk}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onInsert(result.fullText);
              onClose();
            }}
            className="flex-1 py-3.5 px-4 bg-purple-600 rounded-xl text-sm font-bold text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Inserir no Laudo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
