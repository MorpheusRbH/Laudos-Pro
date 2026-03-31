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
    name: 'USG Abdome Total',
    specialtyId: '2',
    baseContent: '<b>ULTRASSONOGRAFIA DE ABDOME TOTAL</b><br><br><b>Técnica:</b><br>Exame realizado com transdutor convexo de banda larga.<br><br><b>Análise:</b><br><b>Fígado</b> de dimensões normais, contornos regulares, ecotextura homogênea e ecogenicidade preservada.<br><b>Vesícula biliar</b> normodistendida, paredes finas, conteúdo anecogênico, sem cálculos.<br><b>Vias biliares</b> intra e extra-hepáticas de calibres normais. Colédoco não dilatado.<br><b>Pâncreas</b> de dimensões e ecotextura preservadas.<br><b>Baço</b> de dimensões normais e parênquima homogêneo.<br><b>Rim direito</b> tópico, dimensões normais, contornos regulares, boa diferenciação córtico-medular, sem cálculos ou hidronefrose.<br><b>Rim esquerdo</b> tópico, dimensões normais, contornos regulares, boa diferenciação córtico-medular, sem cálculos ou hidronefrose.<br><b>Bexiga</b> normodistendida, paredes regulares, conteúdo anecogênico.<br><b>Aorta abdominal</b> de calibre normal, sem dilatações aneurismáticas.<br>Ausência de líquido livre ou coleções na cavidade abdominal.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: []
  },
  {
    id: 'm2',
    name: 'USG Abdome Superior',
    specialtyId: '2',
    baseContent: '<b>ULTRASSONOGRAFIA DE ABDOME SUPERIOR</b><br><br><b>Técnica:</b><br>Exame realizado com transdutor convexo de banda larga.<br><br><b>Análise:</b><br><b>Fígado</b> de dimensões normais, contornos regulares, ecotextura homogênea e ecogenicidade preservada.<br><b>Vesícula biliar</b> normodistendida, paredes finas, conteúdo anecogênico, sem cálculos.<br><b>Vias biliares</b> intra e extra-hepáticas de calibres normais. Colédoco não dilatado.<br><b>Pâncreas</b> de dimensões e ecotextura preservadas.<br><b>Baço</b> de dimensões normais e parênquima homogêneo.<br><b>Aorta abdominal</b> de calibre normal, sem dilatações aneurismáticas.<br>Ausência de líquido livre ou coleções na cavidade abdominal superior.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: []
  },
  {
    id: 'm3',
    name: 'USG Pélvica Transvaginal',
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
    name: 'USG Obstétrica (1º Trimestre)',
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
    name: 'USG Obstétrica (2º e 3º Trimestres)',
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
    name: 'USG Doppler Obstétrico',
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
  },
  {
    id: 'm7',
    name: 'USG Rins e Vias Urinárias (Sem Medidas)',
    specialtyId: '3',
    baseContent: '<b>ULTRASSONOGRAFIA RENAL E DAS VIAS URINÁRIAS</b><br><br><b>Rim direito:</b><br>Morfologia, contornos, dimensões e topografia habituais.<br>Parênquima com relação corticomedular preservada.<br>Sistema pielocalicial compacto.<br>Não visibilizado imagens compatíveis com cálculos no sistema pielocalicial.<br><br><b>Rim esquerdo:</b><br>Morfologia, contornos, dimensões e topografia habituais.<br>Parênquima com relação corticomedular preservada.<br>Sistema pielocalicial compacto.<br>Não visibilizado imagens compatíveis com cálculos no sistema pielocalicial.<br><br><b>Bexiga urinária:</b><br>Normodistendida, com conteúdo anecóide e não apresentando cálculos.<br>Parede vesical regular e de espessura normal.<br><br><b>IMPRESSÃO DIAGNÓSTICA:</b><br>Achados ultrassonográficos dentro dos padrões da normalidade.<br><br><b>Obs.:</b> Cálculos renais menores que 5 mm podem não ser identificados devido a limitação inerente do método ecográfico.',
    fields: []
  },
  {
    id: 'm8',
    name: 'USG Rins e Vias Urinárias (Com Medidas)',
    specialtyId: '3',
    baseContent: '<b>ULTRASSONOGRAFIA RENAL E DAS VIAS URINÁRIAS</b><br><br><b>Rim direito:</b><br>Morfologia, contornos e topografia habituais.<br>Dimensões: {{rd_c}} x {{rd_l}} cm. Espessura de parênquima: {{rd_par}} cm.<br>Parênquima com espessura e diferenciação corticomedular preservada.<br>Sistema pielocalicial compacto.<br>Não visibilizado imagens compatíveis com cálculos no sistema pielocalicial.<br><br><b>Rim esquerdo:</b><br>Morfologia, contornos e topografia habituais.<br>Dimensões: {{re_c}} x {{re_l}} cm. Espessura de parênquima: {{re_par}} cm.<br>Parênquima com espessura e diferenciação corticomedular preservada.<br>Sistema pielocalicial compacto.<br>Não visibilizado imagens compatíveis com cálculos no sistema pielocalicial.<br><br><b>Bexiga urinária:</b><br>Normodistendida, com conteúdo anecóide e não apresentando cálculos.<br>Parede vesical regular e de espessura normal.<br><br><b>IMPRESSÃO DIAGNÓSTICA:</b><br>- Achados ultrassonográficos dentro dos padrões da normalidade.<br><br><b>Nota:</b> Exame realizado em caráter de urgência.<br><b>Obs.:</b> Cálculos renais menores que 5 mm podem não ser identificados devido a limitação inerente do método ecográfico.',
    fields: [
      { id: 'rd_c', label: 'RD Comprimento', type: 'number', unit: 'cm' },
      { id: 'rd_l', label: 'RD Largura', type: 'number', unit: 'cm' },
      { id: 'rd_par', label: 'Parênquima RD', type: 'number', unit: 'cm' },
      { id: 're_c', label: 'RE Comprimento', type: 'number', unit: 'cm' },
      { id: 're_l', label: 'RE Largura', type: 'number', unit: 'cm' },
      { id: 're_par', label: 'Parênquima RE', type: 'number', unit: 'cm' }
    ]
  },
  {
    id: 'm9',
    name: 'USG Mama (BI-RADS)',
    specialtyId: '6',
    baseContent: '<b>ULTRASSONOGRAFIA DE MAMAS</b><br><br><b>Técnica:</b><br>Exame ultrassonográfico realizado com equipamento de alta resolução, transdutor linear de alta frequência, com avaliação das mamas e regiões axilares bilaterais.<br><br><b>Mama direita:</b><br>Pele e tecido subcutâneo de espessura normais.<br>Composição mamária {{composicao_dir}}.<br>Parênquima mamário de ecotextura {{eco_dir}}, de aspecto habitual.<br>{{achados_dir}}<br>Região axilar direita {{axila_dir}}.<br><br><b>Mama esquerda:</b><br>Pele e tecido subcutâneo de espessura normais.<br>Composição mamária {{composicao_esq}}.<br>Parênquima mamário de ecotextura {{eco_esq}}, de aspecto habitual.<br>{{achados_esq}}<br>Região axilar esquerda {{axila_esq}}.<br><br><b>CONCLUSÃO:</b><br>{{conclusao}}<br><br><b>BI-RADS:</b><br>{{birads}}<br><br><b>RECOMENDAÇÃO:</b><br>{{recomendacao}}<br><br><b>Nota:</b><br>{{nota}}<br><br><b>Obs:</b><br>{{obs}}',
    fields: [
      { id: 'composicao_dir', label: 'Comp. Mamária MD', type: 'select', unit: '', options: ['predominantemente adiposa', 'com áreas esparsas de tecido fibroglandular', 'heterogênea', 'densa'] },
      { id: 'eco_dir', label: 'Ecotextura MD', type: 'select', unit: '', options: ['homogênea', 'heterogênea'] },
      { id: 'achados_dir', label: 'Achados MD', type: 'textarea', unit: '' },
      { id: 'axila_dir', label: 'Axila Direita', type: 'textarea', unit: '' },
      { id: 'composicao_esq', label: 'Comp. Mamária ME', type: 'select', unit: '', options: ['predominantemente adiposa', 'com áreas esparsas de tecido fibroglandular', 'heterogênea', 'densa'] },
      { id: 'eco_esq', label: 'Ecotextura ME', type: 'select', unit: '', options: ['homogênea', 'heterogênea'] },
      { id: 'achados_esq', label: 'Achados ME', type: 'textarea', unit: '' },
      { id: 'axila_esq', label: 'Axila Esquerda', type: 'textarea', unit: '' },
      { id: 'conclusao', label: 'Conclusão', type: 'textarea', unit: '' },
      { id: 'birads', label: 'BI-RADS', type: 'select', unit: '', options: [
        'Incompleto (Categoria 0)',
        'Ausência de achados patológicos (Categoria I)',
        'Achados benignos (Categoria II)',
        'Achados provavelmente benignos (Categoria III) — controle ultrassonográfico em 6 meses',
        'Achados suspeitos (Categoria IV)',
        'Achados suspeitos (Categoria IV-A)',
        'Achados suspeitos (Categoria IV-B)',
        'Achados suspeitos (Categoria IV-C)',
        'Achados altamente suspeitos de malignidade (Categoria V)',
        'Malignidade comprovada (Categoria VI)'
      ] },
      { id: 'recomendacao', label: 'Recomendação', type: 'textarea', unit: '' },
      { id: 'nota', label: 'Nota', type: 'text', unit: '' },
      { id: 'obs', label: 'Obs', type: 'textarea', unit: '' }
    ]
  },
  {
    id: 'm10',
    name: 'USG Tireoide',
    specialtyId: '7',
    baseContent: '<b>ULTRASSONOGRAFIA DA TIREOIDE</b><br><br><b>Técnica:</b><br>Exame realizado com transdutor linear de alta frequência.<br><br><b>Análise:</b><br><b>Tireoide</b> tópica, contornos regulares e ecotextura homogênea.<br><b>Lobo direito</b> mede {{ld_c}} x {{ld_l}} x {{ld_a}} cm (Vol: {{ld_vol}} cm³).<br><b>Lobo esquerdo</b> mede {{le_c}} x {{le_l}} x {{le_a}} cm (Vol: {{le_vol}} cm³).<br><b>Istmo</b> mede {{istmo}} mm.<br>Volume total da glândula: {{vol_total}} cm³.<br>Ausência de massas ou coleções intraglandulares.<br>Regiões cervicais laterais sem linfonodomegalias suspeitas.<br><br><b>Conclusão:</b><br>Exame sem alterações significativas.',
    fields: [
      { id: 'ld', label: 'Lobo Direito', type: 'measurement3d', unit: 'cm' },
      { id: 'le', label: 'Lobo Esquerdo', type: 'measurement3d', unit: 'cm' },
      { id: 'istmo', label: 'Istmo', type: 'number', unit: 'mm' },
      { id: 'vol_total', label: 'Volume Total', type: 'number', unit: 'cm³' }
    ]
  }
];

