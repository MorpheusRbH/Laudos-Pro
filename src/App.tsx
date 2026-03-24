import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  FileText, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Copy, 
  Eraser, 
  Settings, 
  ChevronRight,
  Calculator,
  Save,
  X,
  Bold,
  Italic,
  List,
  Baby,
  Calendar,
  Ruler,
  Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

import { Specialty, Mask, Phrase } from './types';
import { INITIAL_SPECIALTIES, INITIAL_MASKS, INITIAL_PHRASES } from './data/initialData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { calculateHadlockEFW, calculateHadlockGA, calculateHadlockGAFromCRL, calculatePercentile, calculateDPP } from './utils/obstetrics';

import { CalculadoraBarcelona } from './components/CalculadoraBarcelona';
import { CalculadoraIG } from './components/CalculadoraIG';
import { CalculadoraBishop } from './components/CalculadoraBishop';
import { CalculadoraOrads } from './components/CalculadoraOrads';

export default function App() {
  // State
  const [showCalcBarcelona, setShowCalcBarcelona] = useState(false);
  const [showCalcIG, setShowCalcIG] = useState(false);
  const [showCalcBishop, setShowCalcBishop] = useState(false);
  
  const [specialties, setSpecialties] = useState<Specialty[]>(() => {
    const saved = localStorage.getItem('laudospro_specialties_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      const missing = INITIAL_SPECIALTIES.filter(s => !parsed.some((p: any) => p.id === s.id));
      return [...parsed, ...missing];
    }
    return INITIAL_SPECIALTIES;
  });
  const [masks, setMasks] = useState<Mask[]>(() => {
    const saved = localStorage.getItem('laudospro_masks_v10');
    if (saved) {
      let parsed = JSON.parse(saved);
      // Force update m4 and m5 if they have no fields or missing new fields
      parsed = parsed.map((p: any) => {
        if (p.id === 'm4' || p.id === 'm5') {
          const hasMissingFields = p.id === 'm5' && !p.fields?.some((f: any) => f.id === 'ig_clinica_semanas');
          if (!p.fields || p.fields.length === 0 || hasMissingFields) {
            return INITIAL_MASKS.find(m => m.id === p.id) || p;
          }
        }
        return p;
      });
      const missing = INITIAL_MASKS.filter(m => !parsed.some((p: any) => p.id === m.id));
      return [...parsed, ...missing];
    }
    return INITIAL_MASKS;
  });

  const [phrases, setPhrases] = useState<Phrase[]>(() => {
    const saved = localStorage.getItem('laudospro_phrases_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const missing = INITIAL_PHRASES.filter(ph => !parsed.some((p: any) => p.id === ph.id));
      return [...parsed, ...missing];
    }
    return INITIAL_PHRASES;
  });

  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);
  const [selectedMask, setSelectedMask] = useState<Mask | null>(null);
  const [previousMask, setPreviousMask] = useState<Mask | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isStandaloneCalc, setIsStandaloneCalc] = useState(false);
  const [showOradsModal, setShowOradsModal] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [useBarcelona, setUseBarcelona] = useState(true);
  
  // Editor Ref
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range;
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }
  };

  const [showAdminModal, setShowAdminModal] = useState<'specialty' | 'mask' | 'phrase' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('laudospro_specialties_v3', JSON.stringify(specialties));
    localStorage.setItem('laudospro_masks_v10', JSON.stringify(masks));
    localStorage.setItem('laudospro_phrases_v2', JSON.stringify(phrases));
  }, [specialties, masks, phrases]);

  // Auto-calculate obstetrics fields
  useEffect(() => {
    if (!showFieldModal || !selectedMask || !['m4', 'm5', 'm6'].includes(selectedMask.id)) return;

    let updates: Record<string, string> = {};

    if (selectedMask.id === 'm4') {
      const ccn = parseFloat(fieldValues.ccn);
      if (!isNaN(ccn)) {
        const ga = calculateHadlockGAFromCRL(ccn);
        if (ga) {
          if (fieldValues.ig_semanas !== ga.weeks.toString()) updates.ig_semanas = ga.weeks.toString();
          if (fieldValues.ig_dias !== ga.days.toString()) updates.ig_dias = ga.days.toString();
          
          const dpp = calculateDPP(ga.weeks, ga.days);
          if (dpp && fieldValues.dpp !== dpp) updates.dpp = dpp;
        }
      }
    } else if (selectedMask.id === 'm5') {
      const dbp = parseFloat(fieldValues.dbp);
      const cc = parseFloat(fieldValues.cc);
      const ca = parseFloat(fieldValues.ca);
      const cf = parseFloat(fieldValues.cf);

      if (!isNaN(dbp) && !isNaN(cc) && !isNaN(ca) && !isNaN(cf)) {
        const efw = calculateHadlockEFW(dbp, cc, ca, cf);
        if (efw && fieldValues.peso !== efw.toString()) {
          updates.peso = efw.toString();
        }

        const ga = calculateHadlockGA(dbp, cc, ca, cf);
        if (ga) {
          if (fieldValues.ig_semanas !== ga.weeks.toString()) updates.ig_semanas = ga.weeks.toString();
          if (fieldValues.ig_dias !== ga.days.toString()) updates.ig_dias = ga.days.toString();
        }

        // Use clinical GA for percentile if available, otherwise fallback to estimated GA
        const weeks = parseFloat(fieldValues.ig_clinica_semanas || updates.ig_semanas || fieldValues.ig_semanas);
        const days = parseFloat(fieldValues.ig_clinica_dias || updates.ig_dias || fieldValues.ig_dias || '0');
        
        if (useBarcelona && efw && !isNaN(weeks)) {
          const percentile = calculatePercentile(efw, weeks, days);
          if (percentile !== null && fieldValues.percentil !== percentile.toString()) {
            updates.percentil = percentile.toString();
          }
        }

        // Generate Conclusion Phrase for m5
        const currentPercentil = parseFloat(updates.percentil || fieldValues.percentil);
        if (!isNaN(currentPercentil)) {
          let conclusion = '';
          if (currentPercentil < 10) {
            conclusion = 'Peso fetal estimado abaixo do percentil 10, compatível com feto Pequeno para a Idade Gestacional (PIG) ou Restrição de Crescimento Fetal (RCF). Sugere-se correlação com estudo doplervelocimétrico.';
          } else if (currentPercentil > 90) {
            conclusion = 'Peso fetal estimado acima do percentil 90, compatível com feto Grande para a Idade Gestacional (GIG).';
          } else {
            conclusion = 'Peso fetal estimado adequado para a idade gestacional (AIG).';
          }
          if (fieldValues.conclusao_percentil !== conclusion) {
            updates.conclusao_percentil = conclusion;
          }
        }
      }
    } else if (selectedMask.id === 'm6') {
      const ipAutDir = parseFloat(fieldValues.ip_aut_dir);
      const ipAutEsq = parseFloat(fieldValues.ip_aut_esq);
      if (!isNaN(ipAutDir) && !isNaN(ipAutEsq)) {
        const ipMedio = ((ipAutDir + ipAutEsq) / 2).toFixed(2);
        if (fieldValues.ip_aut_medio !== ipMedio) updates.ip_aut_medio = ipMedio;
      }

      const ipAcm = parseFloat(fieldValues.ip_acm);
      const ipAumb = parseFloat(fieldValues.ip_aumb);
      if (!isNaN(ipAcm) && !isNaN(ipAumb) && ipAumb > 0) {
        const rcp = (ipAcm / ipAumb).toFixed(2);
        if (fieldValues.rcp !== rcp) updates.rcp = rcp;
      }
      
      // Generate Conclusion Phrase
      let conclusion = '';
      const percPeso = parseFloat(fieldValues.percentil);
      const percRcp = parseFloat(fieldValues.perc_rcp);
      const percAumb = parseFloat(fieldValues.perc_aumb);
      const percAutMedio = parseFloat(fieldValues.perc_aut_medio);
      
      if (!isNaN(percPeso)) {
        if (percPeso < 3) {
          conclusion += 'Peso fetal estimado abaixo do percentil 3, compatível com Restrição de Crescimento Fetal (RCF). ';
        } else if (percPeso < 10) {
          if ((!isNaN(percRcp) && percRcp < 5) || (!isNaN(percAumb) && percAumb > 95) || (!isNaN(percAutMedio) && percAutMedio > 95)) {
            conclusion += 'Peso fetal estimado entre os percentis 3 e 10, com alterações ao Doppler, compatível com Restrição de Crescimento Fetal (RCF). ';
          } else {
            conclusion += 'Peso fetal estimado entre os percentis 3 e 10, com Doppler normal, compatível com feto Pequeno para a Idade Gestacional (PIG). ';
          }
        } else if (percPeso > 90) {
          conclusion += 'Peso fetal estimado acima do percentil 90, compatível com feto Grande para a Idade Gestacional (GIG). ';
        } else {
          conclusion += 'Peso fetal estimado adequado para a idade gestacional (AIG). ';
        }
      }
      
      if (!isNaN(percRcp) && percRcp < 5) {
        conclusion += 'Relação Cérebro-Placentária (RCP) abaixo do percentil 5, sugerindo redistribuição hemodinâmica (centralização fetal). ';
      }
      
      if (conclusion && fieldValues.conclusao_doppler !== conclusion.trim()) {
        updates.conclusao_doppler = conclusion.trim();
      }
    }

    if (Object.keys(updates).length > 0) {
      setFieldValues(prev => ({ ...prev, ...updates }));
    }
  }, [fieldValues.ccn, fieldValues.dbp, fieldValues.cc, fieldValues.ca, fieldValues.cf, fieldValues.ig_clinica_semanas, fieldValues.ig_clinica_dias, fieldValues.ig_semanas, fieldValues.ig_dias, showFieldModal, selectedMask, useBarcelona]);

  // Helpers
  const insertAtCursor = (text: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    restoreSelection();
    
    // Replace newlines with <br> or wrap in paragraphs for HTML insertion
    const html = text.replace(/\n/g, '<br>');
    
    // Use execCommand for better integration with contentEditable (preserves undo history)
    document.execCommand('insertHTML', false, html);
    saveSelection(); // Update saved selection after insertion
  };

  const handleSelectMask = (mask: Mask) => {
    setSelectedMask(mask);
    if (mask.fields.length > 0) {
      const initialValues: Record<string, string> = {};
      mask.fields.forEach(f => {
        if (f.type === 'measurement3d') {
          initialValues[`${f.id}_c`] = '';
          initialValues[`${f.id}_l`] = '';
          initialValues[`${f.id}_a`] = '';
        } else {
          initialValues[f.id] = '';
        }
      });
      setFieldValues(initialValues);
      setShowFieldModal(true);
    } else {
      insertAtCursor('<br>' + mask.baseContent + '<br>');
    }
  };

  const calculateVolumeForField = (id: string) => {
    const c = parseFloat(fieldValues[`${id}_c`] || '0');
    const l = parseFloat(fieldValues[`${id}_l`] || '0');
    const a = parseFloat(fieldValues[`${id}_a`] || '0');
    if (c && l && a) {
      return (c * l * a * 0.523).toFixed(2);
    }
    return '0.00';
  };

  const calculateVolume = () => {
    const l = parseFloat(fieldValues['comprimento'] || '0');
    const w = parseFloat(fieldValues['largura'] || '0');
    const h = parseFloat(fieldValues['altura'] || '0');
    if (l && w && h) {
      return (l * w * h * 0.523).toFixed(2);
    }
    return '0.00';
  };

  const closeFieldModal = () => {
    setShowFieldModal(false);
    if (isStandaloneCalc) {
      setIsStandaloneCalc(false);
      setSelectedMask(previousMask);
    }
  };

  const confirmFields = () => {
    if (!selectedMask) return;
    let content = selectedMask.baseContent;
    
    if (isStandaloneCalc) {
      if (selectedMask.id === 'm4') {
        content = `<b>Biometria Fetal:</b><br>Comprimento Cabeça-Nádega (CCN): {{ccn}} mm<br>Compatível com {{ig_semanas}} semanas e {{ig_dias}} dias.<br>Data Provável do Parto (DPP): {{dpp}}<br>`;
      } else if (selectedMask.id === 'm5') {
        const igText = fieldValues.ig_clinica_semanas ? ` para a IG clínica de ${fieldValues.ig_clinica_semanas}s${fieldValues.ig_clinica_dias || '0'}d` : '';
        content = `<b>Biometria Fetal:</b><br>Diâmetro biparietal (DBP): {{dbp}} mm<br>Circunferência craniana (CC): {{cc}} mm<br>Circunferência abdominal (CA): {{ca}} mm<br>Comprimento femoral (CF): {{cf}} mm<br>Peso fetal estimado (Hadlock 4): {{peso}} g (Percentil {{percentil}}${igText} - Ref: Barcelona/Hadlock)<br><br><b>Conclusão:</b><br>Biometria fetal compatível com {{ig_semanas}} semanas e {{ig_dias}} dias.<br>{{conclusao_percentil}}<br>`;
      } else if (selectedMask.id === 'm6') {
        const igText = fieldValues.ig_clinica_semanas ? ` para a IG clínica de ${fieldValues.ig_clinica_semanas}s${fieldValues.ig_clinica_dias || '0'}d` : '';
        content = `<b>Biometria Fetal:</b><br>Peso fetal estimado (Hadlock 4): {{peso}} g (Percentil {{percentil}}${igText} - Ref: Barcelona/Hadlock)<br><br><b>Estudo Doplervelocimétrico:</b><br><b>Artérias Uterinas:</b><br>Artéria Uterina Direita: IP = {{ip_aut_dir}} (Percentil {{perc_aut_dir}})<br>Artéria Uterina Esquerda: IP = {{ip_aut_esq}} (Percentil {{perc_aut_esq}})<br>IP Médio das Artérias Uterinas: {{ip_aut_medio}} (Percentil {{perc_aut_medio}})<br>Presença de incisura protodiastólica: {{incisura}}<br><br><b>Artéria Umbilical:</b><br>IP = {{ip_aumb}} (Percentil {{perc_aumb}})<br>Fluxo diastólico presente e normodirecionado.<br><br><b>Artéria Cerebral Média:</b><br>IP = {{ip_acm}} (Percentil {{perc_acm}})<br>Pico de Velocidade Sistólica (PVS): {{pvs_acm}} cm/s ({{mom_pvs_acm}} MoM)<br><br><b>Relação Cérebro-Placentária (RCP):</b><br>RCP = {{rcp}} (Percentil {{perc_rcp}})<br><br><b>Conclusão Doppler:</b><br>{{conclusao_doppler}}<br>`;
      }
    }
    
    // Replace standard fields and measurement3d fields
    Object.entries(fieldValues).forEach(([id, val]) => {
      content = content.replace(new RegExp(`{{${id}}}`, 'g'), val || '___');
    });

    // Replace calculated volumes for measurement3d fields
    selectedMask.fields.forEach(f => {
      if (f.type === 'measurement3d') {
        const vol = calculateVolumeForField(f.id);
        content = content.replace(new RegExp(`{{${f.id}_vol}}`, 'g'), vol);
      }
    });

    // Legacy volume replacement if it exists
    const legacyVolume = calculateVolume();
    content = content.replace(new RegExp('{{volume}}', 'g'), legacyVolume);
    
    insertAtCursor('<br>' + content + '<br>');
    closeFieldModal();
  };

  const copyToClipboard = async () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;
    
    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      alert('Laudo copiado para a área de transferência com formatação!');
    } catch (err) {
      // Fallback if ClipboardItem is not supported
      await navigator.clipboard.writeText(text);
      alert('Laudo copiado como texto simples!');
    }
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const filteredMasks = selectedSpecId 
    ? masks.filter(m => m.specialtyId === selectedSpecId)
    : [];

  const currentPhrases = selectedMask 
    ? phrases.filter(p => p.maskId === selectedMask.id)
    : [];

  // Admin Actions
  const saveSpecialty = (name: string) => {
    if (editingItem) {
      setSpecialties(prev => prev.map(s => s.id === editingItem.id ? { ...s, name } : s));
    } else {
      setSpecialties(prev => [...prev, { id: Date.now().toString(), name }]);
    }
    setShowAdminModal(null);
    setEditingItem(null);
  };

  const deleteSpecialty = (id: string) => {
    if (window.confirm('Excluir esta especialidade?')) {
      setSpecialties(prev => prev.filter(s => s.id !== id));
      if (selectedSpecId === id) setSelectedSpecId(null);
    }
  };

  const saveMask = (maskData: Partial<Mask>) => {
    if (editingItem) {
      setMasks(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...maskData } as Mask : m));
    } else {
      setMasks(prev => [...prev, { ...maskData, id: Date.now().toString(), specialtyId: selectedSpecId! } as Mask]);
    }
    setShowAdminModal(null);
    setEditingItem(null);
  };

  const deleteMask = (id: string) => {
    if (window.confirm('Excluir esta máscara?')) {
      setMasks(prev => prev.filter(m => m.id !== id));
      if (selectedMask?.id === id) setSelectedMask(null);
    }
  };

  const savePhrase = (text: string) => {
    if (editingItem) {
      setPhrases(prev => prev.map(p => p.id === editingItem.id ? { ...p, text } : p));
    } else {
      setPhrases(prev => [...prev, { id: Date.now().toString(), maskId: selectedMask!.id, text }]);
    }
    setShowAdminModal(null);
    setEditingItem(null);
  };

  const deletePhrase = (id: string) => {
    if (window.confirm('Excluir esta frase?')) {
      setPhrases(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* 1 - Sidebar: Specialties */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-bottom border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">LaudosPro</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ultrassonografia</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especialidades</p>
            {isAdmin && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('specialty'); }}
                className="p-1 hover:bg-slate-100 rounded text-blue-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          {specialties.map(spec => (
            <div key={spec.id} className="group relative">
              <button
                onClick={() => setSelectedSpecId(spec.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between",
                  selectedSpecId === spec.id 
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" 
                    : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <span className="truncate">{spec.name}</span>
                <ChevronRight size={16} className={cn(
                  "transition-transform",
                  selectedSpecId === spec.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-50"
                )} />
              </button>
              {isAdmin && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingItem(spec); setShowAdminModal('specialty'); }}
                    className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600"
                  >
                    <Settings size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSpecialty(spec.id); }}
                    className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isAdmin ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Settings size={16} />
            {isAdmin ? "Sair do Modo Admin" : "Modo Administrador"}
          </button>
        </div>
      </aside>

      {/* 2 - Central Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top: Masks */}
        <section className="h-1/2 flex flex-col border-b border-slate-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-700">Máscaras de Laudo</h2>
            </div>
            {isAdmin && selectedSpecId && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('mask'); }}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Nova Máscara
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedSpecId ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <ChevronRight size={48} className="opacity-20 rotate-180" />
                <p className="font-medium">Selecione uma especialidade para começar</p>
              </div>
            ) : filteredMasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <FileText size={48} className="opacity-20" />
                <p className="font-medium">Nenhuma máscara cadastrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMasks.map(mask => (
                  <div key={mask.id} className="group relative">
                    <button
                      onClick={() => handleSelectMask(mask)}
                      className={cn(
                        "w-full p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden",
                        selectedMask?.id === mask.id
                          ? "bg-white border-blue-500 shadow-xl shadow-blue-100 ring-1 ring-blue-500"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200"
                      )}
                    >
                      <div className="relative z-10">
                        <h3 className={cn(
                          "font-bold mb-1 transition-colors",
                          selectedMask?.id === mask.id ? "text-blue-700" : "text-slate-700"
                        )}>{mask.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {mask.baseContent}
                        </p>
                      </div>
                      {selectedMask?.id === mask.id && (
                        <div className="absolute top-0 right-0 p-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </button>
                    {isAdmin && (
                      <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(mask); setShowAdminModal('mask'); }}
                          className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600"
                        >
                          <Settings size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteMask(mask.id); }}
                          className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bottom: Phrases */}
        <section className="h-1/2 flex flex-col overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-600" />
              <h2 className="font-bold text-slate-700">Frases Rápidas (SmartPhrases)</h2>
            </div>
            {isAdmin && selectedMask && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('phrase'); }}
                className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Nova Frase
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedSpecId === '4' && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Calculadoras</p>
                <button
                  onClick={() => setShowOradsModal(true)}
                  className="w-full sm:w-auto text-left px-5 py-4 rounded-2xl transition-all duration-200 flex items-center gap-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-base block">Calculadora O-RADS</span>
                    <span className="text-xs text-purple-500 font-medium">Avaliação de massas anexiais</span>
                  </div>
                </button>
              </div>
            )}

            {selectedSpecId === '5' && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ferramentas e Calculadoras</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowCalcBarcelona(true)}
                    className="w-full text-left p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm hover:shadow-md group"
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-105 transition-transform">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-base block mb-1">Calculadora Barcelona</span>
                      <span className="text-xs text-gray-400 font-medium block mb-3">(Biometria e Doppler)</span>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-slate-900 px-2 py-1 rounded-md uppercase tracking-wider">
                        ATALHO <ChevronRight size={12} />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowCalcIG(true)}
                    className="w-full text-left p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm hover:shadow-md group"
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-105 transition-transform">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-base block mb-1">Calculadora de Idade Gestacional e DPP</span>
                      <span className="text-xs text-gray-400 font-medium block mb-3"></span>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-slate-900 px-2 py-1 rounded-md uppercase tracking-wider">
                        ATALHO <ChevronRight size={12} />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowCalcBishop(true)}
                    className="w-full text-left p-4 rounded-2xl transition-all duration-200 flex flex-col gap-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm hover:shadow-md group"
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-105 transition-transform">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-base block mb-1">Índice de Bishop</span>
                      <span className="text-xs text-gray-400 font-medium block mb-3">(Avaliação Cervical)</span>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-slate-900 px-2 py-1 rounded-md uppercase tracking-wider">
                        ATALHO <ChevronRight size={12} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!selectedMask ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageSquare size={48} className="opacity-20" />
                <p className="font-medium">Selecione uma máscara para ver as frases</p>
              </div>
            ) : currentPhrases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageSquare size={48} className="opacity-20" />
                <p className="font-medium">Nenhuma frase cadastrada para esta máscara</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Frases Salvas</p>
                <div className="flex flex-wrap gap-3">
                  {currentPhrases.map(phrase => (
                  <div key={phrase.id} className="group relative">
                    <button
                      onClick={() => insertAtCursor(phrase.text + ' ')}
                      className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md transition-all active:scale-95 text-left max-w-xs"
                    >
                      {phrase.text}
                    </button>
                    {isAdmin && (
                      <div className="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(phrase); setShowAdminModal('phrase'); }}
                          className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600"
                        >
                          <Settings size={10} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePhrase(phrase.id); }}
                          className="p-1.5 bg-white shadow-md border border-slate-100 rounded-lg text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3 - Editor Area */}
      <section className="w-[40%] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-2xl z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white">
              <FileText size={16} />
            </div>
            <h2 className="font-bold text-slate-800">Editor de Laudo</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => document.execCommand('bold')}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all" title="Negrito">
              <Bold size={18} />
            </button>
            <button 
              onClick={() => document.execCommand('italic')}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all" title="Itálico">
              <Italic size={18} />
            </button>
            <button 
              onClick={() => document.execCommand('insertUnorderedList')}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all" title="Lista">
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto bg-white">
          <div 
            ref={editorRef}
            contentEditable
            onBlur={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt' }}
            className="w-full h-full outline-none max-w-none leading-relaxed min-h-[500px]"
            data-placeholder="Comece a digitar ou selecione uma máscara..."
          />
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={newReport}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              <Plus size={18} className="text-blue-600" />
              Novo
            </button>
            <button 
              onClick={clearEditor}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              <Eraser size={18} className="text-amber-600" />
              Limpar
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 col-span-1"
            >
              <Copy size={18} />
              Copiar
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Pronto para colar no Word ou PACS
          </p>
        </div>
      </section>

      {/* Field Modal */}
      <AnimatePresence>
        {showFieldModal && selectedMask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFieldModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full ${['m5', 'm6'].includes(selectedMask.id) ? 'max-w-4xl' : selectedMask.id === 'm4' ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-3xl shadow-2xl overflow-hidden`}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-800">Preencher Medidas</h2>
                    <p className="text-xs text-slate-400">{selectedMask.name}</p>
                  </div>
                </div>
                <button onClick={closeFieldModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                {(() => {
                  const renderField = (fieldId: string) => {
                    const field = selectedMask.fields.find(f => f.id === fieldId);
                    if (!field) return null;
                    return (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-slate-600">{field.label}</label>
                          {field.type === 'measurement3d' && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                              Vol: {calculateVolumeForField(field.id)} cm³
                            </span>
                          )}
                        </div>
                        
                        {field.type === 'measurement3d' ? (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">C</span>
                              <input 
                                type="number"
                                value={fieldValues[`${field.id}_c`] || ''}
                                onChange={(e) => setFieldValues(prev => ({ ...prev, [`${field.id}_c`]: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                                placeholder="0.0"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">L</span>
                              <input 
                                type="number"
                                value={fieldValues[`${field.id}_l`] || ''}
                                onChange={(e) => setFieldValues(prev => ({ ...prev, [`${field.id}_l`]: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                                placeholder="0.0"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">A</span>
                              <input 
                                type="number"
                                value={fieldValues[`${field.id}_a`] || ''}
                                onChange={(e) => setFieldValues(prev => ({ ...prev, [`${field.id}_a`]: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        ) : field.type === 'select' ? (
                          <div className="relative">
                            <select
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                            >
                              <option value="">Selecione...</option>
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        ) : field.type === 'text' ? (
                          <div className="relative">
                            <input 
                              type="text"
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              placeholder="Digite aqui..."
                            />
                            {field.unit && (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{field.unit}</span>
                            )}
                          </div>
                        ) : field.type === 'textarea' ? (
                          <div className="relative">
                            <textarea 
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[100px]"
                              placeholder="Digite aqui..."
                            />
                            {field.unit && (
                              <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">{field.unit}</span>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <input 
                              type="number"
                              value={fieldValues[field.id] || ''}
                              onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                              placeholder="0.00"
                            />
                            {field.unit && (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{field.unit}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };

                  if (selectedMask.id === 'm5') {
                    return (
                      <div className="space-y-8">
                        {/* Header/Toggle */}
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-rose-900 text-sm">Calculadora de Percentil (Barcelona)</h3>
                            <p className="text-xs text-rose-700 mt-1">Utiliza a IG Clínica para maior precisão.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={useBarcelona} onChange={(e) => setUseBarcelona(e.target.checked)} />
                            <div className="w-11 h-6 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Biometry & Clinical */}
                          <div className="space-y-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={18}/> Idade Gestacional Clínica</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('ig_clinica_semanas')}
                                {renderField('ig_clinica_dias')}
                              </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
                              <h4 className="font-bold text-blue-800 flex items-center gap-2"><Ruler size={18}/> Biometria Fetal (mm)</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('dbp')}
                                {renderField('cc')}
                                {renderField('ca')}
                                {renderField('cf')}
                              </div>
                            </div>
                            
                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                              <h4 className="font-bold text-emerald-800 flex items-center gap-2"><Activity size={18}/> Resultados Automáticos</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('peso')}
                                {renderField('percentil')}
                                {renderField('ig_semanas')}
                                {renderField('ig_dias')}
                              </div>
                              {fieldValues.percentil && !isNaN(parseFloat(fieldValues.percentil)) && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${
                                  parseFloat(fieldValues.percentil) < 10 ? 'bg-red-100 text-red-800' :
                                  parseFloat(fieldValues.percentil) > 90 ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {parseFloat(fieldValues.percentil) < 10 ? 'Pequeno para a Idade Gestacional (PIG) / RCF' :
                                   parseFloat(fieldValues.percentil) > 90 ? 'Grande para a Idade Gestacional (GIG)' :
                                   'Adequado para a Idade Gestacional (AIG)'}
                                </div>
                              )}
                              {renderField('conclusao_percentil')}
                            </div>
                          </div>

                          {/* Right Column: General Assessment */}
                          <div className="space-y-6">
                            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 space-y-4">
                              <h4 className="font-bold text-purple-800 flex items-center gap-2"><Baby size={18}/> Avaliação Fetal e Anexos</h4>
                              {renderField('apresentacao')}
                              {renderField('fcf')}
                              {renderField('ila')}
                              {renderField('placenta_insercao')}
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('placenta_distancia')}
                                {renderField('placenta_grau')}
                              </div>
                              {renderField('colo')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (selectedMask.id === 'm6') {
                    return (
                      <div className="space-y-8">
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                          <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2"><Activity size={18}/> Doppler Obstétrico (Barcelona)</h3>
                          <p className="text-xs text-rose-700 mt-1">Calculadora integrada para avaliação hemodinâmica fetal.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Clinical & Arteries */}
                          <div className="space-y-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={18}/> Dados Clínicos e Biometria</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('ig_clinica_semanas')}
                                {renderField('ig_clinica_dias')}
                                {renderField('peso')}
                                {renderField('percentil')}
                              </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
                              <h4 className="font-bold text-blue-800 flex items-center gap-2"><Activity size={18}/> Artérias Uterinas</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('ip_aut_dir')}
                                {renderField('perc_aut_dir')}
                                {renderField('ip_aut_esq')}
                                {renderField('perc_aut_esq')}
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                                {renderField('ip_aut_medio')}
                                {renderField('perc_aut_medio')}
                              </div>
                              {renderField('incisura')}
                            </div>
                          </div>

                          {/* Right Column: Fetal Doppler & General */}
                          <div className="space-y-6">
                            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 space-y-4">
                              <h4 className="font-bold text-purple-800 flex items-center gap-2"><Baby size={18}/> Doppler Fetal</h4>
                              
                              <div className="space-y-3">
                                <h5 className="text-sm font-semibold text-purple-700">Artéria Umbilical</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  {renderField('ip_aumb')}
                                  {renderField('perc_aumb')}
                                </div>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-purple-200">
                                <h5 className="text-sm font-semibold text-purple-700">Artéria Cerebral Média</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  {renderField('ip_acm')}
                                  {renderField('perc_acm')}
                                  {renderField('pvs_acm')}
                                  {renderField('mom_pvs_acm')}
                                </div>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-purple-200">
                                <h5 className="text-sm font-semibold text-purple-700">Relação Cérebro-Placentária (RCP)</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  {renderField('rcp')}
                                  {renderField('perc_rcp')}
                                </div>
                              </div>
                            </div>

                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                              <h4 className="font-bold text-emerald-800 flex items-center gap-2"><Activity size={18}/> Conclusão Automática</h4>
                              {renderField('conclusao_doppler')}
                            </div>

                            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 space-y-4">
                              <h4 className="font-bold text-orange-800 flex items-center gap-2"><Baby size={18}/> Avaliação Geral</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('apresentacao')}
                                {renderField('fcf')}
                                {renderField('ila')}
                                {renderField('placenta_grau')}
                              </div>
                              {renderField('placenta_insercao')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (selectedMask.id === 'm4') {
                    return (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Biometry & Clinical */}
                          <div className="space-y-6">
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
                              <h4 className="font-bold text-blue-800 flex items-center gap-2"><Ruler size={18}/> Biometria Fetal (mm)</h4>
                              {renderField('ccn')}
                            </div>
                            
                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                              <h4 className="font-bold text-emerald-800 flex items-center gap-2"><Activity size={18}/> Resultados Automáticos</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {renderField('ig_semanas')}
                                {renderField('ig_dias')}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: General Assessment */}
                          <div className="space-y-6">
                            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 space-y-4">
                              <h4 className="font-bold text-purple-800 flex items-center gap-2"><Baby size={18}/> Avaliação Fetal</h4>
                              {renderField('fcf')}
                              {renderField('dpp')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-6">
                      {selectedMask.fields.map(field => renderField(field.id))}
                    </div>
                  );
                })()}

                {selectedMask.fields.some(f => ['comprimento', 'largura', 'altura'].includes(f.id)) && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                      <Calculator size={18} />
                      <span>Volume Calculado</span>
                    </div>
                    <div className="text-xl font-black text-blue-800 font-mono">
                      {calculateVolume()} <span className="text-xs">cm³</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={closeFieldModal}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmFields}
                  className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* O-RADS Modal */}
      <AnimatePresence>
        {showOradsModal && (
          <CalculadoraOrads 
            onClose={() => setShowOradsModal(false)}
            onInsert={(content) => {
              insertAtCursor(content + '<br><br>');
              setShowOradsModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin Modals */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-bold text-lg text-slate-800">
                  {editingItem ? 'Editar' : 'Novo(a)'} {showAdminModal === 'specialty' ? 'Especialidade' : showAdminModal === 'mask' ? 'Máscara' : 'Frase'}
                </h2>
                <button onClick={() => setShowAdminModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {showAdminModal === 'specialty' && (
                  <form onSubmit={(e) => { e.preventDefault(); saveSpecialty((e.target as any).name.value); }}>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Nome da Especialidade</label>
                        <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                      </div>
                      <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        Salvar Especialidade
                      </button>
                    </div>
                  </form>
                )}

                {showAdminModal === 'mask' && (
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    const form = e.target as any;
                    const contentDiv = document.getElementById('mask-content-editor');
                    
                    let newFields = [];
                    if (form.hasFields.checked) {
                      if (editingItem?.fields && editingItem.fields.length > 0) {
                        newFields = editingItem.fields;
                      } else {
                        newFields = [
                          { id: 'comprimento', label: 'Comprimento', unit: 'cm' },
                          { id: 'largura', label: 'Largura', unit: 'cm' },
                          { id: 'altura', label: 'Altura', unit: 'cm' },
                        ];
                      }
                    }

                    saveMask({
                      name: form.name.value,
                      baseContent: contentDiv ? contentDiv.innerHTML : '',
                      fields: newFields
                    });
                  }}>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Nome da Máscara</label>
                        <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-slate-600">Conteúdo Base (Cole do Word/Docs para manter formatação)</label>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => document.execCommand('bold')} className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Negrito"><Bold size={14} /></button>
                            <button type="button" onClick={() => document.execCommand('italic')} className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Itálico"><Italic size={14} /></button>
                            <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Lista"><List size={14} /></button>
                          </div>
                        </div>
                        <div 
                          id="mask-content-editor"
                          contentEditable
                          style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt' }}
                          dangerouslySetInnerHTML={{ __html: editingItem?.baseContent || '' }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[150px] max-h-[300px] overflow-y-auto"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Use {"{{campo}}"} para variáveis.</p>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <input type="checkbox" name="hasFields" id="hasFields" defaultChecked={editingItem?.fields?.length > 0} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="hasFields" className="text-sm font-medium text-slate-600">Incluir campos de medida (C x L x A)</label>
                      </div>
                      <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        Salvar Máscara
                      </button>
                    </div>
                  </form>
                )}

                {showAdminModal === 'phrase' && (
                  <form onSubmit={(e) => { e.preventDefault(); savePhrase((e.target as any).text.value); }}>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Texto da Frase</label>
                        <textarea name="text" defaultValue={editingItem?.text} required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
                      </div>
                      <button type="submit" className="w-full py-4 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                        Salvar Frase
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
        }
      `}} />

      {showCalcBarcelona && (
        <CalculadoraBarcelona 
          onClose={() => setShowCalcBarcelona(false)} 
          onInsert={(content) => {
            insertAtCursor(content + '<br><br>');
            setShowCalcBarcelona(false);
          }} 
        />
      )}

      {showCalcIG && (
        <CalculadoraIG 
          onClose={() => setShowCalcIG(false)} 
          onInsert={(content) => {
            insertAtCursor(content + '<br><br>');
            setShowCalcIG(false);
          }} 
        />
      )}

      {showCalcBishop && (
        <CalculadoraBishop 
          onClose={() => setShowCalcBishop(false)} 
          onInsert={(content) => {
            insertAtCursor(content + '<br><br>');
            setShowCalcBishop(false);
          }} 
        />
      )}
    </div>
  );
}

function newReport() {
  // This is handled inside the component now, but kept for reference if needed
}
