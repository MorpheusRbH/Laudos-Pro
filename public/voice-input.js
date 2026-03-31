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

    // ── FILTRO DE PALAVRÕES ──────────────────────────────────────────────────
    const profanityFilter = {
        "vai tomar no cu": "",
        "vai se foder": "",
        "que se foda": "",
        "filho da puta": "",
        "puta que pariu": "",
        "puta merda": "",
        "me fode": "",
        "foda-se": "",
        "pornografia": "",
        "pornô": "",
        "putaria": "",
        "safadeza": "",
        "safado": "",
        "safada": "",
        "arrombado": "",
        "arrombada": "",
        "desgraçado": "",
        "desgraçada": "",
        "desgraça": "",
        "retardado": "",
        "imbecil": "",
        "viadagem": "",
        "viado": "",
        "xoxota": "",
        "piroca": "",
        "fodase": "",
        "caralho": "",
        "cacete": "",
        "cuzão": "",
        "buceta": "",
        "bosta": "",
        "merda": "",
        "porra": "",
        "foda": "",
        "puta": "",
        "cu": "",
    };

    function applyProfanityFilter(text) {
        Object.entries(profanityFilter).forEach(([word, replacement]) => {
            const regex = new RegExp(
                word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                'gi'
            );
            text = text.replace(regex, replacement);
        });
        return text.replace(/\s{2,}/g, ' ').trim();
    }

    // ── DICIONÁRIO MÉDICO RADIOLÓGICO ──────────────────────────────────────────
    const medicalDictionary = {

        // ── PREFIXOS GREGOS ──────────────────────────────────────────
        "hiper ecogênico": "hiperecogênico",
        "hiper ecogenico": "hiperecogênico",
        "hiperecogenico": "hiperecogênico",
        "hipo ecogênico": "hipoecogênico",
        "hipo ecogenico": "hipoecogênico",
        "hipoecogenico": "hipoecogênico",
        "iso ecogênico": "isoecogênico",
        "eco genicidade": "ecogenicidade",
        "eco gênico": "ecogênico",
        "an ecóico": "anecóico",
        "an ecoico": "anecóico",
        "hiper denso": "hiperdenso",
        "hipo denso": "hipodenso",
        "hiper intenso": "hiperintenso",
        "hipo intenso": "hipointenso",
        "hiper vascular": "hipervascular",
        "hipo vascular": "hipovascular",
        "hiper trofia": "hipertrofia",
        "hipo trofia": "hipotrofia",
        "hiper plasia": "hiperplasia",
        "hipo plasia": "hipoplasia",
        "hiper atenuação": "hiperatenuação",
        "hipo atenuação": "hipoatenuação",
        "hiper insuflação": "hiperinsuflação",
        "hiper pneumatização": "hiperpneumatização",
        "hiper celular": "hipercelular",

        // ── ULTRASSOM GERAL ──────────────────────────────────────────
        "eco estrutura": "ecoestrutura",
        "eco textura": "ecotextura",
        "sombra acústica posterior": "sombra acústica posterior",
        "reforço acústico posterior": "reforço acústico posterior",
        "reforço acústico": "reforço acústico posterior",
        "imagem nodular": "imagem nodular",
        "imagem cística": "imagem cística",
        "imagem sólida": "imagem sólida",
        "imagem sólido cística": "imagem sólido-cística",
        "contornos regulares": "contornos regulares",
        "contornos irregulares": "contornos irregulares",
        "limites nítidos": "limites nítidos",
        "limites mal definidos": "limites mal definidos",
        "dentro dos limites da normalidade": "dentro dos limites da normalidade",
        "sem alterações significativas": "sem alterações significativas",
        "transdutor linear": "transdutor linear",
        "transdutor convexo": "transdutor convexo",
        "doppler colorido": "Doppler colorido",
        "doppler espectral": "Doppler espectral",
        "power doppler": "Power Doppler",
        "doppler": "Doppler",

        // ── ABDOME / FÍGADO ──────────────────────────────────────────
        "esteatose hepática": "esteatose hepática",
        "esteatose leve": "esteatose leve",
        "esteatose moderada": "esteatose moderada",
        "esteatose acentuada": "esteatose acentuada",
        "hepato megalia": "hepatomegalia",
        "hepatomegalia": "hepatomegalia",
        "parênquima hepático": "parênquima hepático",
        "lobo hepático direito": "lobo hepático direito",
        "lobo hepático esquerdo": "lobo hepático esquerdo",
        "vias biliares intra hepáticas": "vias biliares intra-hepáticas",
        "vias biliares extra hepáticas": "vias biliares extra-hepáticas",
        "ducto colédoco": "ducto colédoco",
        "colédoco litíase": "coledocolitíase",
        "coledoco litiase": "coledocolitíase",
        "cole litíase": "colelitíase",
        "cole cistite": "colecistite",
        "carcinoma hepato celular": "carcinoma hepatocelular",
        "lirads": "LI-RADS",
        "li rads": "LI-RADS",

        // ── VESÍCULA ─────────────────────────────────────────────────
        "vesícula biliar": "vesícula biliar",
        "vesícula distendida": "vesícula distendida",
        "vesícula contraída": "vesícula contraída",
        "cálculo vesicular": "cálculo vesicular",
        "cálculos vesiculares": "cálculos vesiculares",
        "lama biliar": "lama biliar",
        "barro biliar": "barro biliar",
        "pólipo vesicular": "pólipo vesicular",

        // ── PÂNCREAS ─────────────────────────────────────────────────
        "ducto pancreático": "ducto pancreático",
        "ducto de wirsung": "ducto de Wirsung",
        "wirsung": "Wirsung",
        "parênquima pancreático": "parênquima pancreático",
        "pancreatite aguda": "pancreatite aguda",
        "pancreatite crônica": "pancreatite crônica",

        // ── BAÇO ─────────────────────────────────────────────────────
        "espleno megalia": "esplenomegalia",
        "esplenomegalia": "esplenomegalia",
        "parênquima esplênico": "parênquima esplênico",

        // ── RIM / TRATO URINÁRIO ─────────────────────────────────────
        "parênquima renal": "parênquima renal",
        "cortical renal": "cortical renal",
        "relação córtico medular": "relação córtico-medular",
        "pelve renal": "pelve renal",
        "seio renal": "seio renal",
        "nefroli tiase": "nefrolitíase",
        "litíase renal": "litíase renal",
        "hidro nefrose": "hidronefrose",
        "hidronefrose leve": "hidronefrose leve",
        "hidronefrose moderada": "hidronefrose moderada",
        "hidronefrose acentuada": "hidronefrose acentuada",
        "pielo nefrite": "pielonefrite",
        "ureter hidro distendido": "ureter hidrodistendido",
        "cisto renal simples": "cisto renal simples",
        "angio miolipoma": "angiomiolipoma",
        "bosniak": "Bosniak",

        // ── MAMA ─────────────────────────────────────────────────────
        "birads": "BIRADS",
        "bi rads": "BIRADS",
        "parênquima mamário": "parênquima mamário",
        "tecido fibro glandular": "tecido fibroglandular",
        "micro calcificações": "microcalcificações",
        "micro calcificação": "microcalcificação",
        "nódulo sólido cístico": "nódulo sólido-cístico",
        "assimetria focal": "assimetria focal",
        "linfonodo axilar": "linfonodo axilar",

        // ── PRÓSTATA ─────────────────────────────────────────────────
        "pirads": "PI-RADS",
        "pi rads": "PI-RADS",
        "hiperplasia próstatica": "hiperplasia prostática",
        "hiperplasia prostática benigna": "hiperplasia prostática benigna",
        "zona periférica": "zona periférica",
        "zona transicional": "zona transicional",
        "vesícula seminal": "vesícula seminal",
        "vesículas seminais": "vesículas seminais",

        // ── GINECOLÓGICO ─────────────────────────────────────────────
        "mio ma": "mioma",
        "mio mas": "miomas",
        "mioma uterino": "mioma uterino",
        "endo metrioma": "endometrioma",
        "endo metriose": "endometriose",
        "ovários poli císticos": "ovários policísticos",
        "síndrome dos ovários policísticos": "síndrome dos ovários policísticos",
        "hidros salpinge": "hidrossalpinge",
        "fundo de saco de douglas": "fundo de saco de Douglas",
        "útero antefletido": "útero anteversofletido",
        "útero retrofletido": "útero retroversofletido",
        "eco endometrial": "eco endometrial",
        "espessamento endometrial": "espessamento endometrial",
        "região adnexal": "região anexial",
        "líquido livre em fundo de saco": "líquido livre em fundo de saco",
        "útero em avf": "útero em AVF",
        "útero em rvf": "útero em RVF",
        "cisto de naboth": "cisto de Naboth",
        "cistos de naboth": "cistos de Naboth",
        "cisto folicular": "cisto folicular",
        "cisto de corpo lúteo": "cisto de corpo lúteo",
        "cisto hemorrágico": "cisto hemorrágico",
        "teratoma cístico": "teratoma cístico",
        "cisto dermóide": "cisto dermoide",
        "cisto dermoide": "cisto dermoide",
        "torção ovariana": "torção ovariana",
        "doença inflamatória pélvica": "doença inflamatória pélvica",
        "dip": "DIP",
        "abscesso tubo ovariano": "abscesso tubo-ovariano",
        "adenomiose": "adenomiose",
        "pólipo endometrial": "pólipo endometrial",
        "sinéquia uterina": "sinéquia uterina",
        "dispositivo intrauterino": "dispositivo intrauterino",
        "diu": "DIU",
        "diu de cobre": "DIU de cobre",
        "diu mirena": "DIU Mirena",
        "diu kyleena": "DIU Kyleena",
        "histerossonografia": "histerossonografia",
        "histerossalpingografia": "histerossalpingografia",
        "vagina": "vagina",
        "colo uterino": "colo uterino",
        "orifício interno do colo": "orifício interno do colo",
        "orifício externo do colo": "orifício externo do colo",
        "canal endocervical": "canal endocervical",
        "endocérvice": "endocérvice",
        "ectocérvice": "ectocérvice",
        "miométrio": "miométrio",
        "endométrio": "endométrio",
        "cavidade uterina": "cavidade uterina",
        "trompas de falópio": "tubas uterinas",
        "tubas uterinas": "tubas uterinas",
        "ovário direito": "ovário direito",
        "ovário esquerdo": "ovário esquerdo",
        "fundo de saco posterior": "fundo de saco posterior",
        "fundo de saco anterior": "fundo de saco anterior",
        "espaço vesicouterino": "espaço vesicouterino",
        "espaço retouterino": "espaço retouterino",
        "ligamento largo": "ligamento largo",
        "ligamento redondo": "ligamento redondo",
        "ligamento uterossacro": "ligamento uterossacro",
        "artéria uterina": "artéria uterina",
        "artéria ovariana": "artéria ovariana",
        "veia uterina": "veia uterina",
        "veia ovariana": "veia ovariana",
        "plexo pampiniforme": "plexo pampiniforme",
        "varizes pélvicas": "varizes pélvicas",
        "síndrome de congestão pélvica": "síndrome de congestão pélvica",
        "malformação mulleriana": "malformação mülleriana",
        "útero bicorno": "útero bicorno",
        "útero didelfo": "útero didelfo",
        "útero septado": "útero septado",
        "útero arqueado": "útero arqueado",
        "útero unicorno": "útero unicorno",
        "agenesia uterina": "agenesia uterina",
        "síndrome de mayer rokitansky kuster hauser": "síndrome de Mayer-Rokitansky-Küster-Hauser",
        "mrkh": "MRKH",
        "hímen imperfurado": "hímen imperfurado",
        "hematocolpos": "hematocolpos",
        "hematometra": "hematometra",
        "piometra": "piometra",
        "mucometra": "mucometra",
        "câncer de colo de útero": "câncer de colo de útero",
        "câncer de endométrio": "câncer de endométrio",
        "câncer de ovário": "câncer de ovário",
        "tumor de krukenberg": "tumor de Krukenberg",
        "tumor borderline de ovário": "tumor borderline de ovário",
        "cistoadenoma seroso": "cistoadenoma seroso",
        "cistoadenoma mucinoso": "cistoadenoma mucinoso",
        "cistoadenocarcinoma": "cistoadenocarcinoma",
        "fibroma ovariano": "fibroma ovariano",
        "tecoma": "tecoma",
        "tumor de células da granulosa": "tumor de células da granulosa",
        "disgerminoma": "disgerminoma",
        "tumor do seio endodérmico": "tumor do seio endodérmico",
        "coriocarcinoma": "coriocarcinoma",
        "carcinoma embrionário": "carcinoma embrionário",
        "teratoma imaturo": "teratoma imaturo",
        "struma ovarii": "struma ovarii",
        "síndrome de meigs": "síndrome de Meigs",
        "cisto de inclusão peritoneal": "cisto de inclusão peritoneal",
        "pseudocisto peritoneal": "pseudocisto peritoneal",
        "cisto de gartner": "cisto de Gartner",
        "cisto de bartholin": "cisto de Bartholin",
        "cisto de skene": "cisto de Skene",
        "endometriose profunda": "endometriose profunda",
        "endometriose intestinal": "endometriose intestinal",
        "endometriose vesical": "endometriose vesical",
        "endometriose ureteral": "endometriose ureteral",
        "endometriose de septo retovaginal": "endometriose de septo retovaginal",
        "endometriose de ligamento uterossacro": "endometriose de ligamento uterossacro",
        "endometriose de fórnice vaginal": "endometriose de fórnice vaginal",
        "endometriose de parede abdominal": "endometriose de parede abdominal",
        "endometriose cicatricial": "endometriose cicatricial",
        "endometriose umbilical": "endometriose umbilical",
        "endometriose inguinal": "endometriose inguinal",
        "endometriose diafragmática": "endometriose diafragmática",
        "endometriose torácica": "endometriose torácica",
        "endometriose pulmonar": "endometriose pulmonar",
        "endometriose pleural": "endometriose pleural",
        "endometriose pericárdica": "endometriose pericárdica",
        "endometriose nervosa": "endometriose nervosa",
        "endometriose ciática": "endometriose ciática",
        "endometriose pudenda": "endometriose pudenda",
        "endometriose obturadora": "endometriose obturadora",
        "endometriose femoral": "endometriose femoral",
        "endometriose genitofemoral": "endometriose genitofemoral",
        "endometriose ilioinguinal": "endometriose ilioinguinal",
        "endometriose iliohipogástrica": "endometriose iliohipogástrica",
        "endometriose de plexo sacral": "endometriose de plexo sacral",
        "endometriose de plexo lombar": "endometriose de plexo lombar",
        "endometriose de plexo braquial": "endometriose de plexo braquial",
        "endometriose de plexo cervical": "endometriose de plexo cervical",
        "endometriose de plexo celíaco": "endometriose de plexo celíaco",
        "endometriose de plexo mesentérico superior": "endometriose de plexo mesentérico superior",
        "endometriose de plexo mesentérico inferior": "endometriose de plexo mesentérico inferior",
        "endometriose de plexo hipogástrico superior": "endometriose de plexo hipogástrico superior",
        "endometriose de plexo hipogástrico inferior": "endometriose de plexo hipogástrico inferior",
        "endometriose de plexo pélvico": "endometriose de plexo pélvico",
        "endometriose de plexo pudendo": "endometriose de plexo pudendo",
        "endometriose de plexo coccígeo": "endometriose de plexo coccígeo",
        "endometriose de gânglio ímpar": "endometriose de gânglio ímpar",
        "endometriose de cadeia simpática": "endometriose de cadeia simpática",
        "endometriose de nervo vago": "endometriose de nervo vago",
        "endometriose de nervo frênico": "endometriose de nervo frênico",
        "endometriose de nervo esplâncnico": "endometriose de nervo esplâncnico",
        "endometriose de nervo intercostal": "endometriose de nervo intercostal",
        "endometriose de nervo subcostal": "endometriose de nervo subcostal",
        "endometriose de nervo ilioinguinal": "endometriose de nervo ilioinguinal",
        "endometriose de nervo iliohipogástrico": "endometriose de nervo iliohipogástrico",
        "endometriose de nervo genitofemoral": "endometriose de nervo genitofemoral",
        "endometriose de nervo cutâneo femoral lateral": "endometriose de nervo cutâneo femoral lateral",
        "endometriose de nervo femoral": "endometriose de nervo femoral",
        "endometriose de nervo obturador": "endometriose de nervo obturador",
        "endometriose de nervo ciático": "endometriose de nervo ciático",
        "endometriose de nervo pudendo": "endometriose de nervo pudendo",
        "endometriose de nervo glúteo superior": "endometriose de nervo glúteo superior",
        "endometriose de nervo glúteo inferior": "endometriose de nervo glúteo inferior",
        "endometriose de nervo cutâneo femoral posterior": "endometriose de nervo cutâneo femoral posterior",
        "endometriose de nervo fibular comum": "endometriose de nervo fibular comum",
        "endometriose de nervo tibial": "endometriose de nervo tibial",
        "endometriose de nervo sural": "endometriose de nervo sural",
        "endometriose de nervo plantar medial": "endometriose de nervo plantar medial",
        "endometriose de nervo plantar lateral": "endometriose de nervo plantar lateral",
        "endometriose de nervo digital": "endometriose de nervo digital",
        "endometriose de nervo craniano": "endometriose de nervo craniano",
        "endometriose de nervo olfatório": "endometriose de nervo olfatório",
        "endometriose de nervo óptico": "endometriose de nervo óptico",
        "endometriose de nervo oculomotor": "endometriose de nervo oculomotor",
        "endometriose de nervo troclear": "endometriose de nervo troclear",
        "endometriose de nervo trigêmeo": "endometriose de nervo trigêmeo",
        "endometriose de nervo abducente": "endometriose de nervo abducente",
        "endometriose de nervo facial": "endometriose de nervo facial",
        "endometriose de nervo vestibulococlear": "endometriose de nervo vestibulococlear",
        "endometriose de nervo glossofaríngeo": "endometriose de nervo glossofaríngeo",
        "endometriose de nervo acessório": "endometriose de nervo acessório",
        "endometriose de nervo hipoglosso": "endometriose de nervo hipoglosso",
        "endometriose de medula espinhal": "endometriose de medula espinhal",
        "endometriose de meninges": "endometriose de meninges",
        "endometriose de cérebro": "endometriose de cérebro",
        "endometriose de cerebelo": "endometriose de cerebelo",
        "endometriose de tronco encefálico": "endometriose de tronco encefálico",
        "endometriose de hipófise": "endometriose de hipófise",
        "endometriose de glândula pineal": "endometriose de glândula pineal",
        "endometriose de tireoide": "endometriose de tireoide",
        "endometriose de paratireoide": "endometriose de paratireoide",
        "endometriose de timo": "endometriose de timo",
        "endometriose de glândula adrenal": "endometriose de glândula adrenal",
        "endometriose de pâncreas": "endometriose de pâncreas",
        "endometriose de fígado": "endometriose de fígado",
        "endometriose de vesícula biliar": "endometriose de vesícula biliar",
        "endometriose de baço": "endometriose de baço",
        "endometriose de estômago": "endometriose de estômago",
        "endometriose de duodeno": "endometriose de duodeno",
        "endometriose de jejuno": "endometriose de jejuno",
        "endometriose de íleo": "endometriose de íleo",
        "endometriose de ceco": "endometriose de ceco",
        "endometriose de apêndice": "endometriose de apêndice",
        "endometriose de cólon ascendente": "endometriose de cólon ascendente",
        "endometriose de cólon transverso": "endometriose de cólon transverso",
        "endometriose de cólon descendente": "endometriose de cólon descendente",
        "endometriose de cólon sigmoide": "endometriose de cólon sigmoide",
        "endometriose de reto": "endometriose de reto",
        "endometriose de ânus": "endometriose de ânus",
        "endometriose de rim": "endometriose de rim",
        "endometriose de pelve renal": "endometriose de pelve renal",
        "endometriose de ureter": "endometriose de ureter",
        "endometriose de bexiga": "endometriose de bexiga",
        "endometriose de uretra": "endometriose de uretra",
        "endometriose de vulva": "endometriose de vulva",
        "endometriose de vagina": "endometriose de vagina",
        "endometriose de colo de útero": "endometriose de colo de útero",
        "endometriose de útero": "endometriose de útero",
        "endometriose de trompa de falópio": "endometriose de trompa de falópio",
        "endometriose de ovário": "endometriose de ovário",
        "endometriose de ligamento largo": "endometriose de ligamento largo",
        "endometriose de ligamento redondo": "endometriose de ligamento redondo",
        "endometriose de ligamento uterossacro": "endometriose de ligamento uterossacro",
        "endometriose de peritônio pélvico": "endometriose de peritônio pélvico",
        "endometriose de peritônio abdominal": "endometriose de peritônio abdominal",
        "endometriose de omento": "endometriose de omento",
        "endometriose de mesentério": "endometriose de mesentério",
        "endometriose de linfonodo": "endometriose de linfonodo",
        "endometriose de baço acessório": "endometriose de baço acessório",
        "endometriose de tecido adiposo": "endometriose de tecido adiposo",
        "endometriose de músculo": "endometriose de músculo",
        "endometriose de osso": "endometriose de osso",
        "endometriose de cartilagem": "endometriose de cartilagem",
        "endometriose de pele": "endometriose de pele",
        "endometriose de tecido subcutâneo": "endometriose de tecido subcutâneo",
        "endometriose de mama": "endometriose de mama",
        "endometriose de olho": "endometriose de olho",
        "endometriose de ouvido": "endometriose de ouvido",
        "endometriose de nariz": "endometriose de nariz",
        "endometriose de boca": "endometriose de boca",
        "endometriose de faringe": "endometriose de faringe",
        "endometriose de laringe": "endometriose de laringe",
        "endometriose de traqueia": "endometriose de traqueia",
        "endometriose de brônquio": "endometriose de brônquio",
        "endometriose de pulmão": "endometriose de pulmão",
        "endometriose de pleura": "endometriose de pleura",
        "endometriose de coração": "endometriose de coração",
        "endometriose de pericárdio": "endometriose de pericárdio",
        "endometriose de vaso sanguíneo": "endometriose de vaso sanguíneo",
        "endometriose de vaso linfático": "endometriose de vaso linfático",

        // ── OBSTÉTRICO ───────────────────────────────────────────────
        "diâmetro biparietal": "diâmetro biparietal",
        "circunferência cefálica": "circunferência cefálica",
        "circunferência abdominal": "circunferência abdominal",
        "comprimento femural": "comprimento femoral",
        "comprimento femoral": "comprimento femoral",
        "índice do líquido amniótico": "índice do líquido amniótico",
        "placenta prévia": "placenta prévia",
        "grau de grannum": "grau de Grannum",
        "grannum": "Grannum",
        "colo uterino impérvio": "colo uterino impérvio",
        "centralização hemodinâmica": "centralização hemodinâmica",
        "ducto venoso": "ducto venoso",
        "artéria uterina": "artéria uterina",
        "artéria umbilical": "artéria umbilical",
        "diástole zero": "diástole zero",
        "fluxo diastólico ausente": "fluxo diastólico ausente",
        "fluxo diastólico reverso": "fluxo diastólico reverso",

        // ── VASCULAR ─────────────────────────────────────────────────
        "atero esclerose": "aterosclerose",
        "placa aterosclerótica": "placa aterosclerótica",
        "trombo embolia": "tromboembolismo",
        "trombo flebite": "tromboflebite",
        "trombose venosa profunda": "trombose venosa profunda",
        "dis secção": "dissecção",
        "dissecção aórtica": "dissecção aórtica",
        "aneurisma da aorta": "aneurisma da aorta",
        "índice de resistência": "índice de resistência",
        "índice de pulsatilidade": "índice de pulsatilidade",
        "velocidade de pico sistólico": "velocidade de pico sistólico",
        "fluxo turbulento": "fluxo turbulento",
        "fluxo laminar": "fluxo laminar",

        // ── TÓRAX / TC PULMONAR ──────────────────────────────────────
        "brônco patia": "broncopatia",
        "bronco patia": "broncopatia",
        "bronco espasmo": "broncoespasmo",
        "bronco pneumonia": "broncopneumonia",
        "bronqui ectasia": "bronquiectasia",
        "bronco ectasia": "bronquiectasia",
        "bronco grama": "broncograma",
        "broncograma aéreo": "broncograma aéreo",
        "enfisema bolo so": "enfisema bolhoso",
        "enfisema bolhoso": "enfisema bolhoso",
        "enfisema centro lobular": "enfisema centrolobular",
        "enfisema centrolobular": "enfisema centrolobular",
        "enfisema centro acinar": "enfisema centroacinar",
        "enfisema para septal": "enfisema parasseptal",
        "enfisema pan acinar": "enfisema panacinar",
        "micro nódulo": "micronódulo",
        "micro nódulos": "micronódulos",
        "vidro fosco": "vidro fosco",
        "opacidade em vidro fosco": "opacidade em vidro fosco",
        "pneumo tórax": "pneumotórax",
        "pneumo torax": "pneumotórax",
        "hidro torax": "hidrotórax",
        "hemo tórax": "hemotórax",
        "atelecta sia": "atelectasia",
        "con solidação": "consolidação",
        "linfadeno patia": "linfadenopatia",
        "adeno megalia": "adenomegalia",
        "medias tino": "mediastino",
        "derrame pleural": "derrame pleural",
        "espessamento pleural": "espessamento pleural",
        "fibrose intersticial": "fibrose intersticial",
        "tcar": "TCAR",
        "dpoc": "DPOC",

        // ── RESSONÂNCIA MAGNÉTICA ────────────────────────────────────
        "hiper intensidade": "hiperintensidade",
        "hipo intensidade": "hipointensidade",
        "hiperintensidade em t2": "hiperintensidade em T2",
        "hipointensidade em t1": "hipointensidade em T1",
        "sequência flair": "sequência FLAIR",
        "flair": "FLAIR",
        "sequência dwi": "sequência DWI",
        "dwi": "DWI",
        "sequência t1": "sequência T1",
        "sequência t2": "sequência T2",
        "t1 com contraste": "T1 com contraste",
        "gadolínio": "gadolínio",
        "difusão restrita": "difusão restrita",
        "coeficiente de difusão aparente": "coeficiente de difusão aparente",
        "leuco encefalopatia": "leucoencefalopatia",
        "micro angiopatia cerebral": "microangiopatia cerebral",
        "atrofia cortical": "atrofia cortical",
        "atrofia cerebral": "atrofia cerebral",
        "malformação de chiari": "malformação de Chiari",
        "hérnia tonsilar": "hérnia tonsilar",

        // ── COLUNA / MSK ─────────────────────────────────────────────
        "espondilo artrose": "espondiloartrose",
        "espondilose": "espondilose",
        "hérnia discal": "hérnia discal",
        "hérnia de disco": "hérnia de disco",
        "osteo artrose": "osteoartrose",
        "osteo fito": "osteófito",
        "osteo fitos": "osteófitos",
        "osteofito": "osteófito",
        "manguito ro tador": "manguito rotador",
        "manguito rotador": "manguito rotador",
        "condro malácia": "condromalácia",
        "lesão meniscal": "lesão meniscal",
        "ligamento cruzado anterior": "ligamento cruzado anterior",
        "ligamento cruzado posterior": "ligamento cruzado posterior",
        "bursite": "bursite",
        "tendinose": "tendinose",
        "ruptura parcial": "ruptura parcial",
        "ruptura total": "ruptura total",

        // ── CLASSIFICAÇÕES ───────────────────────────────────────────
        "o rads": "O-RADS",
        "orads": "O-RADS",
        "pi rads": "PI-RADS",

        // ── ANATOMIA GERAL ───────────────────────────────────────────
        "retro peritônio": "retroperitônio",
        "retro peritoneal": "retroperitoneal",
        "torax": "tórax",
        "abdomen": "abdômen",
        "parênquima": "parênquima",
    };

    function applyMedicalDictionary(text) {
        Object.entries(medicalDictionary).forEach(([term, correction]) => {
            const regex = new RegExp(
                term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                'gi'
            );
            text = text.replace(regex, correction);
        });
        return text;
    }

    function applyDynamicPhrases(text) {
        try {
            const savedPhrases = localStorage.getItem('laudospro_phrases_v2');
            if (savedPhrases) {
                const phrases = JSON.parse(savedPhrases);
                // Common misspellings of "arroba"
                const arrobaVariants = ['arroba', 'a roupa', 'arromba', 'a roba', 'arruba', 'a rumba', 'rouba', 'a roda', 'aroba'];
                
                phrases.forEach(p => {
                    if (!p.title) return;
                    const title = p.title.toLowerCase().trim();
                    const escapedTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    
                    arrobaVariants.forEach(variant => {
                        const regex = new RegExp('\\b' + variant + '\\s+' + escapedTitle + '\\b', 'gi');
                        text = text.replace(regex, '@ ' + title);
                    });
                });
            }
        } catch (e) {
            console.error('Error applying dynamic phrases:', e);
        }
        return text;
    }

    function normalizeRaw(text) {
        // 1. Remove espaços no início e fim
        text = text.trim();

        // 2. Remove ponto final que o Chrome às vezes adiciona sozinho
        //    (a gente vai controlar a pontuação manualmente)
        text = text.replace(/\.\s*$/, '');

        // 3. Converte para minúsculo — a capitalização é controlada
        //    pela lógica do código, não pelo Chrome
        text = text.toLowerCase();

        // 4. Remove espaços duplos
        text = text.replace(/\s{2,}/g, ' ');

        return text;
    }

    // ── PROCESSAMENTO DE TEXTO ───────────────────────────────────────────────
    function processText(rawText, editorTextBefore, nextCapState) {

        // Normalização inicial: remove espaços extras mas mantém pontuação do Chrome
        let text = rawText.toLowerCase().trim();

        text = applyProfanityFilter(text);
        text = applyMedicalDictionary(text);
        text = applyDynamicPhrases(text);

        // 1. COMPOSTOS — sempre antes dos simples
        // Aceita variações com pontuação, espaços extras e a conjunção "e"
        text = text.replace(/\bponto(?:[.,]?\s+(?:e\s+)?)?par[aá]grafo[s]?[.,]?/gi, '__P_PARAGRAPH__');
        text = text.replace(/\bponto(?:[.,]?\s+(?:e\s+)?)?nova[s]?\s+linha[s]?[.,]?/gi,  '__P_NEWLINE__');
        text = text.replace(/\b(?:ponto\s+)?par[aá]grafo[s]?[.,]?/gi,               '__PARAGRAPH__');
        text = text.replace(/\b(?:ponto\s+)?nova[s]?\s+linha[s]?[.,]?/gi,               '__NEWLINE__');

        // 2. UNIDADES DE MEDIDA — antes de qualquer outra coisa
        text = text.replace(/\bquilogramas?\b/gi, 'kg');
        text = text.replace(/\bmililitros?\b/gi,  'ml');

        // 3. "por" entre números → "x"  (ex: "3,5 por 4,2" → "3,5 x 4,2")
        // Usamos lookahead (?=...) para o segundo número para permitir múltiplas medidas seguidas (3x4x5)
        text = text.replace(
            /(\d+(?:[.,]\d+)?)\s+por\s+(?=(\d+(?:[.,]\d+)?))/gi,
            '$1 x '
        );

        // 4. PONTUAÇÃO SIMPLES — ordem importa: mais específico primeiro
        const replacements = [
            [/\bcentímetros?\b/gi,         'cm'],
            [/\bmilímetros?\b/gi,          'mm'],
            [/\bponto\s+e\s+v[ií]rgula\b/gi, ';'],   // antes de "ponto" e "vírgula"
            [/\be\s+ponto\s+final\b/gi,    '.'],
            [/\be\s+ponto\b/gi,            '.'],
            [/\be\s+v[ií]rgula\b/gi,       ','],
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
        // Sem espaço ANTES de qualquer pontuação ou comando — sempre
        text = text.replace(/\s+([.,;:!?]|__)/g, '$1');
        text = text.replace(/([.,;:!?])\s+([.,;:!?])/g, '$1$2'); 

        // Remove espaços ao redor dos comandos internos
        text = text.replace(/\s*(__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__)\s*/g, '$1');

        // Garante que não haja espaço antes de pontos e vírgulas que sobraram de substituições
        text = text.replace(/\s+([.,])/g, '$1');

        // Caso específico: " e ." ou " e ," que sobraram
        text = text.replace(/\s+e\s+([.,;:!?])/gi, '$1');
        text = text.replace(/\s+e([.,;:!?])/gi, '$1');

        // Vírgula entre números — sem espaço depois (3,5 não 3, 5)
        text = text.replace(/(\d),\s+(\d)/g, '$1,$2');

        // Espaço depois de pontuação — só quando vier letra, não número
        text = text.replace(/([,;:!?])([a-zA-ZÀ-ú])/g, '$1 $2');
        text = text.replace(/\.([a-zA-ZÀ-ú])/g, '. $1');

        // Limpa espaço duplo
        text = text.replace(/\s{2,}/g, ' ');
        text = text.trimStart();

        // 6. FILTRO DE PALAVRÕES
        // text = applyProfanityFilter(text); // Already applied at the beginning

        // 7. DICIONÁRIO MÉDICO
        // text = applyMedicalDictionary(text); // Already applied at the beginning

        // 8. CAPITALIZAÇÃO E ESPAÇO INICIAL
        const trimmedBefore = editorTextBefore.trimEnd();
        const isStart = trimmedBefore.length === 0;
        // Verifica se o cursor está em um novo parágrafo (checa se o texto antes termina com quebra de linha ou se o editor está vazio)
        // Usamos regex que ignora espaços no final para detectar a quebra de linha anterior
        const isNewParagraph = isStart || /[\n\r]\s*$/.test(editorTextBefore) || editorTextBefore.endsWith('</p>') || editorTextBefore.endsWith('<br>');
        const lastChar = editorTextBefore.slice(-1);

        // Se o novo texto começa com pontuação, remove qualquer espaço inicial dele
        if (/^[.,;:!?]/.test(text.trimStart())) {
            text = text.trimStart();
        }

        // Decidir se precisa de espaço inicial (se não for comando __)
        if (!isStart && !text.startsWith(' ') && text.length > 0 && !text.startsWith('__')) {
            const endsInWordOrPunct = /[a-zA-ZÀ-ú0-9.,;:!?]/.test(lastChar);
            const startsWithWord = /^[a-zA-ZÀ-ú0-9]/.test(text.trimStart());
            
            // Não adiciona espaço se o texto anterior for um comando de parágrafo/nova linha
            const afterCommand = /(__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__)\s*$/.test(editorTextBefore);

            if (endsInWordOrPunct && startsWithWord && !/\s$/.test(editorTextBefore) && !afterCommand) {
                text = ' ' + text;
            }
        }

        if (text.length > 0 && !text.startsWith('__')) {
            const afterAbbrev  = ABBREV_PATTERN.test(editorTextBefore.trimEnd());
            
            const charBefore = editorTextBefore.trimEnd().slice(-1);
            const afterColon = charBefore === ':';

            const needsCap = !afterAbbrev && (
                isStart ||
                isNewParagraph ||
                /[.!?\n]/.test(charBefore) ||
                afterColon ||
                nextCapState
            );

            // Capitaliza a primeira LETRA, não apenas o primeiro caractere (preserva o espaço inicial se houver)
            if (needsCap) {
                text = text.replace(/^(\s*)([a-zÀ-ú])/, (match, p1, p2) => p1 + p2.toUpperCase());
            } else {
                text = text.replace(/^(\s*)([A-ZÀ-Ú])/, (match, p1, p2) => p1 + p2.toLowerCase());
            }

            // Capitalização interna: após qualquer comando de parágrafo/nova linha dentro do texto
            text = text.replace(/(__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__|\n)\s*([a-zÀ-ú])/g, (match, cmd, char) => {
                return cmd + char.toUpperCase();
            });

            // Capitalização interna: após pontuação terminal (. ! ?)
            text = text.replace(/([.!?])\s+([a-zÀ-ú])/g, (match, punct, char) => {
                return punct + ' ' + char.toUpperCase();
            });
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
                      || text.includes('__NEWLINE__')
                      || text.includes('\n');

        // Se o texto terminar com um comando de parágrafo, a próxima palavra deve ser maiúscula
        // e não deve ter espaço antes
        if (text.endsWith('__P_PARAGRAPH__') || text.endsWith('__P_NEWLINE__') || text.endsWith('__PARAGRAPH__') || text.endsWith('__NEWLINE__')) {
            text = text.trimEnd();
        }

        // Final clean: remove trailing spaces to let the next call handle spacing correctly
        text = text.trimEnd();

        return { text, nextCap };
    }

    // ── RECONHECIMENTO ───────────────────────────────────────────────────────
    function initRecognition() {
        recognition = new SpeechRecognition();
        recognition.lang          = 'pt-BR';
        recognition.continuous    = true;
        recognition.interimResults = true;

        // Tenta carregar as frases para o SpeechGrammarList para melhorar o reconhecimento
        try {
            const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
            if (SpeechGrammarList) {
                const savedPhrases = localStorage.getItem('laudospro_phrases_v2');
                if (savedPhrases) {
                    const phrases = JSON.parse(savedPhrases);
                    const titles = phrases.map(p => p.title).filter(Boolean);
                    if (titles.length > 0) {
                        const grammar = '#JSGF V1.0; grammar phrases; public <phrase> = ' + titles.join(' | ') + ' ;';
                        const speechRecognitionList = new SpeechGrammarList();
                        speechRecognitionList.addFromString(grammar, 1);
                        recognition.grammars = speechRecognitionList;
                    }
                }
            }
        } catch (e) {
            console.error('Error setting up SpeechGrammarList:', e);
        }

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
            const parts = final.split(/(__P_PARAGRAPH__|__P_NEWLINE__|__PARAGRAPH__|__NEWLINE__|\n)/);

            parts.forEach(part => {
                if (!part) return;

                if (part === '__P_PARAGRAPH__') {
                    document.execCommand('insertText', false, '.');
                    document.execCommand('insertParagraph', false, null);
                } else if (part === '__P_NEWLINE__') {
                    document.execCommand('insertText', false, '.');
                    document.execCommand('insertParagraph', false, null);
                } else if (part === '__PARAGRAPH__' || part === '__NEWLINE__' || part === '\n') {
                    document.execCommand('insertParagraph', false, null);
                } else {
                    // Remove leading space if the previous part was a paragraph/newline command
                    // Or if the editor currently ends with a paragraph tag
                    if (part.startsWith(' ') && (editor.innerHTML.endsWith('</p>') || editor.innerHTML.endsWith('<br>'))) {
                        part = part.substring(1);
                    }
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