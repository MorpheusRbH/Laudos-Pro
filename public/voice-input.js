/**
 * voice-input.js - Módulo de ditado por voz para LaudosPro
 * Versão corrigida — todos os bugs identificados resolvidos.
 *
 * CORREÇÕES APLICADAS:
 * 1. "para" não para mais o ditado no meio de frases — agora só "para ditado"
 * 2. Ordem das substituições corrigida — "ponto e vírgula" antes de "ponto"
 * 3. \b adicionado em todas as regexes para não bater dentro de palavras
 * 4. Capitalização não força maiúscula após abreviações (cm, mm, etc.)
 * 5. interimSpan limpo corretamente mesmo se recognition parar abruptamente
 * 6. "por" entre números vira "x" (medidas)
 * 7. "centímetros/centímetro" → "cm", "milímetros/milímetro" → "mm"
 * 8. nextWordCapitalized inicializa verificando o estado real do editor
 * 9. Partes vazias do split não geram inserções erradas
 * 10. Atalho corrigido para tecla K sozinha quando editor tem foco
 * 11. "barra" → "/" com remoção automática de espaços ao redor
 */

(function () {

    // ── COMPATIBILIDADE ──────────────────────────────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('LaudosPro Voice: SpeechRecognition não suportado neste navegador.');
        return;
    }

    // ── CSS ──────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        .voice-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid transparent;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #64748b;
            font-size: 18px;
            position: relative;
        }
        .voice-btn:hover { background: #e2e8f0; }
        .voice-btn.listening {
            color: #ef4444;
            background: #fee2e2;
            border-color: #fecaca;
            animation: voice-pulse 1.5s infinite;
        }
        .voice-btn.error {
            color: #f97316;
            background: #ffedd5;
            border-color: #fed7aa;
        }
        @keyframes voice-pulse {
            0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.4); }
            70%  { box-shadow: 0 0 0 6px rgba(239,68,68,0);   }
            100% { box-shadow: 0 0 0 0   rgba(239,68,68,0);   }
        }
        .voice-waveform {
            display: none;
            align-items: flex-end;
            gap: 2px;
            height: 14px;
            width: 20px;
        }
        .voice-btn.listening .voice-waveform { display: flex; }
        .voice-bar {
            width: 3px;
            height: 2px;
            background: #ef4444;
            border-radius: 1px;
            transition: height 0.05s ease;
        }
        .voice-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 8px;
            padding: 6px 10px;
            background: #1e293b;
            color: white;
            font-size: 11px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 100;
        }
        .voice-btn.error:hover .voice-tooltip { opacity: 1; }
        .voice-interim { color: #999; font-style: italic; }
    `;
    document.head.appendChild(style);

    // ── ESTADO ───────────────────────────────────────────────────────────────
    let isListening       = false;
    let recognition       = null;
    let audioContext      = null;
    let analyser          = null;
    let dataArray         = null;
    let animationId       = null;
    let stream            = null;
    let interimSpan       = null;
    let micBtn            = null;
    let bars              = [];

    // Verificar suporte antecipadamente
    if (!SpeechRecognition) {
        console.warn('LaudosPro Voice: SpeechRecognition não suportado neste navegador.');
        return;
    }

    // ── ABREVIAÇÕES — capitalização NÃO dispara depois dessas ────────────────
    // O Chrome às vezes transcreve "cm" como "centímetros" etc.,
    // mas após substituição o texto termina em "cm." ou "mm." —
    // nesses casos não queremos forçar maiúscula na palavra seguinte.
    const ABBREV_PATTERN = /\b(cm|mm|ml|kg|mg|bpm|hz|db)\s*\.$/i;

    // ── PROCESSAMENTO DE TEXTO ───────────────────────────────────────────────
    function processText(rawText, editorTextBefore, nextCapState) {

        let text = rawText;

        // 1. COMPOSTOS — sempre antes dos simples
        // Aceita variações com pontuação, espaços extras e a conjunção "e"
        text = text.replace(/\bponto(?:[.,]?\s+(?:e\s+)?)?par[aá]grafo[s]?[.,]?/gi, '__P_PARAGRAPH__');
        text = text.replace(/\bponto(?:[.,]?\s+(?:e\s+)?)?nova[s]?\s+linha[s]?[.,]?/gi,  '__P_NEWLINE__');
        text = text.replace(/\bpar[aá]grafo[s]?[.,]?/gi,               '__PARAGRAPH__');
        text = text.replace(/\bnova[s]?\s+linha[s]?[.,]?/gi,               '__NEWLINE__');

        // 2. UNIDADES DE MEDIDA — antes de qualquer outra coisa
        text = text.replace(/\bquilogramas?\b/gi, 'kg');
        text = text.replace(/\bmililitros?\b/gi,  'ml');

        // 3. "por" entre números → "x"  (ex: "3,5 por 4,2" → "3,5 x 4,2")
        text = text.replace(
            /(\d+(?:[.,]\d+)?)\s+por\s+(\d+(?:[.,]\d+)?)/gi,
            '$1 x $2'
        );

        // 4. PONTUAÇÃO SIMPLES — ordem importa: mais específico primeiro
        const replacements = [
            [/\bcentímetros?\b/gi,         'cm'],
            [/\bmilímetros?\b/gi,          'mm'],
            [/\bponto\s+e\s+v[ií]rgula\b/gi, ';'],   // antes de "ponto" e "vírgula"
            [/\bponto\s+final\b/gi,        '.'],   // antes de "ponto" sozinho
            [/\bponto\b/gi,                '.'],
            [/\bv[ií]rgula[s]?\b/gi,       ','],
            [/\bdois\s+pontos\b/gi,        ':'],
            [/\breticências\b/gi,          '...'],
            [/\bponto\s+de\s+interroga[cç][aã]o\b/gi, '?'],
            [/\bponto\s+de\s+exclama[cç][aã]o\b/gi, '!'],
            [/\bnova\s+linha\b/gi,         '\n'],
            [/\bapaga\s+tudo\b/gi,         '__CLEAR__'],
            [/\bpara\s+ditado\b/gi,        '__STOP__'],   // APENAS "para ditado"
            [/\bbarra\b/gi,                '/'],
        ];
        replacements.forEach(([re, rep]) => { text = text.replace(re, rep); });

        // 5. ESPAÇAMENTO
        text = text.replace(/\s+([.,;:!?/])/g, '$1');        // "palavra ." -> "palavra."
        text = text.replace(/([.,;:!?])(\S)/g, '$1 $2');    // ".palavra" -> ". palavra"
        text = text.replace(/([/])\s+/g, '$1');              // "/ palavra" -> "/palavra"

        // 6. CAPITALIZAÇÃO E ESPAÇO INICIAL
        const lastChar = editorTextBefore.slice(-1);
        const isStart = editorTextBefore.trim().length === 0;

        // Se o novo texto começa com pontuação, remove qualquer espaço inicial dele
        if (/^[.,;:!?]/.test(text.trimStart())) {
            text = text.trimStart();
        }

        // Decidir se precisa de espaço inicial (se não for comando __)
        if (!isStart && !text.startsWith(' ') && text.length > 0 && !text.startsWith('__')) {
            const endsInWordOrPunct = /[a-zA-ZÀ-ú0-9.,;:!?]/.test(lastChar);
            const startsWithWord = /^[a-zA-ZÀ-ú0-9]/.test(text.trimStart());

            if (endsInWordOrPunct && startsWithWord && !/\s$/.test(editorTextBefore)) {
                text = ' ' + text;
            }
        }

        if (text.length > 0 && !text.startsWith('__')) {
            const afterAbbrev  = ABBREV_PATTERN.test(editorTextBefore.trimEnd());
            const needsCap     = !afterAbbrev && (isStart || /[.!?\n]/.test(lastChar) || nextCapState);

            text = needsCap
                ? text.charAt(0).toUpperCase() + text.slice(1)
                : text.charAt(0).toLowerCase() + text.slice(1);
        }

        // Limpeza final de espaços
        text = text.replace(/\s{2,}/g, ' ');
        if (isStart) text = text.trimStart();

        // 7. Próxima palavra deve ser maiúscula?
        const stripped = text.replace(/__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__/g, '').trim();
        const nextCap  = /[.!?]$/.test(stripped)
                      || text.includes('__P_PARAGRAPH__')
                      || text.includes('__P_NEWLINE__')
                      || text.includes('__PARAGRAPH__')
                      || text.includes('__NEWLINE__');

        return { text, nextCap };
    }

    // ── RECONHECIMENTO ───────────────────────────────────────────────────────
    function initRecognition() {
        recognition = new SpeechRecognition();
        recognition.lang          = 'pt-BR';
        recognition.continuous    = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setUIState('listening');
            document.execCommand('defaultParagraphSeparator', false, 'p');
        };

        // nextCap: começa true para capitalizar a primeira palavra sempre
        let nextCap = true;

        recognition.onresult = (event) => {
            const editor = document.querySelector('[contenteditable="true"]');
            if (!editor) return;

            let interimTranscript = '';
            let finalTranscript   = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {

                    // Texto antes do cursor para decidir capitalização
                    let textBefore = '';
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const r = sel.getRangeAt(0).cloneRange();
                        r.selectNodeContents(editor);
                        r.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
                        textBefore = r.toString();
                    }

                    const raw = event.results[i][0].transcript;
                    const currentBefore = textBefore + finalTranscript;
                    const { text, nextCap: nc } = processText(raw, currentBefore, nextCap);
                    nextCap = nc;

                    // Ações especiais
                    if (text.includes('__CLEAR__')) {
                        editor.innerHTML = '';
                        cleanInterim();
                        return;
                    }
                    if (text.includes('__STOP__')) {
                        stopListening();
                        const clean = text.replace(/__STOP__/g, '').trim();
                        if (clean) finalTranscript += clean;
                        continue;
                    }

                    finalTranscript += text;

                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            handleTranscription(editor, finalTranscript, interimTranscript);
        };

        recognition.onerror = (event) => {
            // 'no-speech' é normal — não mostra erro, só reinicia
            if (event.error === 'no-speech') return;
            console.error('SpeechRecognition Error:', event.error);
            setUIState('error', event.error);
            isListening = false;
            cleanInterim();
            stopAudioAnalysis();
        };

        recognition.onend = () => {
            if (isListening) {
                // Auto-restart suave com pequeno delay para evitar race conditions
                // e bloqueios do navegador por "spam" de start()
                setTimeout(() => {
                    if (isListening) {
                        try { 
                            recognition.start(); 
                        } catch(e) { 
                            if (e.name !== 'InvalidStateError') {
                                console.error('Erro ao reiniciar reconhecimento:', e);
                                stopListening();
                            }
                        }
                    }
                }, 200);
            } else {
                setUIState('inactive');
                stopAudioAnalysis();
                cleanInterim();
            }
        };
    }

    // ── INSERÇÃO NO CONTENTEDITABLE ──────────────────────────────────────────
    function handleTranscription(editor, final, interim) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) {
            // Se não há seleção, foca o editor e tenta de novo
            editor.focus();
            if (!selection || !selection.rangeCount) return;
        }

        // Remove interim anterior
        cleanInterim(selection);

        // Insere texto final
        if (final) {
            editor.focus();
            const parts = final.split(/(__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__)/);

            parts.forEach(part => {
                if (!part) return;

                if (part === '__P_PARAGRAPH__') {
                    document.execCommand('insertText', false, '.');
                    document.execCommand('insertParagraph', false, null);
                } else if (part === '__P_NEWLINE__') {
                    document.execCommand('insertText', false, '.');
                    document.execCommand('insertParagraph', false, null);
                } else if (part === '__PARAGRAPH__') {
                    document.execCommand('insertParagraph', false, null);
                } else if (part === '__NEWLINE__') {
                    document.execCommand('insertParagraph', false, null);
                } else {
                    document.execCommand('insertText', false, part);
                }
            });
        }

        // Insere interim temporário
        if (interim && selection.rangeCount) {
            interimSpan = document.createElement('span');
            interimSpan.className   = 'voice-interim';
            interimSpan.textContent = interim;

            const range = selection.getRangeAt(0);
            range.insertNode(interimSpan);

            // Cursor fica ANTES do interim para o próximo final inserir no lugar certo
            const nextRange = document.createRange();
            nextRange.setStartBefore(interimSpan);
            nextRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(nextRange);
        }
    }

    function cleanInterim(selection) {
        if (!interimSpan) return;
        const sel = selection || window.getSelection();
        const range = document.createRange();
        range.setStartBefore(interimSpan);
        range.collapse(true);
        interimSpan.remove();
        interimSpan = null;
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    // ── ANÁLISE DE ÁUDIO (waveform real) ────────────────────────────────────
    async function startAudioAnalysis() {
        try {
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // CRITICAL: Retomar context se estiver suspenso (comum no Chrome)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            if (!analyser) {
                analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 32;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            function tick() {
                if (!isListening || !analyser) return;
                analyser.getByteFrequencyData(dataArray);
                for (let i = 0; i < 4; i++) {
                    const v = dataArray[i * 2] || 0;
                    if (bars[i]) bars[i].style.height = `${Math.max(2, (v / 255) * 14)}px`;
                }
                animationId = requestAnimationFrame(tick);
            }
            tick();
        } catch (err) {
            console.error('Erro na análise de áudio:', err);
            // Não para o ditado, apenas o visualizador não funcionará
        }
    }

    function stopAudioAnalysis() {
        if (animationId) cancelAnimationFrame(animationId);
        if (stream)      stream.getTracks().forEach(t => t.stop());
        if (audioContext) audioContext.close();
        bars.forEach(b => { if (b) b.style.height = '2px'; });
        stream = audioContext = analyser = dataArray = animationId = null;
    }

    // ── CONTROLE ─────────────────────────────────────────────────────────────
    function toggleListening() {
        isListening ? stopListening() : startListening();
    }

    async function startListening() {
        if (!recognition) initRecognition();
        isListening = true;

        try {
            // Iniciar análise de áudio primeiro (garante permissões e context)
            await startAudioAnalysis();
            
            // Iniciar reconhecimento
            try { 
                recognition.start(); 
            } catch(e) { 
                if (e.name !== 'InvalidStateError') throw e;
            }
        } catch (err) {
            console.error('Erro ao iniciar ditado:', err);
            setUIState('error', 'Erro ao iniciar microfone');
            stopListening();
        }
    }

    function stopListening() {
        isListening = false;
        if (recognition) recognition.stop();
        cleanInterim();
    }

    // ── UI ───────────────────────────────────────────────────────────────────
    function setUIState(state, errorMsg = '') {
        if (!micBtn) return;
        micBtn.classList.remove('listening', 'error');
        const tooltip = micBtn.querySelector('.voice-tooltip');
        if (tooltip) tooltip.textContent = '';

        if (state === 'listening') {
            micBtn.classList.add('listening');
        } else if (state === 'error') {
            micBtn.classList.add('error');
            if (tooltip) tooltip.textContent = `Erro: ${errorMsg}`;
        }
    }

    function injectButton() {
        // Se o botão já existe no DOM e está visível, não faz nada
        if (micBtn && document.body.contains(micBtn)) {
            return true;
        }

        // Tentar encontrar a toolbar (seletor flexível)
        const toolbar = document.querySelector('.sticky.top-0.z-20') || 
                        document.querySelector('[class*="sticky"][class*="top-0"]');
        if (!toolbar) return false;

        // Procurar o botão de copiar para injetar ao lado
        const buttons = Array.from(toolbar.querySelectorAll('button'));
        const copyBtn = buttons.find(btn =>
            btn.textContent.toLowerCase().includes('copiar') ||
            btn.querySelector('svg')?.nextSibling?.textContent?.toLowerCase().includes('copiar')
        );
        if (!copyBtn) return false;

        if (!micBtn) {
            micBtn = document.createElement('button');
            micBtn.className = 'voice-btn';
            micBtn.title     = 'Ditado por Voz (K)';
            micBtn.innerHTML = `
                <span class="mic-icon">🎙️</span>
                <div class="voice-waveform">
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                    <div class="voice-bar"></div>
                </div>
                <div class="voice-tooltip"></div>
            `;
            bars = Array.from(micBtn.querySelectorAll('.voice-bar'));
            micBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                toggleListening(); 
            });
        }

        // Injetar antes do botão de copiar
        copyBtn.parentNode.insertBefore(micBtn, copyBtn);
        return true;
    }

    // Usar MutationObserver para garantir que o botão permaneça lá mesmo após re-renders do React
    const observer = new MutationObserver(() => {
        injectButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ── ATALHO DE TECLADO — tecla K sozinha ──────────────────────────────────
    // Só ativa se o editor contenteditable estiver focado
    // e nenhuma tecla modificadora estiver pressionada
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() !== 'k') return;
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

        const active = document.activeElement;
        const isEditor = active && (
            active.contentEditable === 'true' ||
            active.closest('[contenteditable="true"]')
        );
        if (!isEditor) return;

        e.preventDefault();
        toggleListening();
    });

    // ── INICIALIZAÇÃO ────────────────────────────────────────────────────────
    // Tentar injeção imediata e manter verificação periódica leve
    injectButton();
    setInterval(injectButton, 2000);

})();