export const INITIAL_PHRASES: Phrase[] = [
  // GERAL
  { id: 'as1', maskId: 'm2', category: 'GERAL', title: 'Ausência de achados', text: 'Ausência de achados ultrassonográficos patológicos específicos.' },
  { id: 'as2', maskId: 'm2', category: 'GERAL', title: 'Pâncreas não visibilizado', text: 'Pâncreas e demais estruturas do retroperitônio não visibilizados devido à intensa sobreposição gasosa.' },
  { id: 'as3', maskId: 'm2', category: 'GERAL', title: 'Cauda e corpo pancreático', text: 'Cauda e corpo pancreático não visibilizados devido à sobreposição gasosa.' },
  { id: 'as4', maskId: 'm2', category: 'GERAL', title: 'Cauda pancreática', text: 'Cauda pancreática não visibilizada devido à sobreposição gasosa.' },
  { id: 'as5', maskId: 'm2', category: 'GERAL', title: 'Bexiga vazia', text: 'Bexiga urinária vazia, dificultando sua adequada avaliação ecográfica.' },
  { id: 'as6', maskId: 'm2', category: 'GERAL', title: 'Bexiga baixa repleção', text: 'Bexiga urinária com conteúdo anecóide de baixa repleção, dificultando a adequada avaliação ecográfica.' },
  { id: 'as7', maskId: 'm2', category: 'GERAL', title: 'Ovários não visibilizados (gás)', text: 'Ovários não visibilizados (interposição gasosa de alças intestinais?).' },
  { id: 'as8', maskId: 'm2', category: 'GERAL', title: 'Ovários não visibilizados (atróficos)', text: 'Ovários não visibilizados (atróficos?).' },
  { id: 'as9', maskId: 'm2', category: 'GERAL', title: 'Obs. Correlação', text: 'Obs.: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'as10', maskId: 'm2', category: 'GERAL', title: 'Nota Urgência', text: 'Nota: Exame realizado em caráter de urgência.' },

  // ABSCESSO HEPÁTICO
  { id: 'as11', maskId: 'm2', category: 'ABSCESSO HEPÁTICO', title: 'Imagem cística/espessa', text: 'Nota-se imagem cística, de paredes espessas e irregulares, conteúdo anecóide com moderados debris e traves de permeio (cístico-espesso), com fluxo periférico ao Doppler, ocupando o segmento hepático *, medindo cerca de cm (L x AP x T) e volume estimado de cm³, distando cm da superfície hepática.\n- Imagem cístico-espessa no fígado. Considerar possibilidade de abscesso hepático.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // ADENITE MESENTÉRICA
  { id: 'as12', maskId: 'm2', category: 'ADENITE MESENTÉRICA', title: 'Linfonodos aumentados', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em fossas ilíacas e região peri-umbilical:\n- Evidenciou pelo menos * linfonodos levemente aumentados, no mesentério da região periumbilical e fossas ilíacas, hipoecogênicos com centro ecogênico, sem sinais de degeneração cístico-necrótica, medindo até cm.\n- Não evidenciou-se aumento da ecogenicidade da gordura mesentérica e não caracterizou o apêndice cecal.\n- Alças intestinais com peristalse preservada.\n- Linfonodos intraperitoneais levemente aumentados. Considerar possibilidade de adenite mesentérica.\nObs.: O método ultrassonográfico apresenta baixa sensibilidade na detecção de apendicite aguda em fase muito precoce. Necessário correlação clínico-laboratorial.' },

  // ALONGAMENTO HEPÁTICO
  { id: 'as13', maskId: 'm2', category: 'ALONGAMENTO HEPÁTICO', title: 'Lobo de Riedel', text: 'Fígado de morfologia e contornos normais, apresentando alongamento vertical do lobo hepático direito, medindo cm longitudinal (habitual < 15,0 cm): Lobo de Riedel: variante anatômica.' },
  { id: 'as14', maskId: 'm2', category: 'ALONGAMENTO HEPÁTICO', title: 'Lobo esquerdo horizontal', text: 'Fígado de morfologia e contornos normais apresentando alongamento horizontal do lobo hepático esquerdo, em íntimo contato com o baço (variante anatômica).' },
  { id: 'as15', maskId: 'm2', category: 'ALONGAMENTO HEPÁTICO', title: 'Lobo esquerdo vertical', text: 'Fígado de morfologia e contornos normais apresentando alongamento vertical do lobo hepático esquerdo, medindo cm longitudinal (habitual < 10,0 cm) (variante anatômica).' },

  // ANEURISMA DE AORTA ABDOMINAL
  { id: 'as16', maskId: 'm2', category: 'ANEURISMA DE AORTA ABDOMINAL', title: 'Aneurisma Fusiforme/Sacular', text: 'Aorta abdominal pérvia, com calcificações parietais ateromatosas leves/grosseiras associado a dilatação aneurismática fusiforme/sacular em seu segmento supra/infra-renal, medindo * cm (AP x T) e extensão de * cm, com trombos murais semi-circunferenciais laminares, reduzindo a luz efetiva em cerca de * %, com fluxo turbilhonado ao Doppler Colorido.\nO colo do aneurisma mede: * cm.\nDiâmetro aórticos:\n- Transição tóraco-abdominal: * cm (normal até 2,5 cm).\n- Nível da artéria mesentérica superior: * cm (normal até 2,5 cm).\n- Nível da bifurcação das ilíacas: * cm (normal até 3,0 cm).\nArtérias ilíacas comuns apresentam-se pérvias, com calibre e contornos normais, medindo até * cm à direita e * cm à esquerda.\n- Dilatação aneurismática de aorta abdominal.' },

  // APENDAGITE EPIPLÓICA
  { id: 'as17', maskId: 'm2', category: 'APENDAGITE EPIPLÓICA', title: 'Imagem ovalada FIE', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região abdominal, evidenciou:\n- Imagem ovalada, na fossa ilíaca esquerda, na borda antimesentérica, hiperecogênica com halo hipoecogênico, medindo * cm.\n- Borramento dos planos gordurosos adjacentes à imagem descrita.\n- Alças intestinais com peristalse preservada.\n- Imagem ovalada na fossa ilíaca esquerda. Considerar possibilidade de apendagite epiplóica. Conveniente complementar com TC.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // APÊNDICE CECAL
  { id: 'as18', maskId: 'm2', category: 'APÊNDICE CECAL', title: 'Não caracterizado', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em fossas ilíacas, não evidenciou aumento da ecogenicidade da gordura mesentérica e não caracterizou ecograficamente o apêndice cecal. Alças intestinais com peristalse preservada.\nObs.: O método ultrassonográfico apresenta baixa sensibilidade na detecção de apendicite aguda em fase muito precoce. Necessário correlação clínico-laboratorial.' },

  // APENDICITE
  { id: 'as19', maskId: 'm2', category: 'APENDICITE', title: 'Sinais de Apendicite', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região pélvica, evidenciou:\n- Imagem tubular, de fundo cego, medindo * cm de espessura (normal < 0,7 cm), sem delaminamento de parede, não compressível, podendo corresponder a apêndice cecal inflamado.\n- Observa-se ainda imagem nodular, provida de sombra acústica posterior, na luz do apêndice, medindo * cm, compatível com apendicolito.\n- Borramento dos planos gordurosos adjacentes na região de fossa ilíaca à direita.\n- Pequena quantidade de líquido na fossa ilíaca direita e fundo de saco posterior de aspecto anecóide.\n- Linfonodos peri-cecais discretamente aumentados, hipoecogênicos de centro ecogênico, medindo até * cm.\n- Alças intestinais com peristalse reduzida.\n- Sinais compatíveis com apendicite aguda.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // BAÇO ACESSÓRIO
  { id: 'as20', maskId: 'm2', category: 'BAÇO ACESSÓRIO', title: 'Baço Acessório (Geral)', text: 'Nota-se imagem nodular, sólida, de contornos bem definidos e regulares, isoecogênica ao parênquima esplênico, ínferomedialmente ao baço, medindo * cm, compatível com baço acessório.' },
  { id: 'as21', maskId: 'm2', category: 'BAÇO ACESSÓRIO', title: 'Baço Acessório (Face Inferior)', text: 'Baço acessório adjacente à face inferior esplênica, medindo cm.' },

  // BARRO BILIAR
  { id: 'as22', maskId: 'm2', category: 'BARRO BILIAR', title: 'Barro Biliar', text: 'Vesícula biliar normodistendida, com paredes finas e lisas, apresentando conteúdo hipoecogênico com nível líquido-líquido, correspondendo a barro biliar.\nSinal de Murphy ultrassonográfico negativo.\n- Barro biliar.\nNota: O achado de barro biliar pode ocultar a detecção de microcálculos vesiculares pelo método ecográfico.' },

  // BORRAMENTO DA GORDURA MESENTÉRICA
  { id: 'as23', maskId: 'm2', category: 'BORRAMENTO DA GORDURA MESENTÉRICA', title: 'Borramento FIE', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região pélvica, evidenciou:\n- Área de borramento da gordura mesentérica na fossa ilíaca esquerda.\n- Alças intestinais com peristalse levemente reduzida.\n- Borramento da gordura mesentérica na fossa ilíaca à esquerda: processo inflamatório? Conveniente complementar com TC.' },

  // CALCIFICAÇÃO HEPÁTICA
  { id: 'as24', maskId: 'm2', category: 'CALCIFICAÇÃO HEPÁTICA', title: 'Calcificação Residual', text: 'Nota-se foco hiperecogênico, irregular, provido de sombra acústica posterior, no segmento hepático *, medindo cerca de cm.\n- Calcificação hepática de aspecto residual.' },

  // CISTO HEPÁTICO
  { id: 'as25', maskId: 'm2', category: 'CISTO HEPÁTICO', title: 'Cisto Simples', text: 'Nota-se imagem cística, de paredes finas e regulares, conteúdo anecóide homogêneo, no segmento hepático *, medindo cm.\n- Cisto hepático.' },

  // CISTOS HEPÁTICOS
  { id: 'as26', maskId: 'm2', category: 'CISTOS HEPÁTICOS', title: 'Múltiplos Cistos (Listados)', text: 'Notam-se imagens císticas de paredes finas e lobuladas, conteúdo anecóide homogêneo, caracterizadas assim:\n- segmento hepático , medindo * cm.\n- segmento hepático , medindo * cm.\n- Cistos hepáticos.' },
  { id: 'as27', maskId: 'm2', category: 'CISTOS HEPÁTICOS', title: 'Múltiplos Cistos (Geral)', text: 'Notam-se imagens císticas de paredes finas e regulares, conteúdo anecóide homogêneo, medindo até cm no segmento hepático *.\n- Cistos hepáticos.' },

  // COLECISTECTOMIA
  { id: 'as28', maskId: 'm2', category: 'COLECISTECTOMIA', title: 'Sinais de Colecistectomia', text: 'Hepatocolédoco de calibre normal, medindo cm ao nível da porta hepatis.\nVesícula biliar não caracterizada (status pós-operatório).\n- Sinais de colecistectomia.' },

  // COLECISTITE LITIÁSICA
  { id: 'as29', maskId: 'm2', category: 'COLECISTITE LITIÁSICA', title: 'Colecistite Litiásica', text: 'Vesícula biliar hiperdistendida, medindo * cm (normal < 10,0 x 4,0 cm), com paredes espessadas e delaminadas, medindo cm (normal < 0,4 cm), apresentando conteúdo hipoecogênico com nível líquido-líquido, correspondendo a barro biliar, associado a múltiplos/alguns cálculos providos de sombra acústica posterior, o maior medindo * cm.\nSinal de Murphy ultrassonográfico positivo.\n- Sinais de colecistite litiásica.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // COLECISTITE LITIÁSICA BORDERLINE
  { id: 'as30', maskId: 'm2', category: 'COLECISTITE LITIÁSICA BORDERLINE', title: 'Colecistite Borderline', text: 'Vesícula biliar discretamente distendida, medindo * cm, com paredes de espessura limítrofe, medindo 0,4 cm, apresentando conteúdo anecóide com múltiplas/algumas imagens nodulares, hiperecogênicas, providas de sombra acústica posterior, a maior medindo * cm, correspondendo a cálculos.\nSinal de Murphy ultrassonográfico positivo.\n- Colelitíase. Necessário correlação clínico-laboratorial para avaliar possibilidade de colecistite em estágio inicial.' },

  // COLELITÍASE E BARRO BILIAR
  { id: 'as31', maskId: 'm2', category: 'COLELITÍASE E BARRO BILIAR', title: 'Colelitíase + Barro Biliar', text: 'Vesícula biliar normodistendida, de paredes finas e lisas, apresentando conteúdo hipoecogênico com nível líquido-líquido, correspondendo a barro biliar, associado a pelo menos uma imagem nodular, hiperecogênica, provida de sombra acústica posterior, medindo * cm, correspondendo a cálculo.\nSinal de Murphy ultrassonográfico negativo.\n- Colelitíase com barro biliar.' },

  // COLELITÍASE MÚLTIPLA
  { id: 'as32', maskId: 'm2', category: 'COLELITÍASE MÚLTIPLA', title: 'Múltiplos Cálculos', text: 'Vesícula biliar normodistendida, com paredes finas e lisas, apresentando conteúdo anecóide com múltiplas/algumas imagens nodulares, hiperecogênicas, providas de sombra acústica posterior, móveis à mudança de decúbito, a maior medindo * cm, correspondendo a cálculos.\nSinal de Murphy ultrassonográfico negativo.\n- Colelitíase.' },

  // COLELITÍASE (UM CÁLCULO)
  { id: 'as33', maskId: 'm2', category: 'COLELITÍASE (UM CÁLCULO)', title: 'Um Cálculo', text: 'Vesícula biliar normodistendida, com paredes finas e lisas, apresentando conteúdo anecóide com imagem nodular, hiperecogênica, provida de sombra acústica posterior, móvel à mudança de decúbito, medindo * cm, correspondendo a cálculo.\nSinal de Murphy ultrassonográfico negativo.\n- Colelitíase.' },

  // COLELITÍASE COM VESÍCULA ESCLEROATRÓFICA
  { id: 'as34', maskId: 'm2', category: 'COLELITÍASE COM VESÍCULA ESCLEROATRÓFICA', title: 'Vesícula Escleroatrófica', text: 'Vesícula biliar hipodistendida, de paredes aparentemente finas, com seu interior ocupado por imagem hiperecogênica, provida de sombra acústica posterior, medindo cerca de * cm, podendo corresponder a cálculo/cálculos.\nSinal de Murphy ultrassonográfico negativo.\n- Colelitíase com sinais de vesícula biliar escleroatrófica.' },

  // COLEDOCOLITÍASE
  { id: 'as35', maskId: 'm2', category: 'COLEDOCOLITÍASE', title: 'Coledocolitíase', text: 'Vias biliares intra-hepáticas levemente dilatadas, medindo * cm à esquerda e * cm à direita (normal < 0,25 cm).\nNota-se imagem nodular, hiperecogênica no colédoco, medindo * cm, a cerca de * cm da porta hepatis, correspondendo a cálculo impactado, promovendo dilatação à montante, com hepatocolédoco medindo * cm de calibre.\nVesícula biliar hiperdistendida, medindo * cm, com paredes finas e lisas, apresentando conteúdo anecóide com múltiplas pequenas imagens nodulares, hiperecogênicas, com diâmetro médio de * cm, correspondendo a microcálculos.\nSinal de Murphy ultrassonográfico positivo.\nPâncreas de morfologia, contornos, dimensões e ecotextura normais. Ducto de Wirsung de calibre preservado.\n- Colelitíase.\n- Coledocolitíase com dilatação de vias biliares intra e extra-hepáticas.' },

  // COLESTEROLOSE
  { id: 'as36', maskId: 'm2', category: 'COLESTEROLOSE', title: 'Colesterolose', text: 'Vesícula biliar normodistendida, com paredes finas apresentando pequenos focos hiperecogênicos de artefatos em "cauda de cometa", medindo até 0,2 cm, podendo corresponder a colesterolose.\nConteúdo vesicular anecóide e não apresentando cálculos.\nSinal de Murphy ultrassonográfico negativo.\n- Colesterolose vesicular.' },

  // COLESTEROLOSE / ADENOMIOMATOSE
  { id: 'as37', maskId: 'm2', category: 'COLESTEROLOSE / ADENOMIOMATOSE', title: 'Adenomiomatose', text: 'Vesícula biliar normodistendida, com paredes difusamente espessas e irregulares, medindo até cm (normal < 0,4 cm) e áreas hipoecogênicas evaginadas a partir da mucosa na parede muscular, podendo corresponder a adenomiomatose com seios de Rokitansky-Aschoff (divertículos intra-murais).\nObserva-se ainda áreas ecogênicas de artefatos em "cauda de cometa", medindo até 0,2 cm, podendo corresponder a colesterolose.\nConteúdo vesicular anecóide e não apresentando cálculos.\nSinal de Murphy ultrassonográfico negativo.\n- Colesterolose/adenomiomatose vesicular.' },

  // DERIVAÇÃO BÍLIO-DIGESTIVA
  { id: 'as38', maskId: 'm2', category: 'DERIVAÇÃO BÍLIO-DIGESTIVA', title: 'Derivação com Aerobilia', text: 'Vias biliares intra-hepáticas de calibres normais com alguns focos ecogênicos de artefatos em "cauda de cometa" nas vias biliares principais e secundárias, sugerindo aerobilia.\nHepatocolédoco de calibre aumentado, medindo cm ao nível da porta hepatis, visibilizado até ao nível da junção colédoco-intestinal, sem sinais de fatores obstrutivos.\n- Sinais de derivação bílio-digestiva com aerobilia leve.' },

  // ESPESSAMENTO DE ALÇA COLÔNICA
  { id: 'as39', maskId: 'm2', category: 'ESPESSAMENTO DE ALÇA COLÔNICA', title: 'Espessamento Parietal', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região abdominal, evidenciou:\n- Espessamento parietal difuso de alça colônica na fossa ilíaca direita/esquerda, medindo até cm (normal < 0,6 cm).\n- Borramento dos planos gordurosos adjacentes à alça descrita.\n- Pequena quantidade de líquido na fossa ilíaca direita/esquerda e fundo de saco posterior de aspecto anecóide.\n- Linfonodos regionais discretamente aumentados, hipoecogênicos de centro ecogênico, medindo até * cm.\n- Alças intestinais com peristalse reduzida.\n- Espessamento parietal difuso de alça colônica na fossa ilíaca direita/esquerda. Considerar possibilidade de processo inflamatório/infeccioso. Conveniente complementar com TC.' },

  // ESPLENECTOMIA
  { id: 'as40', maskId: 'm2', category: 'ESPLENECTOMIA', title: 'Esplenectomia Total', text: 'Baço não caracterizado (status pós-operatório).\n- Sinais de esplenectomia total.' },
  { id: 'as41', maskId: 'm2', category: 'ESPLENECTOMIA', title: 'Auto-esplenectomia', text: 'Baço não visibilizado: auto-esplenectomia?\n- Sinais de auto-esplenectomia.' },

  // ESPLENECTOMIA + ESPLENOSE
  { id: 'as42', maskId: 'm2', category: 'ESPLENECTOMIA + ESPLENOSE', title: 'Esplenose', text: 'Baço não caracterizado (status pós-operatório).\nNotam-se na loja esplênica algumas imagens nodulares, sólidas, de contornos lobulados, com ecotextura semelhante à esplênica, medindo até * cm.\n- Sinais de esplenectomia.\n- Nodulações na loja esplênica. Considerar possibilidade de esplenose.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // ESPLENOMEGALIA
  { id: 'as43', maskId: 'm2', category: 'ESPLENOMEGALIA', title: 'Leve', text: 'Baço de morfologia, contornos e ecotextura normais, com dimensões aumentadas, medindo cm em seu maior eixo (normal < 12,0 cm).\n- Esplenomegalia homogênea leve.' },
  { id: 'as44', maskId: 'm2', category: 'ESPLENOMEGALIA', title: 'Volumosa', text: 'Baço de dimensões muito aumentadas, medindo cerca de * cm em seu maior eixo (normal < 12,0 cm), ultrapassando a linha média e estendendo-se para a fossa ilíaca esquerda, comprimindo órgãos adjacentes.\n- Esplenomegalia volumosa.' },

  // ESTEATOSE HEPÁTICA
  { id: 'as45', maskId: 'm2', category: 'ESTEATOSE HEPÁTICA', title: 'Leve', text: 'Fígado de morfologia, contornos e dimensões normais, apresentando leve aumento difuso da ecogenicidade.\n- Sinais de leve infiltração gordurosa hepática.' },
  { id: 'as46', maskId: 'm2', category: 'ESTEATOSE HEPÁTICA', title: 'Moderada/Acentuada', text: 'Fígado de morfologia, contornos e dimensões normais, apresentando moderado/acentuado aumento difuso da ecogenicidade com atenuação do feixe acústico posterior, o que dificulta a identificação de eventuais alterações parenquimatosas focais.\n- Sinais de moderada/acentuada infiltração gordurosa hepática.' },
  { id: 'as47', maskId: 'm2', category: 'ESTEATOSE HEPÁTICA', title: 'Com área de preservação', text: 'Fígado de morfologia, contornos e dimensões normais, apresentando leve aumento difuso de sua ecogenicidade com área hipoecogênica, mal definida, no segmento hepático IVb/V, medindo cerca de cm, sugerindo área de preservação.\n- Sinais de leve infiltração gordurosa hepática.' },
  { id: 'as48', maskId: 'm2', category: 'ESTEATOSE HEPÁTICA', title: 'Com hepatomegalia', text: 'Fígado de morfologia e contornos normais, com dimensões aumentadas, medindo o lobo esquerdo: cm (normal < 10,0 cm) e o lobo direito: cm (normal < 15,0 cm), apresentando moderado aumento difuso da ecogenicidade.\n- Sinais de moderada infiltração gordurosa hepática com hepatomegalia.\nNota: A alteração hepática descrita reduz a sensibilidade na detecção de lesões focais pelo método ecográfico.' },

  // HEMANGIOMA ESPLÊNICO
  { id: 'as49', maskId: 'm2', category: 'HEMANGIOMA ESPLÊNICO', title: 'Hemangioma Esplênico', text: 'Nota-se imagem nodular, sólida, no terço superior/médio/inferior esplênico, de contornos bem definidos e lobulados, conteúdo hiperecogênico e homogêneo, desprovido de sombra acústica posterior, sem fluxo ao Doppler, medindo cm.\n- Nódulo esplênico sugestivo de hemangioma.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // HEMANGIOMA HEPÁTICO
  { id: 'as50', maskId: 'm2', category: 'HEMANGIOMA HEPÁTICO', title: 'Hemangioma Hepático', text: 'Nota-se imagem nodular, sólida, de contornos bem definidos e lobulados, conteúdo hiperecogênico e homogêneo, desprovido de sombra acústica posterior, sem fluxo ao Doppler, no segmento hepático *, medindo cm.\n- Nódulo hepático sugestivo de hemangioma.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // HEPATITE AGUDA
  { id: 'as51', maskId: 'm2', category: 'HEPATITE AGUDA', title: 'Hepatite Aguda', text: 'Parênquima hepático apresentando leve aumento da refringência peri-portal difusamente.\n- Alteração parenquimatosa hepática. Considerar possibilidade de hepatite aguda.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // HEPATOMEGALIA HOMOGÊNEA
  { id: 'as52', maskId: 'm2', category: 'HEPATOMEGALIA HOMOGÊNEA', title: 'Hepatomegalia Leve', text: 'Fígado de morfologia e contornos normais com dimensões aumentadas, medindo o lobo esquerdo: cm longitudinal (normal < 10,0 cm) e o lobo direito: cm longitudinal (normal < 15,0 cm).\n- Sinais de hepatomegalia homogênea leve.' },

  // HEPATOPATIA CRÔNICA
  { id: 'as53', maskId: 'm2', category: 'HEPATOPATIA CRÔNICA', title: 'Sinais de Hepatopatia Crônica', text: 'Fígado de contornos lobulados, bordas rombas, com lobo direito de dimensões reduzidas e lobo caudado aumentado e globoso, associado a espessamento dos ligamentos hepáticos e ecotextura parenquimatosa difusamente grosseira e heterogênea. Relação dos diâmetros transversos: lobo caudado/lobo direito = * (normal < 0,65).\nVeia porta de trajeto e calibre normais, medindo * cm (normal < 1,3 cm), com fluxo hepatopetal.\n- Sinais de hepatopatia crônica.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // HEPATOPATIA CRÔNICA COM HIPERTENSÃO PORTAL
  { id: 'as54', maskId: 'm2', category: 'HEPATOPATIA CRÔNICA COM HIPERTENSÃO PORTAL', title: 'Com Hipertensão Portal', text: 'Fígado de contornos lobulados, bordas rombas, com lobo direito de dimensões reduzidas e lobo caudado aumentado e globoso, associado a espessamento dos ligamentos hepáticos e ecotextura parenquimatosa difusamente grosseira e heterogênea. Relação dos diâmetros transversos: lobo caudado/lobo direito = * (normal < 0,65).\nVeia porta de trajeto habitual apresentando calibre aumentado, medindo * cm (normal < 1,3 cm), com fluxo hepatofugal.\nDilatação e tortuosidade de vasos peri-esofágicos, peri-gástricos, peri-hepáticos e peri-esplênicos, medindo até cm.\n- Sinais de hepatopatia crônica com hipertensão portal.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // HEPATOPATIA CRÔNICA / MÚLTIPLOS NÓDULOS
  { id: 'as55', maskId: 'm2', category: 'HEPATOPATIA CRÔNICA / MÚLTIPLOS NÓDULOS', title: 'Com Múltiplos Nódulos', text: 'Fígado apresentando contornos lobulados, bordas rombas, com lobo caudado de dimensões aumentadas e globoso, associado a espessamento dos ligamentos hepáticos. Parênquima de ecotextura grosseiramente heterogênea com múltiplos nódulos sólidos, esparsos, hipoecogênicos, de contornos parcialmente obscurecidos, medindo até cm no segmento *.\nLobo esquerdo mede: mm (normal < 10,0 cm) e o lobo direito: cm (normal < 15,0 cm).\n- Hepatopatia parenquimatosa crônica com múltiplos nódulos hepáticos.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // HEPATOPATIA: FIBROSE PERI-PORTAL (ESQUISTOSSOMOSE)
  { id: 'as56', maskId: 'm2', category: 'HEPATOPATIA: FIBROSE PERI-PORTAL (ESQUISTOSSOMOSE)', title: 'Esquistossomose', text: 'Fígado de contornos discretamente lobulados e dimensões reduzidas, associado a espessamento dos ligamentos hepáticos e parênquima com aumento da refringência peri-portal difusamente.\n- Hepatopatia parenquimatosa com sinais sugestivos de fibrose peri-portal. Considerar possibilidade de esquistossomose.\nObs.: Os achados dependem da adequada correlação clínico/complementar.' },

  // INTUSSUSCEPÇÃO
  { id: 'as57', maskId: 'm2', category: 'INTUSSUSCEPÇÃO', title: 'Sinais de Intussuscepção', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região abdominal, evidenciou:\n- Imagem em aspecto de "casca de cebola", na topografia de flanco direito e mesogástrio, medindo * cm transversal x cerca de * cm longitudinal, com camada externa de * cm de espessura, sem líquido livre no interior da invaginação.\n- Imagem de "lesão em alvo", correspondendo à cabeça da invaginação no mesogástrio, sem caracterização de causa secundária pelo método ecográfico.\n- Sinais sugestivos de intussuscepção intestinal.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'as58', maskId: 'm2', category: 'INTUSSUSCEPÇÃO', title: 'Intussuscepção Ausente', text: 'Estudo ultrassonográfico complementar com sonda linear de 10MHz, dirigido em região abdominal, não evidenciou imagem sugestiva de intussuscepção intestinal. Ecogenicidade da gordura mesentérica e peristalse de alças intestinais preservados.' },

  // KLATSKIN
  { id: 'as59', maskId: 'm2', category: 'KLATSKIN', title: 'Tumor de Klatskin', text: 'Vias biliares intra-hepáticas dilatadas, medindo até * cm à esquerda e * cm à direita (normal < 0,25 cm) com aparente amputação ao nível da placa hilar.\n- Dilatação das vias biliares intra-hepáticas com sinais de amputação ao nível da placa hilar. Considerar possibilidade de Tumor de Klatskin. Conveniente prosseguir investigação diagnóstica.' },

  // LINFONODOMEGALIA
  { id: 'as60', maskId: 'm2', category: 'LINFONODOMEGALIA', title: 'Linfonodomegalias', text: 'Linfonodomegalias * de contornos bem definidos, hiperecogênicas, com perda da relação córtico-hilar, algumas confluentes, sem sinais de degeneração cístico-necrótica, medindo até * cm na cadeia *.\n- Linfonodomegalias. Considerar possibilidade de doença linfoproliferativa.' },

  // LÍQUIDO INTRACAVITÁRIO
  { id: 'as61', maskId: 'm2', category: 'LÍQUIDO INTRACAVITÁRIO', title: 'Ascite Acentuada', text: 'Acentuada quantidade de líquido livre intraperitoneal com aspecto anecóide homogêneo, se estendendo do fundo de saco posterior e goteiras parietocólicas até espaços hepato e espleno-renais.\n- Ascite acentuada.' },
  { id: 'as62', maskId: 'm2', category: 'LÍQUIDO INTRACAVITÁRIO', title: 'Líquido com Debris (Sangue)', text: 'Moderada quantidade de líquido livre intraperitoneal com aspecto anecóide com leves/moderados debris, se estendendo do fundo de saco posterior e goteiras parietocólicas até espaços hepato e espleno-renais.\n- Moderada quantidade de líquido intracavitário, sugerindo sangue/coágulos.' },

  // MASSA HEPÁTICA
  { id: 'as63', maskId: 'm2', category: 'MASSA HEPÁTICA', title: 'Massa Sólida', text: 'Fígado de contorno inferior lobulado e dimensões aumentadas às custas de volumosa massa, sólida, de contornos irregulares, conteúdo heterogêneo, com calcificações de permeio, fluxo central e periférico ao Doppler, ocupando os segmentos hepáticos *, medindo cerca de * cm.\nPlaca hilar e ramos portais principais poupados.\n- Massa hepática. Conveniente complementar com TC.' },

  // NÓDULOS HEPÁTICOS SECUNDÁRIOS
  { id: 'as64', maskId: 'm2', category: 'NÓDULOS HEPÁTICOS SECUNDÁRIOS', title: 'Nódulos Secundários', text: 'Parênquima hepático homogêneo, com ecotextura e ecogenicidade normais, exceto por imagens nodulares, sólidas, de contornos bem definidos e lobulados, conteúdo hipoecogênico, com halo, caracterizados assim:\n- segmento , medindo * cm.\n- segmento , medindo * cm.\n- Nódulos hepáticos. Considerar possibilidade de acometimento secundário.' },

  // PANCREATITE AGUDA
  { id: 'as65', maskId: 'm2', category: 'PANCREATITE AGUDA', title: 'Pancreatite Aguda', text: 'Pâncreas de contornos irregulares e parcialmente obscurecidos, com hipoecogenicidade textural e dimensões aumentadas, medindo a cabeça: * cm (normal < 3,3 cm), corpo: * cm (normal < 2,2 cm) e cauda: * cm (normal < 2,8 cm).\nDucto de Wirsung de calibre preservado.\n- Alteração parenquimatosa pancreática. Considerar possibilidade de pancreatite aguda.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // PANCREATOPATIA CRÔNICA
  { id: 'as66', maskId: 'm2', category: 'PANCREATOPATIA CRÔNICA', title: 'Pancreatite Crônica', text: 'Pâncreas de dimensões normais, com contornos lobulados e focos irregulares de calcificações, medindo até cm, nas regiões da cabeça e corpo.\nDucto de Wirsung ectasiado, com calibre de cm de aspecto levemente tortuoso.\n- Sinais de pancreatopatia crônica.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },

  // PÂNCREAS GORDUROSO
  { id: 'as67', maskId: 'm2', category: 'PÂNCREAS GORDUROSO', title: 'Infiltração Gordurosa', text: 'Pâncreas de morfologia, contornos e dimensões normais, com aumento difuso de sua ecogenicidade.\n- Sinais de infiltração gordurosa pancreática.' },

  // PÓLIPO VESICULAR
  { id: 'as68', maskId: 'm2', category: 'PÓLIPO VESICULAR', title: 'Pólipo Vesicular', text: 'Vesícula biliar normodistendida e com paredes finas apresentando na região fúndica imagem nodular, sólida, hiperecogênica, de aspecto polipóide, com contornos regulares, imóvel à mudança de decúbito, medindo cm.\nConteúdo vesicular anecóide e não apresentando cálculos.\n- Imagem nodular intra-vesicular. Considerar possibilidade de pólipo vesicular.' },

  // TROMBOSE PORTAL
  { id: 'as69', maskId: 'm2', category: 'TROMBOSE PORTAL', title: 'Trombose Portal', text: 'Veia porta de calibre aumentado, medindo cm (normal < 1,3 cm), apresentando em seu interior material hipoecogênico, aderido à parede do vaso, no segmento extra-hepático se estendendo até o segmento portal intra-hepático direito/esquerdo. Ausência de fluxo vascular ao Doppler.\nVeia esplênica pérvia, de calibre aumentado, medindo cm (normal < 0,9 cm).\nArtéria hepática pérvia, de paredes finas e lisas, com calibre aumentado, medindo cm ao nível do hilo hepático. Fluxo de direção aorto-hepático com velocidade aumentada de cm/s (normal: 30-60 cm/s).\n- Sinais de trombose portal.' },

  // TUMOR DE CABEÇA DE PÂNCREAS
  { id: 'as70', maskId: 'm2', category: 'TUMOR DE CABEÇA DE PÂNCREAS', title: 'Massa Cefálica', text: 'Vias biliares intra-hepáticas de calibres aumentados, medindo * cm à esquerda e * cm à direita (normal < 0,25 cm).\nHepatocolédoco de calibre aumentado, medindo * cm, apresentando a cerca de cm da porta hepatis, afilamento gradual, em "bico de pássaro", à medida que se relaciona com uma massa sólida na topografia da cabeça pancreática, de contornos regulares e parcialmente obscurecidos, heterogênea, com fluxo periférico ao Doppler, medindo cm.\nCauda pancreática não visibilizada devido à sobreposição gasosa.\nDucto de Wirsung de calibre aumentado, medindo * cm (normal < 0,2 cm).\nVesícula biliar hiperdistendida, medindo cm, com paredes finas e lisas.\nConteúdo vesicular anecóide e não apresentando cálculos.\nSinal de Murphy ultrassonográfico negativo.\n- Massa sólida na topografia da cabeça pancreática com dilatação de vias biliares intra e extra-hepáticas.' },

  // GINECOLOGIA (m3)
  { id: 'gin1', maskId: 'm3', category: 'GINECOLOGIA', title: 'ABORTAMENTO EM CURSO', text: 'Saco gestacional na cavidade uterina, deslocado, em topografia ístmica, de contornos irregulares, medindo cm (diâmetro médio cm).\nNota-se imagem laminar, hipoecogênica, de contornos irregulares, sem fluxo ao Doppler, adjacente à parede inferior do saco gestacional, ocupando cerca de 40% do mesmo, sugerindo hematoma retrocoriônico.\nImagem ecogênica no interior do saco gestacional, medindo cm no maior eixo, sugerindo eco embrionário.\nMovimentos embrionários e batimentos cardíacos ausentes.\nVesícula vitelina não caracterizada.\n- Sinais de abortamento em curso.' },
  { id: 'gin2', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTO OVARIANO', text: 'Ovário direito/esquerdo em topografia, morfologia, contornos e ecotextura normais, apresentando em seu interior imagem cística, de paredes finas e regulares, conteúdo anecóide homogêneo, medindo cm.\nMedidas ovarianas: cm (volume: cm³).\n- Cisto ovariano à direita/esquerda.\nNota: Considerar possibilidade de torção ovariana. Correlacionar clínico-laboratorialmente.' },
  { id: 'gin3', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTOS OVARIANOS', text: 'Ovário direito/esquerdo em topografia, morfologia, contornos e ecotextura normais, apresentando em seu interior imagens císticas, de paredes finas e regulares, conteúdo anecóide homogêneo, medindo até cm.\nMedidas ovarianas: cm (volume: cm³).\n- Cistos ovarianos à direita/esquerda.' },
  { id: 'gin4', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTO FUNCIONAL OVARIANO', text: 'Ovário direito/esquerdo em topografia, morfologia, contornos e ecotextura normais, apresentando em seu interior imagem cística anecóide, de paredes finas e lisas, medindo cm, sugerindo cisto funcional folicular.\nMedidas ovarianas: cm (volume: cm³).' },
  { id: 'gin5', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTOS FUNCIONAIS OVARIANOS', text: 'Ovário direito/esquerdo em topografia, morfologia, contornos e ecotextura normais, apresentando algumas imagens císticas anecóides, de paredes finas e lisas, medindo até cm, sugerindo cistos funcionais.' },
  { id: 'gin6', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTO HEMORRÁGICO OVARIANO', text: 'Ovário direito/esquerdo em topografia habitual, com ecotextura heterogênea, à custa de imagem cística, com paredes espessas, conteúdo com moderados debris e traves de permeio, sem fluxo ao Doppler, medindo cm (vol = cm³), sugerindo cisto hemorrágico.\nMedidas ovarianas: cm (volume: cm³).\n- Cisto ovariano hemorrágico à direita/esquerda.' },
  { id: 'gin7', maskId: 'm3', category: 'GINECOLOGIA', title: 'CISTO(S) DE NABOTH', text: 'Cisto de Naboth de aspecto habitual no colo uterino, medindo cm.\nCistos de Naboth de aspecto habitual no colo uterino, medindo até cm.' },
  { id: 'gin8', maskId: 'm3', category: 'GINECOLOGIA', title: 'CORPO LÚTEO', text: 'Ovário direito/esquerdo em topografia, morfologia, contornos e ecotextura normais, apresentando em seu interior imagem cística, de paredes espessas e regulares, conteúdo anecóide homogêneo, medindo cm, sugerindo corpo lúteo.\nNota-se imagem sugestiva de corpo lúteo, medindo cm.' },
  { id: 'gin9', maskId: 'm3', category: 'GINECOLOGIA', title: 'DIU', text: 'Cavidade uterina virtual, apresentando em seu interior dispositivo intra-uterino (DIU) distando cm da cavidade fúndica (normal < 0,5 cm) e cm da serosa fúndica (normal < 2,0 cm).\n- DIU normoposicionado.\n- DIU deslocado.' },
  { id: 'gin10', maskId: 'm3', category: 'GINECOLOGIA', title: 'DIPA (DOENÇA INFLAMATÓRIA PÉLVICA)', text: 'Pequena quantidade de líquido livre no fundo de saco posterior e regiões anexiais com aspecto anecóide e homogêneo.\nObserva-se ainda dor à mobilização do transdutor nas regiões anexiais.\n- Pequena quantidade de líquido livre na escavação pélvica. Considerar possibilidade de doença inflamatória pélvica.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'gin11', maskId: 'm3', category: 'GINECOLOGIA', title: 'GESTAÇÃO ECTÓPICA: MASSA', text: 'Nota-se imagem cístico-sólida, na região anexial direita/esquerda, de contornos lobulados, com septos espessos e moderados debris de permeio, sem fluxo ao Doppler, medindo cm (vol = cm³).\nModerada quantidade de líquido livre de aspecto anecóide, com moderados debris e traves de permeio, se estendendo do fundo de saco posterior até espaços hepato e espleno-renais.\n- Moderada quantidade de líquido intraperitoneal, sugerindo sangue/coágulos.\n- Imagem heterogênea na região anexial à direita/esquerda. Considerar possibilidade de gestação ectópica rota.\nNota: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'gin12', maskId: 'm3', category: 'GINECOLOGIA', title: 'GESTAÇÃO ECTÓPICA ROTA OU CISTO HEMORRÁGICO: MASSA', text: 'Nota-se imagem cístico-sólida, na região anexial direita/esquerda, adjacente ao ovário, impossibilitando a precisa distinção pelo método ecográfico, contornos irregulares com septos espessos e moderados debris de permeio, sem fluxo ao Doppler, medindo cm (vol = cm³).\nModerada quantidade de líquido livre de aspecto anecóide, com moderados debris e septações finas de permeio, se estendendo do fundo de saco posterior até espaços hepato e espleno-renais.\n- Moderada quantidade de líquido intraperitoneal, sugerindo sangue/coágulos.\n- Imagem heterogênea anexial à direita/esquerda. Considerar possibilidade de gestação ectópica rota ou cisto hemorrágico roto.\nNota: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'gin13', maskId: 'm3', category: 'GINECOLOGIA', title: 'GESTAÇÃO ECTÓPICA: BCF +', text: 'Nota-se na região anexial direita/esquerda, imagem arredondada, de contornos bem definidos e regulares, medindo cm, com paredes espessas hipoecogênicas e fluxo ao Doppler ocupando cerca de 1/3 da circunferência. Apresenta no interior imagem compatível com saco gestacional ectópico de contornos regulares e medindo cm (diâmetro médio cm), com vesícula vitelina presente, medindo cm e embrião único de comprimento cabeça-nádega (CCN) medindo cm. Movimentos embrionários e batimentos cardíacos presentes (BCF = bpm).\n- Gestação ectópica tubária à direita/esquerda com embrião único e vivo.\n- Idade gestacional de semanas e dia(s) (+/- 5 dias) pelo CCN.' },
  { id: 'gin14', maskId: 'm3', category: 'GINECOLOGIA', title: 'ENDOMÉTRIO: ESPESSAMENTO PÓS-MENOPAUSA', text: 'Endométrio hiperecogênico, homogêneo, medindo cm de espessura.\n- Espessamento endometrial.\n\nEndométrio heterogêneo, predominantemente hiperecogênico, medindo cm de espessura.\n- Espessamento endometrial.\n\nNota: Espessura endometrial de referência:\n- Fase menstrual: 0,1-0,5 cm\n- Fase proliferativa precoce: 0,4-0,7 cm\n- Fase proliferativa tardia: 0,6-1,3 cm\n- Peri-ovulatória: 0,7-1,5 cm\n- Fase secretora precoce: 0,8-1,7 cm\n- Secretora tardia: 0,7-1,4 cm\n- Pós-menopausa (sem TRH): < 0,5 cm\n- Pós-menopausa (com TRH): 0,6-1,0 cm' },
  { id: 'gin15', maskId: 'm3', category: 'GINECOLOGIA', title: 'ENDOMÉTRIO: FASES', text: 'Endométrio homogêneo, centrado e medindo cm de espessura (compatível com fase pós-menopausa).\n\nEndométrio trilaminar, homogêneo, centrado e medindo cm de espessura (compatível com fase proliferativa).\n\nCavidade uterina apresentando fina lâmina líquida, anecóide de cm de espessura com endométrio trilaminar, homogêneo, centrado e medindo cm de espessura (compatível com fase peri-ovulatória).\n\nEndométrio hiperecogênico, homogêneo, centrado e medindo cm de espessura (compatível com fase secretora).\n\nEndométrio levemente heterogêneo, predominantemente hiperecogênico e medindo cm de espessura (compatível com fase menstrual).' },
  { id: 'gin16', maskId: 'm3', category: 'GINECOLOGIA', title: 'ENDOMETRIOSE / ADENOMIOSE', text: 'Miométrio com ecotextura difusamente heterogênea apresentando parede anterior (cm) de espessura maior que a posterior (cm).\n- Miométrio difusamente heterogêneo. Considerar possibilidade de adenomiose.\n\nNota-se entre a bexiga urinária e a parede anterior do útero, algumas imagens nodulares hipoecogênicas, homogêneas, medindo até cm.\n- Imagens nodulares entre a bexiga e o útero. Considerar possibilidade de focos de endometriose.' },
  { id: 'gin17', maskId: 'm3', category: 'GINECOLOGIA', title: 'HEMATOMA RETROCORIÔNICO', text: 'Saco gestacional tópico, de contornos discretamente irregulares e medindo cm (diâmetro médio cm).\nNota-se imagem laminar, hipoecogênica, de contornos irregulares, sem fluxo ao Doppler, adjacente à parede inferior do saco gestacional, ocupando cerca de 40% do mesmo, sugerindo hematoma.\n- Hematoma retrocoriônico.\n\nNota-se imagem heterogênea, predominantemente hiperecogênica, de contornos irregulares, adjacente à parede inferior do saco gestacional, ocupando cerca de 40% do mesmo, se insinuando pelo orifício interno do colo uterino.\n- Hematoma retrocoriônico.' },
  { id: 'gin18', maskId: 'm3', category: 'GINECOLOGIA', title: 'HISTERECTOMIA', text: 'Útero não caracterizado (status pós-operatório).\n- Sinais de histerectomia total.\n\nÚtero caracterizado somente em sua porção do colo com forma, contornos e ecotextura habituais (status pós-operatório).\nMedidas do colo: cm (L x AP x T). Volume: cm³.\n- Sinais de histerectomia parcial.' },
  { id: 'gin19', maskId: 'm3', category: 'GINECOLOGIA', title: 'MALFORMAÇÕES MÜLLERIANAS', text: 'Nota-se na cavidade uterina aparente imagem de septo, hipoecogênica na região fúndica, medindo cm longitudinal x cm de espessura.\n- Aparente septo na região fúndica da cavidade uterina. Considerar possibilidade de útero subseptado.\n\nNota-se na cavidade uterina imagem sugestiva de septo, hipoecogênica, medindo cm longitudinal x cm de espessura.\n- Sinais sugestivos de útero septado.\n\nÚtero em anteversoflexão apresentando duas regiões cornuais, medindo à direita cm (L x AP x T) e à esquerda cm (L x AP x T). Volume uterino de cm³.\nCavidades uterinas virtuais.\nEndométrio homogêneo, centrado e medindo cm de espessura à direita e cm à esquerda.\nColo uterino aparentemente único, medindo cm longitudinal.\n- Sinais sugestivos de útero bicorno.\n\nÚtero em anteversoflexão apresentando duas regiões cornuais, medindo à direita cm (L x AP x T) e à esquerda cm (L x AP x T). Volume uterino de cm³.\nCavidades uterinas virtuais.\nEndométrio homogêneo, centrado e medindo cm de espessura à direita e cm à esquerda.\nColo uterino duplo, medindo cm longitudinal à direita e cm à esquerda.\n- Sinais sugestivos de útero didelfo.' },
  { id: 'gin20', maskId: 'm3', category: 'GINECOLOGIA', title: 'MASSA OVARIANA', text: 'Nota-se volumosa massa sólida, na região anexial direita/esquerda, de contornos lobulados, com conteúdo heterogêneo, predominantemente hiperecogênico, sem calcificações evidentes, medindo cerca de cm (volume estimado: cm³).\nAo Doppler evidenciou-se vasos periféricos e centrais, com diástole positiva e sem incisura. IR= e IP=.\n- Massa pélvica. Considerar possibilidade de neoplasia ovariana dentre as hipóteses diagnósticas.' },
  { id: 'gin21', maskId: 'm3', category: 'GINECOLOGIA', title: 'MICROPOLICÍSTICO', text: 'Ovário direito/esquerdo em topografia e contornos normais, de aspecto globoso com múltiplas pequenas imagens císticas, anecóides, predominantemente periféricas, com diâmetro médio de 0,5 cm.\nMedidas ovarianas: cm (volume: cm³).\n- Ovários de aspecto micropolicístico.' },
  { id: 'gin22', maskId: 'm3', category: 'GINECOLOGIA', title: 'MIOMA', text: 'Miométrio com ecotextura homogênea, exceto por imagem nodular, sólida, de contornos bem definidos e regulares, conteúdo hipoecogênico/heterogêneo, na parede anterior/intramural, medindo cm.\n- Nódulo uterino sugestivo de mioma.' },
  { id: 'gin23', maskId: 'm3', category: 'GINECOLOGIA', title: 'MIOMAS', text: 'Miométrio com ecotextura homogênea/heterogênea apresentando imagens nodulares, sólidas, hipoecogênicas/heterogêneas, de contornos regulares, nas paredes:\n- anterior/intramural, medindo cm.\n- posterior/subseroso, medindo cm.\n- fúndica, com componentes submucoso/subseroso, medindo cm.\n- Nódulos uterinos sugestivos de miomas.' },
  { id: 'gin24', maskId: 'm3', category: 'GINECOLOGIA', title: 'MOLA HIDATIFORME', text: 'Cavidade uterina preenchida por material heterogêneo, predominantemente ecogênico com diminutas áreas císticas de permeio, de aspecto vesicular, sem sinais de componentes ósseos, medindo cm de espessura e volume estimado de cm³.\nPlanos de clivagem aparentemente bem definidos entre a cavidade endometrial e a parede anterior do miométrio.\nParede posterior do miométrio de difícil avaliação ecográfica devido à atenuação dos feixes sonoros posteriores.\n- Material heterogêneo na cavidade uterina. Considerar possibilidade de doença trofoblástica gestacional.\nObs.: Os achados dependem da adequada correlação clínico-laboratorial.' },
  { id: 'gin25', maskId: 'm3', category: 'GINECOLOGIA', title: 'ÓBITO EMBRIONÁRIO (IG > 7 semanas)', text: 'Saco gestacional tópico, de contornos irregulares e medindo cm (diâmetro médio cm), associado a reação decidual heterogênea adjacente.\nVesícula vitelínica não visibilizada.\nEmbrião único com comprimento cabeça-nádega (CCN) medindo cm.\nMovimentos embrionários e batimentos cardíacos ausentes.\nLíquido amniótico em quantidade aumentada.\n- Gestação tópica, com embrião único.\n- Óbito embrionário em idade gestacional de semanas e dia(s) (+/- 1 semana) pelo CCN.' },
  { id: 'gin26', maskId: 'm3', category: 'GINECOLOGIA', title: 'ÓBITO EMBRIONÁRIO BORDERLINE (BCF não detectado)', text: 'Vesícula vitelínica não visibilizada.\nEmbrião único com comprimento cabeça-nádega (CCN) medindo cm.\nMovimentos embrionários e batimentos cardíacos não detectados.\n- Gestação tópica, com embrião único.\n- Idade gestacional de semanas e dia(s) (+/- 1 semana) pelo CCN.\n- Batimentos cardíacos embrionários não detectados.\nNota: Conveniente, à critério clínico, controle ultrassonográfico após 1-2 semanas.' },
  { id: 'gin27', maskId: 'm3', category: 'GINECOLOGIA', title: 'ÓBITO EMBRIONÁRIO: GESTAÇÃO INVIÁVEL (embrião em degeneração)', text: 'Saco gestacional tópico, de contornos regulares e medindo cm (diâmetro médio cm: compatível com idade gestacional de semana e dias).\nLíquido amniótico em quantidade aumentada para a idade gestacional do possível CCN.\nVesícula vitelínica não caracterizada.\nImagem ecogênica no interior do saco gestacional, medindo cm no maior eixo, sugerindo eco embrionário.\nMovimentos embrionários e batimentos cardíacos não detectados.\n- Gestação tópica, com embrião único.\n- Idade gestacional de semanas e dia(s) (+/- 1 semana) pelo possível CCN.\n- Batimentos cardíacos embrionários não detectados. Considerar possibilidade de gestação inviável.' },
  { id: 'gin28', maskId: 'm3', category: 'GINECOLOGIA', title: 'ÓBITO EMBRIONÁRIO: GESTAÇÃO INVIÁVEL (saco deslocado)', text: 'Saco gestacional deslocado na cavidade uterina, na topografia ístmica, de contornos lobulados e medindo cm (diâmetro médio cm).\nVesícula vitelínica não caracterizada.\nImagem ecogênica no interior do saco gestacional, medindo cm no maior eixo, sugerindo eco embrionário em degeneração.\nMovimentos embrionários e batimentos cardíacos não detectados.\n- Gestação inviável.\n- Idade gestacional de semanas e dia(s) (+/- 1 semana) pelo possível CCN.' },
  { id: 'gin29', maskId: 'm3', category: 'GINECOLOGIA', title: 'PÓLIPO ENDOMETRIAL', text: 'Cavidade uterina apresentando imagem nodular hiperecogênica, de aspecto polipóide, em continuidade com a camada basal do endométrio na região fúndica, medindo cm.\n- Pólipo endometrial.\n\nCavidade uterina apresentando imagem nodular, sólida, hiperecogênica, na região fúndica, medindo cm.\nEndométrio trilaminar, centrado e medindo cm de espessura (compatível com a fase proliferativa).\n- Imagem nodular na cavidade uterina. Considerar possibilidade de pólipo endometrial.' },
  { id: 'gin30', maskId: 'm3', category: 'GINECOLOGIA', title: 'PSEUDO-CAVIDADE UTERINA DA CICATRIZ CESARIANA', text: 'Nota-se na cicatriz cirúrgica da região ístmica anterior uterina, área anecóide, cística, de contornos irregulares em comunicação com a cavidade endometrial, medindo mm.\n- Pseudo-cavidade uterina da cicatriz cesariana.\nObs.: A pseudo-cavidade uterina pode ser causa de sangramento tipo spotting. Correlacionar clinicamente.' },
  { id: 'gin31', maskId: 'm3', category: 'GINECOLOGIA', title: 'RESTOS OVULARES', text: 'Cavidade uterina ocupada por material heterogêneo, predominantemente hiperecogênico, sem fluxo ao Doppler, medindo até cm de espessura, podendo corresponder a sangue, coágulos e/ou restos ovulares.\n\nCavidade uterina preenchida por material heterogêneo, sem fluxo ao estudo Doppler, medindo até cm de espessura.\n- Material heterogêneo em moderada quantidade na cavidade uterina. Considerar possibilidade de restos ovulares/coágulos.\nNota: Os achados dependem da adequada correlação clínico-laboratorial.\nRecomendação: Mínima/normal: < 0,5 cm; Pequena: 0,5-1,0 cm; Moderada: 1,0-2,0 cm; Acentuada: > 2,0 cm.' },
  { id: 'gin32', maskId: 'm3', category: 'GINECOLOGIA', title: 'VARIZES PÉLVICAS', text: 'Nota-se dilatação e tortuosidade de vasos pélvicos bilaterais, com calibre de até cm à direita e cm à esquerda.\n- Varizes pélvicas bilaterais.' }
];

// Add same phrases to m1 (Abdome Total)
INITIAL_PHRASES.push(...INITIAL_PHRASES.filter(p => p.maskId === 'm2').map(p => ({ ...p, id: p.id + '_m1', maskId: 'm1' })));
