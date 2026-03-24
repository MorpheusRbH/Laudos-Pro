import { Specialty, Mask, Phrase } from '../types';

export const INITIAL_SPECIALTIES: Specialty[] = [
  { id: '2', name: 'Abdome' },
  { id: '3', name: 'Urologia' },
  { id: '4', name: 'Ginecologia' },
  { id: '5', name: 'Obstetrícia' },
  { id: '6', name: 'Mama' },
  { id: '7', name: 'Tireoide' },
  { id: '9', name: 'Escrotal' },
  { id: '10', name: 'Neurologia' },
  { id: '11', name: 'Vascular' },
  { id: '12', name: 'Partes moles' },
];

export const INITIAL_MASKS: Mask[] = [
  {
    id: 'm1',
    name: 'US Abdome Total',
    specialtyId: '2',
    baseContent: '<b>ULTRASSONOGRAFIA DE ABDOME TOTAL</b><br><br><b>Técnica:</b><br>Exame realizado com transdutor convexo de banda larga.<br><br><b>Análise:</b><br><b>Fígado</b> de dimensões normais, contornos regulares, ecotextura homogênea e ecogenicidade preservada.<br><b>Vesícula biliar</b> normodistendida, paredes finas, conteúdo anecogênico, sem cálculos.<br><b>Vias biliares</b> intra e extra-hepáticas de calibres normais. Colédoco não dilatado.<br><b>Pâncreas</b> de dimensões e ecotextura preservadas.<br><b>Baço</b> de dimensões normais e parênquima homogêneo.<br><b>Rim direito</b> tópico, dimensões normais, contornos regulares, boa diferenciação córtico-medular, sem cálculos ou hidronefrose.<br><b>Rim esquerdo</b> tópico, dimensões normais, contornos regulares, boa diferenciação córtico-medular, sem cálculos ou hidronefrose.<br><b>Bexiga</b> normodistendida, paredes regulares, conteúdo anecogênico.<br><b>Aorta abdominal</b> de calibre normal, sem dilatações aneurismáticas.<br>Ausência de líquido livre ou coleções na cavidade abdominal.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: []
  },
  {
    id: 'm2',
    name: 'US Abdome Superior',
    specialtyId: '2',
    baseContent: '<b>ULTRASSONOGRAFIA DE ABDOME SUPERIOR</b><br><br><b>Técnica:</b><br>Exame realizado com transdutor convexo de banda larga.<br><br><b>Análise:</b><br><b>Fígado</b> de dimensões normais, contornos regulares, ecotextura homogênea e ecogenicidade preservada.<br><b>Vesícula biliar</b> normodistendida, paredes finas, conteúdo anecogênico, sem cálculos.<br><b>Vias biliares</b> intra e extra-hepáticas de calibres normais. Colédoco não dilatado.<br><b>Pâncreas</b> de dimensões e ecotextura preservadas.<br><b>Baço</b> de dimensões normais e parênquima homogêneo.<br><b>Aorta abdominal</b> de calibre normal, sem dilatações aneurismáticas.<br>Ausência de líquido livre ou coleções na cavidade abdominal superior.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: []
  },
  {
    id: 'm3',
    name: 'US Pélvica Transvaginal',
    specialtyId: '4',
    baseContent: '<b>ULTRASSONOGRAFIA PÉLVICA POR VIA TRANSVAGINAL</b><br><br><b>Técnica:</b><br>Exame realizado por via transvaginal com transdutor endocavitário de banda larga.<br><br><b>Análise:</b><br><b>Útero</b> em anteversoflexão, contornos regulares, ecotextura miometrial homogênea. Mede {{utero_c}} x {{utero_l}} x {{utero_a}} cm, volume estimado em {{utero_vol}} cm³.<br><b>Endométrio</b> linear, homogêneo, medindo {{endometrio}} mm.<br><b>Ovário direito</b> tópico, dimensões normais, ecotextura preservada, com folículos primordiais. Mede {{ovario_dir_c}} x {{ovario_dir_l}} x {{ovario_dir_a}} cm (Vol: {{ovario_dir_vol}} cm³).<br><b>Ovário esquerdo</b> tópico, dimensões normais, ecotextura preservada, com folículos primordiais. Mede {{ovario_esq_c}} x {{ovario_esq_l}} x {{ovario_esq_a}} cm (Vol: {{ovario_esq_vol}} cm³).<br>Ausência de massas ou coleções anexiais.<br>Fundo de saco posterior livre de líquido livre.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: [
      { id: 'utero', label: 'Útero', type: 'measurement3d', unit: 'cm' },
      { id: 'endometrio', label: 'Endométrio', type: 'number', unit: 'mm' },
      { id: 'ovario_dir', label: 'Ovário Direito', type: 'measurement3d', unit: 'cm' },
      { id: 'ovario_esq', label: 'Ovário Esquerdo', type: 'measurement3d', unit: 'cm' }
    ]
  },
  {
    id: 'm4',
    name: 'US Obstétrica (1º Trimestre)',
    specialtyId: '5',
    baseContent: '<b>ULTRASSONOGRAFIA OBSTÉTRICA (1º TRIMESTRE)</b><br><br><b>Técnica:</b><br>Exame realizado por via transabdominal com transdutor convexo de banda larga e/ou via transvaginal com transdutor endocavitário de alta frequência.<br><br><b>Análise:</b><br>Útero em anteversoflexão, de dimensões aumentadas pela gestação, contornos regulares e miométrio de ecotextura homogênea.<br>Saco gestacional tópico, de contornos regulares, bem implantado no corpo uterino.<br>Vesícula vitelínica presente, de aspecto e dimensões normais.<br>Embrião único presente, com atividade cardíaca rítmica e movimentos somáticos visíveis.<br>Frequência cardíaca embrionária: {{fcf}} bpm.<br>Comprimento cabeça-nádegas (CCN): {{ccn}} mm.<br>Regiões anexiais sem particularidades.<br>Ausência de áreas de descolamento coriônico ou coleções peritrofoblásticas.<br><br><b>Conclusão:</b><br>Gestação tópica inicial com embrião único e vivo.<br>Idade gestacional estimada por biometria (CCN): {{ig_semanas}} semanas e {{ig_dias}} dias.<br>Data provável do parto (DPP) por USG: {{dpp}}.',
    fields: [
      { id: 'fcf', label: 'Freq. Cardíaca (FCF)', type: 'number', unit: 'bpm' },
      { id: 'ccn', label: 'CCN', type: 'number', unit: 'mm' },
      { id: 'ig_semanas', label: 'IG (Semanas)', type: 'number', unit: 'sem' },
      { id: 'ig_dias', label: 'IG (Dias)', type: 'number', unit: 'dias' },
      { id: 'dpp', label: 'DPP (DD/MM/AAAA)', type: 'text', unit: '' }
    ]
  },
  {
    id: 'm5',
    name: 'US Obstétrica (2º e 3º Trimestres)',
    specialtyId: '5',
    baseContent: '<b>ULTRASSONOGRAFIA OBSTÉTRICA (2º E 3º TRIMESTRES)</b><br><br><b>Técnica:</b><br>Exame realizado por via abdominal com transdutor convexo de banda larga.<br><br><b>Análise:</b><br>Útero gravídico contendo feto único, em situação longitudinal, apresentação {{apresentacao}}.<br>Batimentos cardíacos fetais rítmicos, FCF de {{fcf}} bpm.<br>Movimentos somáticos e respiratórios presentes e normais.<br>Cordão umbilical com três vasos (duas artérias e uma veia), sem circulares cervicais visíveis no momento do exame.<br>Líquido amniótico em volume normal para a idade gestacional. Índice de Líquido Amniótico (ILA): {{ila}} cm.<br>Placenta de inserção {{placenta_insercao}}, distando {{placenta_distancia}} cm do orifício interno do colo, com ecotextura homogênea, Grau {{placenta_grau}} de Grannum.<br>Colo uterino fechado, medindo {{colo}} mm.<br><br><b>Biometria Fetal:</b><br>Diâmetro biparietal (DBP): {{dbp}} mm<br>Circunferência craniana (CC): {{cc}} mm<br>Circunferência abdominal (CA): {{ca}} mm<br>Comprimento femoral (CF): {{cf}} mm<br>Peso fetal estimado (Hadlock 4): {{peso}} g (Percentil {{percentil}} para a IG clínica de {{ig_clinica_semanas}}s{{ig_clinica_dias}}d - Ref: Barcelona/Hadlock)<br><br><b>Conclusão:</b><br>Gestação tópica com feto único em evolução.<br>Biometria fetal compatível com {{ig_semanas}} semanas e {{ig_dias}} dias.<br>{{conclusao_percentil}}<br><br>Obs: Este exame não tem finalidade de detecção de malformações fetais. A critério clínico, a investigação com exames morfológicos em idade gestacional adequada poderá trazer informações adicionais.',
    fields: [
      { id: 'ig_clinica_semanas', label: 'IG Clínica (Semanas)', type: 'number', unit: 'sem' },
      { id: 'ig_clinica_dias', label: 'IG Clínica (Dias)', type: 'number', unit: 'dias' },
      { id: 'apresentacao', label: 'Apresentação Fetal', type: 'select', unit: '', options: ['Cefálica', 'Pélvica', 'Córmica (Transversa)'] },
      { id: 'fcf', label: 'Freq. Cardíaca (FCF)', type: 'number', unit: 'bpm' },
      { id: 'ila', label: 'ILA', type: 'number', unit: 'cm' },
      { id: 'placenta_insercao', label: 'Inserção Placentária', type: 'select', unit: '', options: ['Anterior', 'Posterior', 'Fúndica', 'Lateral Direita', 'Lateral Esquerda', 'Prévia'] },
      { id: 'placenta_distancia', label: 'Distância do Colo', type: 'number', unit: 'cm' },
      { id: 'placenta_grau', label: 'Grau Placentário (Grannum)', type: 'select', unit: '', options: ['0', 'I', 'II', 'III'] },
      { id: 'colo', label: 'Colo Uterino', type: 'number', unit: 'mm' },
      { id: 'dbp', label: 'DBP', type: 'number', unit: 'mm' },
      { id: 'cc', label: 'CC', type: 'number', unit: 'mm' },
      { id: 'ca', label: 'CA', type: 'number', unit: 'mm' },
      { id: 'cf', label: 'CF', type: 'number', unit: 'mm' },
      { id: 'peso', label: 'Peso Fetal (g)', type: 'number', unit: 'g' },
      { id: 'percentil', label: 'Percentil', type: 'number', unit: '' },
      { id: 'ig_semanas', label: 'IG Biometria (Sem)', type: 'number', unit: 'sem' },
      { id: 'ig_dias', label: 'IG Biometria (Dias)', type: 'number', unit: 'dias' },
      { id: 'conclusao_percentil', label: 'Conclusão do Crescimento', type: 'textarea', unit: '' }
    ]
  },
  {
    id: 'm6',
    name: 'US Doppler Obstétrico',
    specialtyId: '5',
    baseContent: '<b>ULTRASSONOGRAFIA OBSTÉTRICA COM DOPPLER COLORIDO</b><br><br><b>Técnica:</b><br>Exame realizado por via abdominal com transdutor convexo de banda larga, associado ao mapeamento em cores e estudo doplervelocimétrico.<br><br><b>Análise:</b><br>Útero gravídico contendo feto único, em situação longitudinal, apresentação {{apresentacao}}.<br>Batimentos cardíacos fetais rítmicos, FCF de {{fcf}} bpm.<br>Líquido amniótico em volume normal para a idade gestacional. Índice de Líquido Amniótico (ILA): {{ila}} cm.<br>Placenta de inserção {{placenta_insercao}}, Grau {{placenta_grau}} de Grannum.<br><br><b>Biometria Fetal:</b><br>Peso fetal estimado (Hadlock 4): {{peso}} g (Percentil {{percentil}} para a IG clínica de {{ig_clinica_semanas}}s{{ig_clinica_dias}}d - Ref: Barcelona/Hadlock)<br><br><b>Estudo Doplervelocimétrico:</b><br><b>Artérias Uterinas:</b><br>Artéria Uterina Direita: IP = {{ip_aut_dir}} (Percentil {{perc_aut_dir}})<br>Artéria Uterina Esquerda: IP = {{ip_aut_esq}} (Percentil {{perc_aut_esq}})<br>IP Médio das Artérias Uterinas: {{ip_aut_medio}} (Percentil {{perc_aut_medio}})<br>Presença de incisura protodiastólica: {{incisura}}<br><br><b>Artéria Umbilical:</b><br>IP = {{ip_aumb}} (Percentil {{perc_aumb}})<br>Fluxo diastólico presente e normodirecionado.<br><br><b>Artéria Cerebral Média:</b><br>IP = {{ip_acm}} (Percentil {{perc_acm}})<br>Pico de Velocidade Sistólica (PVS): {{pvs_acm}} cm/s ({{mom_pvs_acm}} MoM)<br><br><b>Relação Cérebro-Placentária (RCP):</b><br>RCP = {{rcp}} (Percentil {{perc_rcp}})<br><br><b>Conclusão:</b><br>Gestação tópica com feto único em evolução.<br>{{conclusao_doppler}}<br><br>Obs: Estudo doplervelocimétrico avaliado conforme as curvas de referência da Fetal Medicine Foundation / Medicina Fetal Barcelona.',
    fields: [
      { id: 'ig_clinica_semanas', label: 'IG Clínica (Semanas)', type: 'number', unit: 'sem' },
      { id: 'ig_clinica_dias', label: 'IG Clínica (Dias)', type: 'number', unit: 'dias' },
      { id: 'apresentacao', label: 'Apresentação Fetal', type: 'select', unit: '', options: ['Cefálica', 'Pélvica', 'Córmica (Transversa)'] },
      { id: 'fcf', label: 'Freq. Cardíaca (FCF)', type: 'number', unit: 'bpm' },
      { id: 'ila', label: 'ILA', type: 'number', unit: 'cm' },
      { id: 'placenta_insercao', label: 'Inserção Placentária', type: 'select', unit: '', options: ['Anterior', 'Posterior', 'Fúndica', 'Lateral Direita', 'Lateral Esquerda', 'Prévia'] },
      { id: 'placenta_grau', label: 'Grau Placentário', type: 'select', unit: '', options: ['0', 'I', 'II', 'III'] },
      { id: 'peso', label: 'Peso Fetal (g)', type: 'number', unit: 'g' },
      { id: 'percentil', label: 'Percentil do Peso', type: 'number', unit: '' },
      { id: 'ip_aut_dir', label: 'IP Art. Uterina Dir', type: 'number', unit: '' },
      { id: 'perc_aut_dir', label: 'Percentil AUT Dir', type: 'number', unit: '' },
      { id: 'ip_aut_esq', label: 'IP Art. Uterina Esq', type: 'number', unit: '' },
      { id: 'perc_aut_esq', label: 'Percentil AUT Esq', type: 'number', unit: '' },
      { id: 'ip_aut_medio', label: 'IP Médio AUT', type: 'number', unit: '' },
      { id: 'perc_aut_medio', label: 'Percentil IP Médio AUT', type: 'number', unit: '' },
      { id: 'incisura', label: 'Incisura Protodiastólica', type: 'select', unit: '', options: ['Ausente', 'Presente à direita', 'Presente à esquerda', 'Presente bilateralmente'] },
      { id: 'ip_aumb', label: 'IP Art. Umbilical', type: 'number', unit: '' },
      { id: 'perc_aumb', label: 'Percentil AUMB', type: 'number', unit: '' },
      { id: 'ip_acm', label: 'IP Art. Cerebral Média', type: 'number', unit: '' },
      { id: 'perc_acm', label: 'Percentil ACM', type: 'number', unit: '' },
      { id: 'pvs_acm', label: 'PVS ACM (cm/s)', type: 'number', unit: 'cm/s' },
      { id: 'mom_pvs_acm', label: 'MoM PVS ACM', type: 'number', unit: 'MoM' },
      { id: 'rcp', label: 'RCP (IP ACM / IP AUMB)', type: 'number', unit: '' },
      { id: 'perc_rcp', label: 'Percentil RCP', type: 'number', unit: '' },
      { id: 'conclusao_doppler', label: 'Conclusão Doppler', type: 'textarea', unit: '' }
    ]
  }
];

export const INITIAL_PHRASES: Phrase[] = [];
