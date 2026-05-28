export type StepType = 'dialog' | 'chart-highlight' | 'quiz' | 'practice';

export interface Step {
  id: string;
  type: StepType;
  content: string;
  scenarioId?: string; // NOVO: Conecta com academyScenarios
  chartConfig?: any; // Legado para não quebrar outras partes, se houver
  quiz?: {
    question: string;
    options: { id: string; label: string; isCorrect: boolean }[];
    explanationCorrect: string;
    explanationIncorrect: string;
  };
}

export interface Module {
  id: string;
  track: string;
  title: string;
  description: string;
  xpReward: number;
  steps: Step[];
}

// Helper to generate multiple basic modules to reach 50 lessons
const generateModules = (startId: number, count: number, track: string, baseTitle: string): Module[] => {
  const mods: Module[] = [];
  for(let i=0; i<count; i++) {
    mods.push({
      id: `m${startId + i}`,
      track: track,
      title: `${baseTitle} - Parte ${i+1}`,
      description: 'Aprofundando conceitos e prática guiada.',
      xpReward: 50,
      steps: [
        { id: `s1`, type: 'dialog', content: `Bem-vindo à aula ${startId + i}. Nesta lição, vamos consolidar nosso conhecimento de forma simples, como se estivéssemos lendo um livro.` },
        { id: `s2`, type: 'chart-highlight', content: 'Observe este cenário no gráfico. O preço conta uma história.', scenarioId: 'lateral-range' },
        { id: `s3`, type: 'quiz', content: 'Vamos testar seu raciocínio.', scenarioId: 'lateral-range', quiz: { question: 'O que o gráfico está mostrando?', options: [{id:'1', label:'O preço está preso entre teto e chão', isCorrect:true}, {id:'2', label:'O preço vai subir infinitamente', isCorrect:false}], explanationCorrect: 'Exato! É um caixote.', explanationIncorrect: 'Atenção, o preço está batendo e voltando.' } }
      ]
    });
  }
  return mods;
};

