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
  Bold,
  Italic,
  List,
  Baby,
  Calendar,
  Ruler,
  Activity,
  ClipboardList,
  BookOpen,
  ArrowRight,
  ArrowDown,
  Search,
  X,
  Sparkles,
  ExternalLink,
  Zap
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
import CalculadoraBiradsMama from './components/CalculadoraBiradsMama';
import { CalculadoraOrads } from './components/CalculadoraOrads';
import { CalculadoraTirads } from './components/CalculadoraTirads';

// Editor Ruler Component
const EditorRuler = () => {
  return (
    <div className="w-[21cm] h-6 bg-white border-b border-slate-200 flex items-end px-[2.5cm] relative overflow-hidden shrink-0 mb-4 shadow-sm rounded-t-sm">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="flex-1 flex items-end justify-between h-full border-l border-slate-100 last:border-r">
          <div className="relative h-full w-full">
            <span className="absolute -top-1 left-1 text-[9px] text-slate-400 font-bold">{i + 1}</span>
            <div className="absolute bottom-0 left-1/2 w-px h-2 bg-slate-300" />
            <div className="absolute bottom-0 left-1/4 w-px h-1 bg-slate-200" />
            <div className="absolute bottom-0 left-3/4 w-px h-1 bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  // State
  const [showCalcBarcelona, setShowCalcBarcelona] = useState(false);
  const [showCalcIG, setShowCalcIG] = useState(false);
  const [showCalcBishop, setShowCalcBishop] = useState(false);
  const [showCalcBiradsMama, setShowCalcBiradsMama] = useState(false);
  const [showCalcTirads, setShowCalcTirads] = useState(false);
  
  const [autocompleteState, setAutocompleteState] = useState<{
    isOpen: boolean;
    query: string;
    suggestions: Phrase[];
    position: { top: number; left: number };
    node: Node | null;
    startOffset: number;
    endOffset: number;
  }>({
    isOpen: false,
    query: '',
    suggestions: [],
    position: { top: 0, left: 0 },
    node: null,
    startOffset: 0,
    endOffset: 0,
  });
  const [autocompleteSelectedIndex, setAutocompleteSelectedIndex] = useState(0);

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
      // Force update m4, m5, m7, m8 if they have missing fields or missing formatting
      parsed = parsed.map((p: any) => {
        if (p.id === 'm4' || p.id === 'm5' || p.id === 'm7' || p.id === 'm8') {
          const isUrology = p.id === 'm7' || p.id === 'm8';
          // Check for bold tags in urology masks to ensure they are updated
          const missingBold = isUrology && !p.baseContent.includes('<b>');
          const hasMissingFields = p.id === 'm5' && !p.fields?.some((f: any) => f.id === 'ig_clinica_semanas');
          
          if (!p.fields || p.fields.length === 0 || hasMissingFields || missingBold) {
            const initial = INITIAL_MASKS.find(m => m.id === p.id);
            if (initial) return initial;
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
  const [phraseSearchQuery, setPhraseSearchQuery] = useState('');
  useEffect(() => {
    document.execCommand('styleWithCSS', false, 'true');
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [useBarcelona, setUseBarcelona] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [currentFontSize, setCurrentFontSize] = useState('11pt');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [currentLineHeight, setCurrentLineHeight] = useState('1.15');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCentralPanelOpen, setIsCentralPanelOpen] = useState(true);
  const [editorZoom, setEditorZoom] = useState(1);
  const [aiConfirm, setAiConfirm] = useState<{ show: boolean; ai: string; url: string } | null>(null);
  
  // Tabs State
  const [tabs, setTabs] = useState<{ id: string; title: string; content: string }[]>([
    { id: '1', title: 'Laudo 1', content: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');

  const handleTabChange = (tabId: string) => {
    if (activeTabId === tabId) return;
    
    const currentContent = editorRef.current?.innerHTML || '';
    
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, content: currentContent } : t
    ));
    
    setActiveTabId(tabId);
    
    // We need to use a setTimeout here to wait for the state update to finish
    // before we can get the new tab's content from the updated tabs array.
    setTimeout(() => {
      setTabs(currentTabs => {
        const newTab = currentTabs.find(t => t.id === tabId);
        if (editorRef.current && newTab) {
          editorRef.current.innerHTML = newTab.content;
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
        return currentTabs;
      });
    }, 0);
  };

  const handleNewReport = () => {
    const currentContent = editorRef.current?.innerHTML || '';
    const newId = Date.now().toString();
    const newTab = { id: newId, title: `Laudo ${tabs.length + 1}`, content: '' };
    
    setTabs(prev => {
      const updated = prev.map(t => 
        t.id === activeTabId ? { ...t, content: currentContent } : t
      );
      return [...updated, newTab];
    });
    
    setActiveTabId(newId);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
      setTabs([{ ...tabs[0], content: '' }]);
      return;
    }
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    if (activeTabId === tabId) {
      const nextTab = newTabs[newTabs.length - 1];
      setTabs(newTabs);
      setActiveTabId(nextTab.id);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextTab.content;
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
    } else {
      const currentContent = editorRef.current?.innerHTML || '';
      setTabs(newTabs.map(t => 
        t.id === activeTabId ? { ...t, content: currentContent } : t
      ));
    }
  };

  // Auto-fit effect
  useEffect(() => {
    const handleResize = () => {
      if (editorZoom === 0) { // 0 means auto-fit
        const container = document.querySelector('.editor-scroll-container');
        if (container) {
          const availableWidth = container.clientWidth - 64; // 64px for padding
          const sheetWidthPx = 21 * 37.7952755906; // 21cm to px (approx)
          const fitZoom = Math.min(1, availableWidth / sheetWidthPx);
          setEditorZoom(Math.floor(fitZoom * 10) / 10);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    if (editorZoom === 0) handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [editorZoom, isSidebarOpen, isCentralPanelOpen]);

  // Editor Ref
  const editorRef = useRef<HTMLDivElement>(null);

  const updateToolbarState = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentNode!;

      if (node && node instanceof Element) {
        const style = window.getComputedStyle(node);
        
        // Convert px to pt for the selector (1pt = 1.333px)
        const pxSize = parseFloat(style.fontSize);
        const ptSize = Math.round((pxSize / 1.333) * 10) / 10;
        
        // Find closest supported font size to keep the select synced
        const supportedSizes = [8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14, 15, 16, 18, 20, 24];
        const closest = supportedSizes.reduce((prev, curr) => 
          Math.abs(curr - ptSize) < Math.abs(prev - ptSize) ? curr : prev
        );
        setCurrentFontSize(closest.toString());
        
        const family = style.fontFamily.split(',')[0].replace(/['"]/g, '');
        setCurrentFontFamily(family);
        
        // Normalize line height
        const lh = style.lineHeight;
        if (lh === 'normal') {
          setCurrentLineHeight('1.15');
        } else if (lh.includes('px')) {
          const pxLh = parseFloat(lh);
          const pxFs = parseFloat(style.fontSize);
          const ratio = Math.round((pxLh / pxFs) * 100) / 100;
          if (ratio < 1.1) setCurrentLineHeight('1.0');
          else if (ratio < 1.3) setCurrentLineHeight('1.15');
          else if (ratio < 1.7) setCurrentLineHeight('1.5');
          else setCurrentLineHeight('2.0');
        } else {
          setCurrentLineHeight(lh);
        }
      }
    }
  };

  useEffect(() => {
    const updatePageCount = () => {
      if (editorRef.current) {
        const height = editorRef.current.scrollHeight;
        // A4 height is 29.7cm. In pixels (96dpi), it's ~1123px.
        // We use the same measurement as the background pages.
        const pixelsPerPage = 29.7 * (96 / 2.54); 
        const count = Math.max(1, Math.ceil(height / pixelsPerPage));
        setPageCount(count);
      }
    };

    const observer = new ResizeObserver(updatePageCount);
    if (editorRef.current) observer.observe(editorRef.current);
    
    // Also update on input to be more reactive
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', updatePageCount);
      editor.addEventListener('keyup', updateToolbarState);
      editor.addEventListener('mouseup', updateToolbarState);
    }
    
    return () => {
      observer.disconnect();
      if (editor) {
        editor.removeEventListener('input', updatePageCount);
        editor.removeEventListener('keyup', updateToolbarState);
        editor.removeEventListener('mouseup', updateToolbarState);
      }
    };
  }, []);
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

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setAutocompleteState(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      setAutocompleteState(prev => ({ ...prev, isOpen: false }));
      return;
    }

    if (!editorRef.current) return;

    // Get all text before the cursor across all nodes
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const textBeforeCursor = preCaretRange.toString();

    // Find the last '@' or 'arroba' before the cursor
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const lastArrobaWordIndex = textBeforeCursor.toLowerCase().lastIndexOf('arroba');
    
    let triggerIndex = -1;
    let triggerLength = 0;

    if (lastAtSymbolIndex !== -1 && lastAtSymbolIndex > lastArrobaWordIndex) {
      triggerIndex = lastAtSymbolIndex;
      triggerLength = 1;
    } else if (lastArrobaWordIndex !== -1) {
      triggerIndex = lastArrobaWordIndex;
      triggerLength = 6;
    }

    if (triggerIndex !== -1) {
      // Allow spaces so dictation works (e.g. "@ bexiga vazia" or "arroba bexiga vazia")
      const textAfterTrigger = textBeforeCursor.substring(triggerIndex + triggerLength);
      
      // If there are too many characters after trigger without a match, abort to avoid keeping dropdown open forever
      if (textAfterTrigger.length > 50) {
        setAutocompleteState(prev => ({ ...prev, isOpen: false }));
        return;
      }

      const word = textAfterTrigger;
      // Remove spaces, accents, and common punctuation that dictation might add
      const normalizedWord = word.toLowerCase().replace(/[\s.,!?;:]+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (normalizedWord.length > 0) {
        // Levenshtein distance function for fuzzy matching
        const levenshtein = (a: string, b: string) => {
          if (a.length === 0) return b.length;
          if (b.length === 0) return a.length;
          const matrix = [];
          for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
          }
          for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
          }
          for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
              if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
              } else {
                matrix[i][j] = Math.min(
                  matrix[i - 1][j - 1] + 1,
                  matrix[i][j - 1] + 1,
                  matrix[i - 1][j] + 1
                );
              }
            }
          }
          return matrix[b.length][a.length];
        };

        // Check for exact match or very close match (fuzzy) for auto-insertion
        let bestMatch = null;
        let bestDistance = Infinity;

        // Search across ALL phrases, prioritizing the ones from the current mask
        const sortedPhrases = [...phrases].sort((a, b) => {
          if (a.maskId === selectedMask?.id && b.maskId !== selectedMask?.id) return -1;
          if (a.maskId !== selectedMask?.id && b.maskId === selectedMask?.id) return 1;
          return 0;
        });

        for (const p of sortedPhrases) {
          const normalizedTitle = p.title.toLowerCase().replace(/[\s.,!?;:]+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          if (normalizedTitle === normalizedWord) {
            bestMatch = p;
            bestDistance = 0;
            break; // Exact match found, stop searching
          }
          
          // If the word is long enough, allow some typos (e.g., 1 typo for every 5 characters)
          if (normalizedWord.length >= 4) {
            const distance = levenshtein(normalizedTitle, normalizedWord);
            const maxAllowedDistance = Math.floor(normalizedTitle.length / 4); // 25% error margin
            
            if (distance <= maxAllowedDistance && distance < bestDistance) {
              bestDistance = distance;
              bestMatch = p;
            }
          }
        }

        if (bestMatch) {
          // Find the exact node and offset for the trigger to replace it
          const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
          let currentNode;
          let currentOffset = 0;
          let startNode = null;
          let startOffset = 0;

          while ((currentNode = walker.nextNode())) {
            const len = currentNode.textContent?.length || 0;
            if (currentOffset + len > triggerIndex) {
              startNode = currentNode;
              startOffset = triggerIndex - currentOffset;
              break;
            }
            currentOffset += len;
          }

          if (startNode) {
            // Auto-insert exact or fuzzy match
            range.setStart(startNode, startOffset);
            // range.end is already at the cursor
            range.deleteContents();
            
            const html = bestMatch.text.replace(/\n/g, '<br>') + '&nbsp;';
            const el = document.createElement('div');
            el.innerHTML = html;
            
            const frag = document.createDocumentFragment();
            let lastNode;
            while ((lastNode = el.firstChild)) {
              frag.appendChild(lastNode);
            }
            
            range.insertNode(frag);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            saveSelection();
            setAutocompleteState(prev => ({ ...prev, isOpen: false }));
            return;
          }
        }
      }

      // Find matching phrases (partial match)
      const suggestions = currentPhrases.filter(p => {
        const normalizedTitle = p.title.toLowerCase().replace(/[\s.,!?;:]+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedTitle.includes(normalizedWord);
      });

      if (suggestions.length > 0) {
        // Find the exact node and offset for the trigger to position the dropdown
        const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
        let currentNode;
        let currentOffset = 0;
        let startNode = null;
        let startOffset = 0;

        while ((currentNode = walker.nextNode())) {
          const len = currentNode.textContent?.length || 0;
          if (currentOffset + len > triggerIndex) {
            startNode = currentNode;
            startOffset = triggerIndex - currentOffset;
            break;
          }
          currentOffset += len;
        }

        if (startNode) {
          // Get cursor position for dropdown
          const tempRange = document.createRange();
          tempRange.setStart(startNode, startOffset);
          tempRange.setEnd(startNode, startOffset);
          const rect = tempRange.getBoundingClientRect();
          
          setAutocompleteState({
            isOpen: true,
            query: word,
            suggestions: suggestions.slice(0, 5), // Show up to 5 suggestions
            position: { top: rect.bottom, left: rect.left },
            node: startNode,
            startOffset: startOffset,
            endOffset: range.startOffset, // This might be in a different node, but we don't use it for deletion anymore
          });
          setAutocompleteSelectedIndex(0);
        } else {
          setAutocompleteState(prev => ({ ...prev, isOpen: false }));
        }
      } else {
        setAutocompleteState(prev => ({ ...prev, isOpen: false }));
      }
    } else {
      setAutocompleteState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const insertAutocompletePhrase = (phrase: Phrase) => {
    const { node, startOffset, endOffset } = autocompleteState;
    if (!node) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    
    try {
      range.setStart(node, startOffset);
      range.setEnd(node, endOffset);
      range.deleteContents();
      
      const html = phrase.text.replace(/\n/g, '<br>') + '&nbsp;';
      
      const el = document.createElement('div');
      el.innerHTML = html;
      
      const frag = document.createDocumentFragment();
      let lastNode;
      while ((lastNode = el.firstChild)) {
        frag.appendChild(lastNode);
      }
      
      range.insertNode(frag);
      range.collapse(false);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      saveSelection();
    } catch (e) {
      console.error("Error inserting phrase:", e);
    }

    setAutocompleteState(prev => ({ ...prev, isOpen: false }));
    editorRef.current?.focus();
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (autocompleteState.isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteSelectedIndex(prev => 
          prev < autocompleteState.suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (autocompleteState.suggestions[autocompleteSelectedIndex]) {
          insertAutocompletePhrase(autocompleteState.suggestions[autocompleteSelectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setAutocompleteState(prev => ({ ...prev, isOpen: false }));
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

  const changeTextCase = (type: 'upper' | 'sentence') => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    let text = selection.toString();
    if (type === 'upper') {
      text = text.toUpperCase();
    } else {
      text = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
    }
    
    document.execCommand('insertText', false, text);
  };

  const applyLineHeight = (value: string) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === 1) {
        const el = node as HTMLElement;
        const display = window.getComputedStyle(el).display;
        if (display === 'block' || el.tagName === 'P' || el.tagName === 'DIV') {
          el.style.lineHeight = value;
          break;
        }
      }
      node = node.parentNode;
    }
    setCurrentLineHeight(value);
  };

  const applyFontSize = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    // Temporarily disable styleWithCSS to get predictable <font> tags for replacement
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand('fontSize', false, '7');
    
    if (editorRef.current) {
      const fontTags = Array.from(editorRef.current.querySelectorAll('font[size="7"]')) as HTMLElement[];
      // Process backwards to handle nested tags correctly
      fontTags.reverse().forEach(font => {
        const span = document.createElement('span');
        span.style.fontSize = size;
        while (font.firstChild) span.appendChild(font.firstChild);
        font.parentNode?.replaceChild(span, font);
      });
    }
    
    // Re-enable styleWithCSS for other operations
    document.execCommand('styleWithCSS', false, 'true');
    
    setCurrentFontSize(size.replace('pt', ''));
    
    // Trigger page count update
    if (editorRef.current) {
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };

  const [showAdminModal, setShowAdminModal] = useState<'specialty' | 'mask' | 'phrase' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [phraseToInsert, setPhraseToInsert] = useState<Phrase | null>(null);
  const [editedPhraseText, setEditedPhraseText] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('laudospro_specialties_v3', JSON.stringify(specialties));
    localStorage.setItem('laudospro_masks_v10', JSON.stringify(masks));
    localStorage.setItem('laudospro_phrases_v2', JSON.stringify(phrases));
  }, [specialties, masks, phrases]);

  // Auto-calculate obstetrics fields
  useEffect(() => {
    if (!showFieldModal || !selectedMask || !['m4', 'm5', 'm6', 'm10'].includes(selectedMask.id)) return;

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
    } else if (selectedMask.id === 'm10') {
      const ld_c = parseFloat(fieldValues.ld_c);
      const ld_l = parseFloat(fieldValues.ld_l);
      const ld_a = parseFloat(fieldValues.ld_a);
      const le_c = parseFloat(fieldValues.le_c);
      const le_l = parseFloat(fieldValues.le_l);
      const le_a = parseFloat(fieldValues.le_a);

      let ld_vol = 0;
      let le_vol = 0;

      if (!isNaN(ld_c) && !isNaN(ld_l) && !isNaN(ld_a)) {
        ld_vol = ld_c * ld_l * ld_a * 0.523;
      }
      if (!isNaN(le_c) && !isNaN(le_l) && !isNaN(le_a)) {
        le_vol = le_c * le_l * le_a * 0.523;
      }

      if (ld_vol > 0 || le_vol > 0) {
        const total = (ld_vol + le_vol).toFixed(2);
        if (fieldValues.vol_total !== total) updates.vol_total = total;
      }
    }

    if (Object.keys(updates).length > 0) {
      setFieldValues(prev => ({ ...prev, ...updates }));
    }
  }, [fieldValues.ccn, fieldValues.dbp, fieldValues.cc, fieldValues.ca, fieldValues.cf, fieldValues.ig_clinica_semanas, fieldValues.ig_clinica_dias, fieldValues.ig_semanas, fieldValues.ig_dias, fieldValues.ld_c, fieldValues.ld_l, fieldValues.ld_a, fieldValues.le_c, fieldValues.le_l, fieldValues.le_a, showFieldModal, selectedMask, useBarcelona]);

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

  const insertAtEnd = (text: string) => {
    if (!editorRef.current) return;
    
    // Ensure there's a break before inserting at the end if the editor is not empty
    const prefix = editorRef.current.innerHTML.length > 0 ? '<br><br>' : '';
    const html = prefix + text.replace(/\n/g, '<br>');
    
    // Append to the end
    editorRef.current.innerHTML += html;
    
    // Trigger page count update
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const handlePhraseClick = (phrase: Phrase) => {
    setPhraseToInsert(phrase);
    setEditedPhraseText(phrase.text);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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

  const handleAskAI = async (ai: 'chatgpt' | 'gemini' | 'claude') => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    if (!text) {
      alert('O laudo está vazio. Escreva algo antes de perguntar à IA.');
      return;
    }

    const optionsText = ai === 'claude' 
      ? `IMPORTANTE PARA O CLAUDE: Utilize obrigatoriamente a ferramenta interativa 'ask_user_input' para apresentar as opções como botões clicáveis — nunca liste as opções apenas em texto corrido. Use duas perguntas separadas para cobrir todas as opções:

Pergunta 1: "Selecione a ação desejada (parte 1):"
- Revisão Gramatical
- Refinamento de Texto
- Formatação Estruturada
- Cálculo de Volumes

Pergunta 2: "Selecione a ação desejada (parte 2):"
- Verificação de Consistência
- Adição de Patologias
- Análise Comparativa
- Incorporação de Mudanças`
      : `Apresente as seguintes opções em uma lista numerada (1 a 8) e informe ao usuário que ele pode responder apenas com o número correspondente para facilitar a escolha:

1. Revisão Gramatical
2. Refinamento de Texto
3. Formatação Estruturada
4. Cálculo de Volumes
5. Verificação de Consistência
6. Adição de Patologias
7. Análise Comparativa
8. Incorporação de Mudanças`;

    const prompt = `Você é um assistente especializado em edição e revisão de laudos radiológicos, atuando como uma ferramenta pura de auxílio diagnóstico e redação médica.

Sua PRIMEIRA AÇÃO deve ser confirmar o recebimento do laudo abaixo e apresentar as opções de ação ao usuário. 

${optionsText}

Diretrizes de Formatação para o Texto Final:
1. **Fonte:** O texto deve ser pensado para Arial tamanho 10.
2. **Negritos:** Mantenha todos os negritos originais e adicione novos onde necessário para clareza.
3. **Títulos:** Devem estar em CAIXA ALTA e em **Negrito**.
4. **Seções Específicas:** Os termos **ANÁLISE**, **TÉCNICA** e **CONCLUSÃO** devem estar sempre em **Negrito**.

Instruções cruciais:
1. **Saída Limpa:** Ao realizar qualquer tarefa de edição, revisão ou formatação, sua resposta deve conter EXCLUSIVAMENTE o texto do laudo. É terminantemente proibido incluir introduções (ex: "Aqui está o laudo..."), saudações, explicações ou comentários antes ou depois do texto médico.
2. **Interação Inicial:** Apenas em sua primeira resposta, confirme o recebimento e apresente as opções (como botões no Claude ou lista numerada nas demais). Após a escolha do usuário, foque apenas na entrega do texto técnico.
3. **Precisão Técnica:** Seja extremamente preciso com terminologia médica e classificações (BI-RADS, TI-RADS, etc).
4. **Foco Absoluto:** Mantenha o comportamento de uma ferramenta de software, sem personalidade ou diálogos informais.
5. **Geração de Patologias:** Se o usuário solicitar a inclusão de uma patologia específica (ex: "descreva uma apendicite") sem fornecer detalhes adicionais, você deve gerar uma descrição radiológica padrão, completa e tecnicamente correta para essa patologia no corpo do laudo e incluí-la obrigatoriamente na seção **CONCLUSÃO**.

LAUDO PARA REVISÃO:

${text}`;
    
    // Always copy to clipboard for reliability
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (err) {
      console.error('Erro ao copiar para área de transferência:', err);
    }

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

  const savePhrase = (phraseData: Partial<Phrase>) => {
    if (editingItem) {
      setPhrases(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...phraseData } as Phrase : p));
    } else {
      setPhrases(prev => [...prev, { ...phraseData, id: Date.now().toString(), maskId: selectedMask!.id } as Phrase]);
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
    <div className="flex h-screen w-screen bg-slate-100 text-slate-900 font-sans overflow-hidden relative">
      {/* AI Confirmation Modal */}
      <AnimatePresence>
        {aiConfirm && aiConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 mb-2">Laudo Copiado!</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  O laudo e as instruções foram copiados. Clique no botão abaixo e, na nova aba, use <span className="text-purple-600 font-bold">Ctrl + V</span> para colar.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    window.open(aiConfirm.url, '_blank');
                    setAiConfirm(null);
                  }}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Abrir {aiConfirm.ai} <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => setAiConfirm(null)}
                  className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1 - Sidebar: Specialties */}
      <aside className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl z-30 transition-all duration-300 overflow-hidden",
        isSidebarOpen ? "w-52" : "w-0"
      )}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 min-w-[208px]">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50 shrink-0">
            <Stethoscope size={18} />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-base leading-tight tracking-tight text-white truncate">Laudos Pro</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar min-w-[208px]">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Especialidades</p>
            {isAdmin && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('specialty'); }}
                className="p-1 hover:bg-slate-800 rounded text-blue-400 transition-colors"
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
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
                    className="p-1.5 bg-slate-800 shadow-sm border border-slate-700 rounded-lg text-slate-400 hover:text-blue-400"
                  >
                    <Settings size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSpecialty(spec.id); }}
                    className="p-1.5 bg-slate-800 shadow-sm border border-slate-700 rounded-lg text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-slate-800 flex flex-col gap-2 min-w-[192px] lg:min-w-[224px]">
          {isAdmin && (
            <button 
              onClick={() => {
                if (window.confirm('Isso irá resetar todas as especialidades e máscaras para o padrão original. Deseja continuar?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-colors"
            >
              <Eraser size={16} />
              Resetar para Padrões
            </button>
          )}
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isAdmin ? "bg-amber-900/20 text-amber-400 hover:bg-amber-900/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Settings size={16} />
            {isAdmin ? "Sair do Modo Admin" : "Modo Administrador"}
          </button>
        </div>
      </aside>

      {/* 2 - Central Area (Masks & Phrases) */}
      <div className={cn(
        "flex flex-col shrink-0 bg-slate-50 border-r border-slate-300 transition-all duration-300 overflow-hidden",
        isCentralPanelOpen ? "w-[500px] xl:w-[580px]" : "w-0"
      )}>
        <div className="min-w-[500px] xl:min-w-[580px] flex-1 flex flex-col overflow-hidden">
          {/* Top: Masks */}
          <section className="h-[55%] flex flex-col border-b border-slate-300 overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-700" />
              <h2 className="font-black text-base text-slate-900 uppercase tracking-tight">Máscaras de Laudo</h2>
            </div>
            {isAdmin && selectedSpecId && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('mask'); }}
                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-md"
              >
                <Plus size={12} /> Nova
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-100">
            {!selectedSpecId ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <ChevronRight size={32} className="opacity-20 rotate-180" />
                <p className="text-xs font-medium">Selecione uma especialidade</p>
              </div>
            ) : filteredMasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText size={32} className="opacity-20" />
                <p className="text-xs font-medium">Nenhuma máscara</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-5">
                {filteredMasks.map(mask => (
                  <div key={mask.id} className="group relative">
                    <button
                      onClick={() => handleSelectMask(mask)}
                      className={cn(
                        "w-full p-4 lg:p-6 rounded-2xl lg:rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col gap-2 lg:gap-4",
                        selectedMask?.id === mask.id
                          ? "bg-white border-blue-500 shadow-xl shadow-blue-200 ring-2 ring-blue-500/10"
                          : "bg-white border-slate-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 lg:gap-4">
                        <div className={cn(
                          "p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-colors",
                          selectedMask?.id === mask.id ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                        )}>
                          <ClipboardList size={20} />
                        </div>
                        {mask.fields.length > 0 && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            selectedMask?.id === mask.id ? "bg-blue-200 text-blue-800" : "bg-slate-200 text-slate-600"
                          )}>
                            {mask.fields.length} campos
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex-1">
                        <h3 className={cn(
                          "font-bold text-sm lg:text-base mb-1 transition-colors leading-tight",
                          selectedMask?.id === mask.id ? "text-blue-900" : "text-slate-800"
                        )}>{mask.name}</h3>
                        <p className="text-[11px] lg:text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium opacity-80">
                          {stripHtml(mask.baseContent)}
                        </p>
                      </div>

                      <div className={cn(
                        "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mt-2",
                        selectedMask?.id === mask.id ? "text-blue-700" : "text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      )}>
                        <span>{selectedMask?.id === mask.id ? "Selecionada" : "Clique para usar"}</span>
                        <ChevronRight size={14} className={cn(selectedMask?.id === mask.id ? "animate-pulse" : "")} />
                      </div>

                      {selectedMask?.id === mask.id && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                      )}
                    </button>
                    {isAdmin && (
                      <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(mask); setShowAdminModal('mask'); }}
                          className="p-2 bg-white shadow-xl border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:scale-110 transition-all"
                          title="Editar Máscara"
                        >
                          <Settings size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteMask(mask.id); }}
                          className="p-2 bg-white shadow-xl border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:scale-110 transition-all"
                          title="Excluir Máscara"
                        >
                          <Trash2 size={14} />
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
        <section className="h-[45%] flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-700" />
              <h2 className="font-black text-base text-slate-900 uppercase tracking-tight">SmartPhrases</h2>
            </div>
            {isAdmin && selectedMask && (
              <button 
                onClick={() => { setEditingItem(null); setShowAdminModal('phrase'); }}
                className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-md"
              >
                <Plus size={12} /> Nova
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-100">
            {selectedSpecId === '4' && (
              <div className="mb-8 lg:mb-10">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <div className="w-1 h-3 lg:h-4 bg-purple-500 rounded-full"></div>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-600 uppercase tracking-widest">Calculadoras Ginecológicas</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowOradsModal(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-purple-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm relative z-10 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      <Calculator size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">O-RADS</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Avaliação padronizada de massas anexiais</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {selectedSpecId === '5' && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Calculadoras Obstétricas</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowCalcBarcelona(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Activity size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">Barcelona</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Crescimento fetal e estudo Doppler</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>

                  <button
                    onClick={() => setShowCalcIG(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Calendar size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">Idade Gestacional</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Cálculo de IG por DUM ou USG</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>

                  <button
                    onClick={() => setShowCalcBishop(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <BookOpen size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">Índice de Bishop</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Avaliação cervical para indução</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {selectedSpecId === '6' && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Calculadoras de Mama</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowCalcBiradsMama(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-orange-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm relative z-10 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                      <Calculator size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">BI-RADS® Mama</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Assistente de descrição e classificação</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {selectedSpecId === '7' && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Calculadoras de Tireoide</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowCalcTirads(true)}
                    className="group relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col gap-4 bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Calculator size={24} />
                    </div>
                    <div className="relative z-10">
                      <span className="font-black text-slate-800 text-lg block mb-1">TI-RADS (ACR)</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">Classificação de nódulos tireoidianos</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir Calculadora <ChevronRight size={12} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!selectedMask ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <MessageSquare size={32} className="opacity-20" />
                <p className="text-xs font-medium">Selecione uma máscara</p>
              </div>
            ) : currentPhrases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <MessageSquare size={32} className="opacity-20" />
                <p className="text-xs font-medium">Nenhuma frase cadastrada</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar frases..."
                    value={phraseSearchQuery}
                    onChange={(e) => setPhraseSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                {(Object.entries(
                  currentPhrases
                    .filter(p => {
                      if (!phraseSearchQuery) return true;
                      const q = phraseSearchQuery.toLowerCase();
                      return (
                        p.title?.toLowerCase().includes(q) ||
                        p.text.toLowerCase().includes(q) ||
                        p.category?.toLowerCase().includes(q)
                      );
                    })
                    .reduce((acc, phrase) => {
                      const cat = phrase.category || 'Geral';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(phrase);
                      return acc;
                    }, {} as Record<string, Phrase[]>)
                ) as [string, Phrase[]][]).map(([category, categoryPhrases]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{category}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {categoryPhrases.map(phrase => (
                        <div key={phrase.id} className="group relative w-full">
                          <button
                            onClick={() => handlePhraseClick(phrase)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-[11px] text-slate-700 hover:border-emerald-500 hover:text-emerald-800 hover:shadow-md transition-all active:scale-95 text-left shadow-sm flex flex-col gap-1.5"
                          >
                            {phrase.title && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 text-xs">{phrase.title}</span>
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  @{phrase.title.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
                                </span>
                              </div>
                            )}
                            <span className="font-medium leading-relaxed whitespace-pre-wrap">{phrase.text}</span>
                          </button>
                          {isAdmin && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>

      {/* 3 - Editor Area (Google Docs Style) */}
      <main className="flex-1 bg-slate-200 flex flex-col min-w-0 overflow-hidden relative border-l border-slate-300">
        {/* Tabs Area */}
        <div className="flex items-center gap-1 px-2 pt-2 bg-slate-100 border-b border-slate-300 overflow-x-auto shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-bold transition-all border border-b-0",
                activeTabId === tab.id 
                  ? "bg-white text-blue-700 border-slate-300 z-10 relative -mb-px" 
                  : "bg-slate-200 text-slate-500 border-transparent hover:bg-slate-300"
              )}
            >
              {tab.title}
              {tabs.length > 1 && (
                <span 
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className="p-0.5 rounded-full hover:bg-slate-300/50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={12} />
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleNewReport}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-t-lg transition-colors ml-1"
            title="Novo Laudo"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-300 px-4 py-2 flex flex-col gap-2 shadow-sm shrink-0">
          {/* Row 1: Primary Actions & View Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider",
                    isSidebarOpen ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )} 
                >
                  <Stethoscope size={14} />
                  Menu
                </button>
                <button 
                  onClick={() => setIsCentralPanelOpen(!isCentralPanelOpen)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider",
                    isCentralPanelOpen ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )} 
                >
                  <FileText size={14} />
                  Máscaras
                </button>
              </div>

              <div className="h-6 w-px bg-slate-300 mx-2" />

              <div className="flex items-center gap-1">
                <button 
                  onClick={handleNewReport}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-blue-200"
                >
                  <Plus size={16} /> Novo Laudo
                </button>
                <button 
                  onClick={clearEditor}
                  className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-amber-200"
                >
                  <Eraser size={16} /> Limpar
                </button>
              </div>

              <div className="h-6 w-px bg-slate-300 mx-2" />

              <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 gap-1">
                <div className="flex items-center gap-1.5 px-2 border-r border-slate-200 mr-1">
                  <Sparkles size={14} className="text-purple-600" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pergunte à IA</span>
                </div>
                <button 
                  onClick={() => handleAskAI('chatgpt')}
                  className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center gap-1.5"
                >
                  ChatGPT
                </button>
                <button 
                  onClick={() => handleAskAI('gemini')}
                  className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center gap-1.5"
                >
                  Gemini
                </button>
                <button 
                  onClick={() => handleAskAI('claude')}
                  className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center gap-1.5"
                >
                  Claude
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Zoom</span>
                <select 
                  value={editorZoom}
                  onChange={(e) => setEditorZoom(parseFloat(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 w-24"
                >
                  <option value="0">Ajustar</option>
                  <option value="0.5">50%</option>
                  <option value="0.6">60%</option>
                  <option value="0.7">70%</option>
                  <option value="0.8">80%</option>
                  <option value="0.9">90%</option>
                  <option value="1.0">100%</option>
                  <option value="1.1">110%</option>
                  <option value="1.2">120%</option>
                  <option value="1.3">130%</option>
                  <option value="1.4">140%</option>
                  <option value="1.5">150%</option>
                </select>
              </div>

              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Copy size={18} /> Copiar Laudo
              </button>
            </div>
          </div>

          {/* Row 2: Formatting Tools */}
          <div className="flex items-center gap-4 py-1 border-t border-slate-100">
            <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button onClick={() => document.execCommand('bold')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><Bold size={16} /></button>
                <button onClick={() => document.execCommand('italic')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><Italic size={16} /></button>
                <button onClick={() => document.execCommand('underline')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><span className="font-serif underline font-bold text-sm leading-none">U</span></button>
              </div>
              
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 ml-2">
                <button onClick={() => document.execCommand('justifyLeft')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg></button>
                <button onClick={() => document.execCommand('justifyCenter')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg></button>
                <button onClick={() => document.execCommand('justifyRight')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/></svg></button>
              </div>

              <button onClick={() => document.execCommand('insertUnorderedList')} className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all ml-2"><List size={16} /></button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Fonte</span>
                <select 
                  value={currentFontFamily}
                  onChange={(e) => { document.execCommand('fontName', false, e.target.value); setCurrentFontFamily(e.target.value); }}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 outline-none w-32"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tam.</span>
                <select 
                  value={currentFontSize}
                  onChange={(e) => applyFontSize(e.target.value + 'pt')}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 outline-none w-14"
                >
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Esp.</span>
                <select 
                  value={currentLineHeight}
                  onChange={(e) => applyLineHeight(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 outline-none w-14"
                >
                  <option value="1.0">1.0</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5">1.5</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Page Container */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 flex flex-col items-center bg-slate-200 shadow-inner custom-scrollbar editor-scroll-container">
          <div 
            style={{ 
              width: `${21 * (editorZoom || 1)}cm`, 
              height: `${Math.max(1, pageCount) * 29.7 * (editorZoom || 1) + 5}cm`,
              transition: 'all 0.3s ease'
            }}
            className="relative flex flex-col items-center"
          >
            <div 
              className="origin-top transition-all duration-300 flex flex-col items-center"
              style={{ 
                transform: `scale(${editorZoom || 1})`,
                width: '21cm'
              }}
            >
              <EditorRuler />
              
              {/* The Editor Sheet */}
              <div 
                className="bg-white shadow-2xl w-[21cm] relative flex flex-col border-x border-slate-300"
                style={{ 
                  minHeight: `${Math.max(1, pageCount) * 29.7}cm`,
                  // Visual page break line every 29.7cm
                  backgroundImage: 'linear-gradient(to bottom, transparent 29.68cm, #cbd5e1 29.68cm, #cbd5e1 29.72cm, transparent 29.72cm)',
                  backgroundSize: '100% 29.72cm',
                  transition: 'min-height 0.3s ease'
                }}
                onClick={() => editorRef.current?.focus()}
              >
                <div 
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                  onBlur={saveSelection}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  style={{ 
                    fontFamily: 'Arial, sans-serif', 
                    fontSize: '11pt',
                    color: '#202124',
                    lineHeight: '1.6',
                    padding: '2.5cm',
                    minHeight: '29.7cm'
                  }}
                  className="w-full h-full outline-none max-w-none break-words bg-transparent"
                  data-placeholder="Comece a digitar ou selecione uma máscara..."
                />
              </div>
            </div>
          </div>
          
          {/* Bottom spacing */}
          <div className="h-20 shrink-0" />
        </div>

        {/* Floating Status */}
        <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-2">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 border-r border-slate-200 pr-3">
              <FileText size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Página {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pronto para Word / PACS</span>
            </div>
          </div>
        </div>
      </main>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {autocompleteState.isOpen && autocompleteState.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-[150] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden min-w-[300px] max-w-[400px]"
            style={{
              top: autocompleteState.position.top + 5,
              left: autocompleteState.position.left,
            }}
          >
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sugestões de Frases</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {autocompleteState.suggestions.map((phrase, index) => (
                <button
                  key={phrase.id}
                  onClick={() => insertAutocompletePhrase(phrase)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex flex-col gap-1 group ${
                    index === autocompleteSelectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${index === autocompleteSelectedIndex ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-700'}`}>
                      @{phrase.title.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      index === autocompleteSelectedIndex ? 'bg-blue-100 text-blue-600' : 'text-slate-400 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      {phrase.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{phrase.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Phrase Insertion Modal */}
      {phraseToInsert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Smart Phrase</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{phraseToInsert.category}</p>
              </div>
              <button onClick={() => setPhraseToInsert(null)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Atalho Rápido</p>
                    <p className="text-sm text-blue-600">Digite este comando no editor para inserir a frase diretamente:</p>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                    <code className="text-sm font-black text-blue-700">@{phraseToInsert.title.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}</code>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conteúdo da Frase</label>
                <textarea
                  value={editedPhraseText}
                  onChange={(e) => setEditedPhraseText(e.target.value)}
                  className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none leading-relaxed font-medium"
                  placeholder="Edite a frase antes de inserir..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { insertAtCursor(editedPhraseText + ' '); setPhraseToInsert(null); }}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} /> Inserir no Cursor
                </button>
                <button
                  onClick={() => { insertAtEnd(editedPhraseText); setPhraseToInsert(null); }}
                  className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowDown size={18} /> Inserir ao Final
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    const form = e.target as any;
                    savePhrase({
                      title: form.title.value,
                      category: form.category.value,
                      text: form.text.value
                    }); 
                  }}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-600 ml-1">Título (Opcional)</label>
                          <input name="title" defaultValue={editingItem?.title} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-600 ml-1">Categoria (Opcional)</label>
                          <input name="category" defaultValue={editingItem?.category} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-600 ml-1">Texto da Frase</label>
                        <textarea name="text" defaultValue={editingItem?.text} required rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
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

      {showCalcBiradsMama && (
        <CalculadoraBiradsMama 
          onClose={() => setShowCalcBiradsMama(false)}
          onInsert={(text, birads, side, conclusao, recomendacao) => {
            if (showFieldModal && selectedMask?.id === 'm9') {
              const fieldKey = side === 'dir' ? 'achados_dir' : 'achados_esq';
              setFieldValues(prev => ({
                ...prev,
                [fieldKey]: (prev[fieldKey] || '') + (prev[fieldKey] ? '\n' : '') + text,
                'birads': birads,
                'conclusao': (prev['conclusao'] || '') + (prev['conclusao'] ? '\n' : '') + conclusao,
                'recomendacao': (prev['recomendacao'] || '') + (prev['recomendacao'] ? '\n' : '') + recomendacao
              }));
            } else {
              // Direct insertion into editor if no field modal or different mask
              const content = `<br><b>Achados (${side === 'dir' ? 'Mama Direita' : 'Mama Esquerda'}):</b><br>${text.replace(/\n/g, '<br>')}<br><b>Conclusão:</b> ${conclusao}<br><b>BI-RADS:</b> ${birads}<br><b>Recomendação:</b> ${recomendacao}<br><br>`;
              insertAtCursor(content);
            }
            setShowCalcBiradsMama(false);
          }}
        />
      )}

      {showCalcTirads && (
        <CalculadoraTirads 
          onClose={() => setShowCalcTirads(false)}
          onInsert={(text) => {
            if (showFieldModal && selectedMask?.id === 'm10') {
              setFieldValues(prev => ({
                ...prev,
                'achados': (prev['achados'] || '') + (prev['achados'] ? '\n\n' : '') + text
              }));
            } else {
              const content = `<br><b>Nódulos Tireoidianos:</b><br>${text.replace(/\n/g, '<br>')}<br>`;
              insertAtCursor(content);
            }
            setShowCalcTirads(false);
          }}
        />
      )}
    </div>
  );
}
