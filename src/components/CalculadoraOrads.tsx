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
    category: 'classic',
    classicType: 'simple',
    size: '',
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

    if (data.category === 'classic') {
      const types = {
        simple: 'Cisto simples',
        hemorrhagic: 'Cisto hemorrágico',
        endometrioma: 'Endometrioma',
        dermoid: 'Teratoma cístico maduro (Dermóide)',
        paraovarian: 'Cisto paraovariano',
        inclusion: 'Cisto de inclusão peritoneal',
        hydrosalpinx: 'Hidrossalpinge'
      };
      text = `${types[data.classicType as keyof typeof types]}`;
      if (data.size) text += ` medindo ${data.size} cm`;
      
      const sizeNum = parseFloat(data.size);
      if (data.classicType === 'simple') {
        if (sizeNum < 3) score = 'O-RADS 1';
        else if (sizeNum < 10) score = 'O-RADS 2';
        else score = 'O-RADS 3';
      } else {
        if (sizeNum < 10) score = 'O-RADS 2';
        else score = 'O-RADS 3';
      }
    } else if (data.category === 'unilocular') {
      text = `Cisto unilocular`;
      if (data.size) text += ` medindo ${data.size} cm`;
      if (data.margin === 'irregular') {
        text += ` com margem interna irregular (< 3mm)`;
        score = 'O-RADS 4';
      } else {
        text += ` com margem interna lisa`;
        const sizeNum = parseFloat(data.size);
        if (sizeNum < 10) score = 'O-RADS 3';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'multilocular') {
      text = `Cisto multilocular`;
      if (data.size) text += ` medindo ${data.size} cm`;
      if (data.margin === 'irregular') {
        text += ` com margem interna irregular (< 3mm) e/ou septo espesso (≥ 3mm)`;
        score = 'O-RADS 4';
      } else {
        text += ` com margem interna lisa`;
        const sizeNum = parseFloat(data.size);
        if (sizeNum < 10 && data.colorScore <= 3) score = 'O-RADS 3';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'solid-cystic') {
      text = `Lesão sólido-cística`;
      if (data.size) text += ` medindo ${data.size} cm`;
      
      if (data.solidCysticType === 'papillary') {
        text += `, com projeções papilares (${data.papillaryCount})`;
        if (data.papillaryCount === '4+') score = 'O-RADS 5';
        else score = 'O-RADS 4';
      } else {
        text += `, componente sólido com contorno ${data.solidContour === 'smooth' ? 'regular' : 'irregular'}`;
        if (data.solidContour === 'irregular' || data.colorScore >= 3) score = 'O-RADS 5';
        else score = 'O-RADS 4';
      }
    } else if (data.category === 'solid') {
      text = `Lesão sólida (≥ 80%)`;
      if (data.size) text += ` medindo ${data.size} cm`;
      text += `, com contorno ${data.solidContour === 'smooth' ? 'regular' : 'irregular'}`;
      
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

    return `${text}.\nClassificação: ${score} - ${risk}.`;
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

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Categoria da Lesão</label>
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
                    "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    oradsData.category === cat.id 
                      ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classic Type (only if classic) */}
          {oradsData.category === 'classic' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Subtipo Benigno</label>
              <select
                value={oradsData.classicType}
                onChange={(e) => setOradsData(prev => ({ ...prev, classicType: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
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
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Maior Diâmetro (cm)</label>
            <input 
              type="number"
              value={oradsData.size || ''}
              onChange={(e) => setOradsData(prev => ({ ...prev, size: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono"
              placeholder="Ex: 4.5"
            />
          </div>

          {/* Margin (unilocular or multilocular) */}
          {(oradsData.category === 'unilocular' || oradsData.category === 'multilocular') && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Margem Interna</label>
              <div className="grid grid-cols-2 gap-3">
                {['smooth', 'irregular'].map(margin => (
                  <button
                    key={margin}
                    onClick={() => setOradsData(prev => ({ ...prev, margin: margin as any }))}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                      oradsData.margin === margin 
                        ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
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
            <>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Tipo de Componente Sólido</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'papillary', label: 'Cisto Unilocular com Projeções Papilares' },
                    { id: 'multilocular_solid', label: 'Cisto Multilocular com Componente Sólido' },
                    { id: 'other_solid', label: 'Outro Componente Sólido (ex: Nódulo Mural)' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setOradsData(prev => ({ ...prev, solidCysticType: type.id as any }))}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                        oradsData.solidCysticType === type.id 
                          ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
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
                  <label className="text-sm font-bold text-slate-700">Número de Projeções Papilares</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['1-3', '4+'].map(count => (
                      <button
                        key={count}
                        onClick={() => setOradsData(prev => ({ ...prev, papillaryCount: count as any }))}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                          oradsData.papillaryCount === count 
                            ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                        )}
                      >
                        {count === '1-3' ? '1 a 3 projeções' : '4 ou mais projeções'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Solid Contour (solid or other_solid) */}
          {(oradsData.category === 'solid' || (oradsData.category === 'solid-cystic' && oradsData.solidCysticType === 'other_solid')) && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Contorno Externo do Componente Sólido</label>
              <div className="grid grid-cols-2 gap-3">
                {['smooth', 'irregular'].map(solidContour => (
                  <button
                    key={solidContour}
                    onClick={() => setOradsData(prev => ({ ...prev, solidContour: solidContour as any }))}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                      oradsData.solidContour === solidContour 
                        ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
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

          {/* Color Score (solid or solid-cystic) */}
          {(oradsData.category === 'solid' || oradsData.category === 'solid-cystic') && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Escore de Cor (Doppler)</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(score => (
                  <button
                    key={score}
                    onClick={() => setOradsData(prev => ({ ...prev, colorScore: score as any }))}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-bold transition-all text-center",
                      oradsData.colorScore === score 
                        ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                    )}
                  >
                    CS {score}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                1: Sem fluxo | 2: Fluxo mínimo | 3: Fluxo moderado | 4: Fluxo intenso
              </p>
            </div>
          )}

          {/* Ascites */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="ascites"
              checked={oradsData.ascites}
              onChange={(e) => setOradsData(prev => ({ ...prev, ascites: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="ascites" className="text-sm font-bold text-slate-700 cursor-pointer">
              Presença de Ascite
            </label>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              const text = generateOradsText(oradsData);
              onInsert(text);
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-purple-600 rounded-xl text-sm font-bold text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Inserir no Laudo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