export const beginnerModules: Module[] = [
  // ==========================================
  // TRILHA 1 — O BÁSICO (1 a 10)
  // ==========================================
  {
    id: 'm1',
    track: 'TRILHA 1 — Base',
    title: 'O que é um Candle de Alta',
    description: 'Entenda como os compradores dominam o mercado.',
    xpReward: 50,
    steps: [
      { id: 'm1-s1', type: 'dialog', content: 'Pense no mercado como um cabo de guerra. Quando a vela fica verde, significa que o time dos compradores puxou a corda com tanta força que empurrou o preço para cima. É dinheiro fresco entrando.' },
      { id: 'm1-s2', type: 'chart-highlight', content: 'Veja esta vela verde isolada. Quanto maior a parte pintada (o corpo), mais forte foi a porrada dos compradores. Simples assim.', scenarioId: 'single-candle-green' },
      { id: 'm1-s3', type: 'quiz', content: 'Raciocínio lógico rápido:', scenarioId: 'single-candle-green', quiz: { question: 'O que significa uma vela verde enorme no gráfico?', options: [{id:'1',label:'Os compradores entraram rasgando, dominando o período',isCorrect:true}, {id:'2',label:'Os vendedores estão no controle absoluto',isCorrect:false}], explanationCorrect:'Perfeito! Verde = preço subiu = compradores fortes.', explanationIncorrect:'Lembre da regra de ouro: Verde sobe, Vermelho cai.' } }
    ]
  },
  {
    id: 'm2',
    track: 'TRILHA 1 — Base',
    title: 'O que é um Candle de Baixa',
    description: 'Entenda a força dos vendedores e o pânico.',
    xpReward: 50,
    steps: [
      { id: 'm2-s1', type: 'dialog', content: 'Se a vela verde é a euforia, a vermelha é o medo. Quando todo mundo decide vender ao mesmo tempo para botar lucro no bolso, o preço despenca.' },
      { id: 'm2-s2', type: 'chart-highlight', content: 'Observe esta vela vermelha. O preço abriu lá em cima e os vendedores o empurraram até lá embaixo. É a gravidade agindo no gráfico.', scenarioId: 'single-candle-red' },
      { id: 'm2-s3', type: 'quiz', content: 'Raciocínio lógico rápido:', scenarioId: 'single-candle-red', quiz: { question: 'Se aparecer uma sequência de velas vermelhas fortes, qual a mensagem?', options: [{id:'1',label:'Vendedores estão no controle empurrando o preço ladeira abaixo',isCorrect:true}, {id:'2',label:'É um ótimo momento para comprar sem olhar mais nada',isCorrect:false}], explanationCorrect:'Isso aí! O mercado está caindo.', explanationIncorrect:'Tentar segurar faca caindo machuca a mão. O controle é vendedor.' } }
    ]
  },
  {
    id: 'm3',
    track: 'TRILHA 1 — Base',
    title: 'Pavio (A cicatriz do gráfico)',
    description: 'Onde ocorreu a batalha e alguém desistiu.',
    xpReward: 50,
    steps: [
      { id: 'm3-s1', type: 'dialog', content: 'Nem sempre quem começa ganhando termina ganhando. O pavio é a linha fina deixada na vela. Ele conta a história de um ataque que falhou.' },
      { id: 'm3-s2', type: 'chart-highlight', content: 'Veja esse pavio longo para cima. Os compradores tentaram subir o preço até o topo, mas os vendedores deram uma paulada para baixo antes do tempo acabar. Ficou só a marca.', scenarioId: 'wick-rejection' },
      { id: 'm3-s3', type: 'quiz', content: 'Atenção aos sinais:', scenarioId: 'wick-rejection', quiz: { question: 'O que um pavio gigante para cima indica?', options: [{id:'1',label:'Rejeição. O preço tentou subir e tomou um choque dos vendedores.',isCorrect:true}, {id:'2',label:'Continuação forte de alta.',isCorrect:false}], explanationCorrect:'Exato! É um choque de realidade.', explanationIncorrect:'O pavio mostra justamente que o preço NÃO conseguiu ficar lá em cima.' } }
    ]
  },
  {
    id: 'm4',
    track: 'TRILHA 1 — Base',
    title: 'Tendência de Alta',
    description: 'A escada para o lucro.',
    xpReward: 50,
    steps: [
      { id: 'm4-s1', type: 'dialog', content: 'O preço sobe em degraus. Sobe um pouco, descansa (cai um pouquinho), e sobe de novo. Isso é uma tendência de alta saudável.' },
      { id: 'm4-s2', type: 'chart-highlight', content: 'Olhe a escadinha se formando. Cada fundo que o preço faz é mais alto que o anterior. O rio está fluindo para cima.', scenarioId: 'trend-up' },
      { id: 'm4-s3', type: 'quiz', content: 'Siga a correnteza:', scenarioId: 'trend-up', quiz: { question: 'Em uma tendência de alta clara, o que você deve focar em fazer?', options: [{id:'1',label:'Procurar oportunidades de Compra (ir com a maré)',isCorrect:true}, {id:'2',label:'Vender (apostar na queda contra a maré)',isCorrect:false}], explanationCorrect:'Sempre nade a favor da correnteza.', explanationIncorrect:'Nadar contra a maré cansa e afoga. Se está subindo, procure compras.' } }
    ]
  },
  ...generateModules(5, 6, 'TRILHA 1 — Base', 'Fundamentos Gráficos'),

  // ==========================================
  // TRILHA 2 — INDICADORES (11 a 20)
  // ==========================================
  {
    id: 'm11',
    track: 'TRILHA 2 — Indicadores',
    title: 'EMA 200: Seu GPS',
    description: 'A linha mágica que separa a compra da venda.',
    xpReward: 60,
    steps: [
      { id: 'm11-s1', type: 'dialog', content: 'Se você se sentir perdido olhando o gráfico, chame a EMA 200 (linha verde). Ela é a média do preço. Ela é a sua bússola suprema.' },
      { id: 'm11-s2', type: 'chart-highlight', content: 'Regra de ouro: Preço acima da linha verde = território de ALTA. Preço abaixo = território de BAIXA.', scenarioId: 'ema-trend' },
      { id: 'm11-s3', type: 'quiz', content: 'Você não pode errar essa:', scenarioId: 'ema-trend', quiz: { question: 'Se as velas estão dançando ACIMA da EMA 200, você deve:', options: [{id:'1',label:'Procurar compras, pois os compradores dominam a tendência maior',isCorrect:true}, {id:'2',label:'Procurar vendas imediatas',isCorrect:false}], explanationCorrect:'Isso! O GPS mandou ir para o norte.', explanationIncorrect:'Acima da média é compra. Abaixo é venda. Não complique.' } }
    ]
  },
  {
    id: 'm12',
    track: 'TRILHA 2 — Indicadores',
    title: 'RSI e Exaustão',
    description: 'Como saber se o mercado cansou de correr.',
    xpReward: 60,
    steps: [
      { id: 'm12-s1', type: 'dialog', content: 'O RSI é o painel de combustível do mercado. Quando o carro acelera muito, o ponteiro bate no vermelho. O mercado também cansa e precisa abastecer (corrigir).' },
      { id: 'm12-s2', type: 'chart-highlight', content: 'Veja o RSI batendo no teto (acima de 70). Chamamos de "Sobrecomprado". Todo mundo já comprou, não tem mais dinheiro novo para empurrar pra cima.', scenarioId: 'rsi-overbought' },
      { id: 'm12-s3', type: 'quiz', content: 'Fique atento ao tanque de combustível:', scenarioId: 'rsi-overbought', quiz: { question: 'O preço explodiu para cima e o RSI passou de 85. O que você faz?', options: [{id:'1',label:'Não compro nada. O mercado cansou e vai corrigir. Espero.',isCorrect:true}, {id:'2',label:'Compro agora antes que suba mais.',isCorrect:false}], explanationCorrect:'Você tem sangue frio! Comprar no topo é pagar a conta da festa.', explanationIncorrect:'Se você comprar com o tanque vazio, o carro vai parar no meio do nada com você dentro.' } }
    ]
  },
  ...generateModules(13, 8, 'TRILHA 2 — Indicadores', 'Domínio dos Osciladores'),

  // ==========================================
  // TRILHA 3 — ESTRUTURA (21 a 30)
  // ==========================================
  {
    id: 'm21',
    track: 'TRILHA 3 — Estrutura',
    title: 'BOS (Quebrando o Teto)',
    description: 'Quando o mercado mostra que tem força de verdade.',
    xpReward: 80,
    steps: [
      { id: 'm21-s1', type: 'dialog', content: 'Na vida, para construir um andar novo, você tem que quebrar o teto. No gráfico é igual. O teto (topo anterior) é uma barreira. Se os compradores quebrarem o teto com força, temos um BOS (Break of Structure).' },
      { id: 'm21-s2', type: 'chart-highlight', content: 'Olhe a linha do teto sendo esmagada por uma vela verde gigante. Isso é o mercado gritando: "Vou continuar subindo!"', scenarioId: 'bos-up' },
      { id: 'm21-s3', type: 'quiz', content: 'Identifique a força:', scenarioId: 'bos-up', quiz: { question: 'O que o BOS confirma para você?', options: [{id:'1',label:'Que a tendência é forte e tem fôlego para continuar',isCorrect:true}, {id:'2',label:'Que o mercado vai despencar',isCorrect:false}], explanationCorrect:'Exato! Rompeu resistência com vontade, a alta segue viva.', explanationIncorrect:'O teto foi rompido para cima. É força de alta, não de baixa.' } }
    ]
  },
  {
    id: 'm22',
    track: 'TRILHA 3 — Estrutura',
    title: 'A Caça aos Stops (Liquidez)',
    description: 'Entenda como os tubarões roubam o seu dinheiro.',
    xpReward: 80,
    steps: [
      { id: 'm22-s1', type: 'dialog', content: 'Tubarões (bancos e institucionais) precisam de MUITO dinheiro para comprar. E de onde eles tiram? Dos traders iniciantes. Eles derrubam o preço rapidamente abaixo de um suporte onde estão os stops de proteção da galera. Pegam o dinheiro e sobem o mercado.' },
      { id: 'm22-s2', type: 'chart-highlight', content: 'Isso se chama Sweep ou Caça à Liquidez. O preço fura o fundo, dá um susto em todo mundo, aciona os stops, e depois dispara feito um foguete para o lado oposto.', scenarioId: 'liquidity' },
      { id: 'm22-s3', type: 'quiz', content: 'Proteja seu capital:', scenarioId: 'liquidity', quiz: { question: 'O que o Sweep de liquidez mostra?', options: [{id:'1',label:'Uma manipulação rápida dos grandes players para pegar stops antes de ir na direção real',isCorrect:true}, {id:'2',label:'Apenas um movimento normal que não significa nada',isCorrect:false}], explanationCorrect:'Você já está pensando como um tubarão.', explanationIncorrect:'Nunca ignore um Sweep. É a impressão digital dos institucionais.' } }
    ]
  },
  ...generateModules(23, 8, 'TRILHA 3 — Estrutura', 'Análise Institucional'),

  // ==========================================
  // TRILHA 4 — VOLUME (31 a 35)
  // ==========================================
  ...generateModules(31, 5, 'TRILHA 4 — Volume', 'Leitura de Força e Absorção'),

  // ==========================================
  // TRILHA 5 — MENTE (36 a 40)
  // ==========================================
  {
    id: 'm36',
    track: 'TRILHA 5 — Mente',
    title: 'A Armadilha do Falso Rompimento (FOMO)',
    description: 'Como a ansiedade faz você comprar no momento exato do desastre.',
    xpReward: 100,
    steps: [
      { id: 'm36-s1', type: 'dialog', content: 'Você vê o preço ultrapassando a resistência. Fica ansioso, com medo de perder a chance de ficar rico (FOMO), e clica em COMPRAR antes da vela fechar. Aí a vela retrai e você fica preso no topo.' },
      { id: 'm36-s2', type: 'chart-highlight', content: 'Isso é um Fakeout. Um falso rompimento. O preço vai lá em cima, pega os apressados e fecha lá embaixo, deixando um pavio gigantesco de rejeição.', scenarioId: 'fakeout' },
      { id: 'm36-s3', type: 'quiz', content: 'Seja paciente:', scenarioId: 'fakeout', quiz: { question: 'Como se livrar da armadilha do falso rompimento?', options: [{id:'1',label:'Sempre esperar a vela fechar para ver se o CORPO ficou acima da linha',isCorrect:true}, {id:'2',label:'Entrar correndo para não perder o movimento',isCorrect:false}], explanationCorrect:'Paciência é dinheiro. Velas fechadas não mentem.', explanationIncorrect:'Ansiedade destrói contas. Espere o fechamento!' } }
    ]
  },
  ...generateModules(37, 4, 'TRILHA 5 — Mente', 'Psicologia e Disciplina'),

  // ==========================================
  // TRILHA 6 — EXECUÇÃO (41 a 45)
  // ==========================================
  ...generateModules(41, 5, 'TRILHA 6 — Execução', 'Plano de Trade e Timing'),

  // ==========================================
  // TRILHA 7 — SIMULAÇÃO (46 a 50)
  // ==========================================
  ...generateModules(46, 5, 'TRILHA 7 — Simulação', 'Análise e Prática de Mercado')
];
