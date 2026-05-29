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

const dialogVariations = [
  "No mercado financeiro, a lateralização (ou caixote) pode parecer monótona, mas é onde os grandes players acumulam posições secretamente. Esteja sempre atento à compressão do preço. A paciência aqui é de ouro: espere o mercado se decidir antes de você apostar suas fichas.",
  "O gerenciamento de risco é o seu único e verdadeiro escudo. Mesmo que você leia o gráfico perfeitamente, o mercado pode ser irracional a curto prazo. Nunca arrisque mais do que 2% do seu capital por operação. Preserve sua conta para continuar no jogo amanhã.",
  "A leitura pura da ação do preço (Price Action) é a linguagem nativa do mercado. Enquanto indicadores são matematicamente atrasados, o fechamento do preço e o tamanho do corpo da vela dizem exatamente o que os tubarões estão fazendo neste exato milissegundo.",
  "A ansiedade e o FOMO (Fear Of Missing Out - Medo de ficar de fora) são os maiores destruidores de contas iniciantes. Entrar no meio do caminho porque um candle gigante verde está se formando é armadilha. Compre no suporte, venda na resistência.",
  "Zonas de liquidez funcionam como ímãs gigantescos para o preço. O mercado se move caçando os 'Stops' da grande massa de traders varejistas. Entenda onde a maioria colocou seu Stop Loss e você saberá para onde os institucionais empurrarão o preço."
];

const chartVariations = [
  "Observe com atenção os movimentos de expansão e retração. Toda tendência saudável respira. Comprar no esticamento é perigoso, o correto é esperar o preço voltar e respirar numa zona de suporte (Pullback).",
  "Note a interação do preço com zonas críticas. Cada vez que o preço toca uma resistência e deixa um pavio longo, significa que a força compradora tomou um soco da vendedora. Pavios são cicatrizes de batalha.",
  "Veja como o preço respeita as consolidações. Ele bate no teto e cai, bate no chão e sobe. É o famoso 'Range'. Muitos traders quebram tentando operar rompimentos que nunca acontecem. Jogue nas bordas!",
  "Repare na aceleração do movimento quando uma zona importante é rompida de fato. Não há hesitação, os candles fecham cheios, sem deixar pavios longos. Isso é o que chamamos de real intenção institucional.",
  "Olhe para o contexto geral do gráfico. Operar contra a maré (tendência macro) é exaustivo e caro. Se a escada está subindo (topos e fundos ascendentes), não tente prever quando vai cair. Continue comprando os fundos!"
];

const generateModules = (startId: number, count: number, track: string, baseTitle: string): Module[] => {
  const mods: Module[] = [];
  for(let i=0; i<count; i++) {
    const dialogText = dialogVariations[i % dialogVariations.length];
    const chartText = chartVariations[(i + 1) % chartVariations.length];
    
    mods.push({
      id: `m${startId + i}`,
      track: track,
      title: `${baseTitle} - Nível ${i+1}`,
      description: 'Aprofundando a leitura visual e comportamental do gráfico.',
      xpReward: 50,
      steps: [
        { 
          id: `s1`, 
          type: 'dialog', 
          content: `Evolução de aprendizado (Aula ${startId + i}): \n\n${dialogText}\n\nPreste muita atenção na leitura e não tenha pressa. Dominar esse conceito vai te separar dos traders que só perdem dinheiro para o mercado.` 
        },
        { 
          id: `s2`, 
          type: 'chart-highlight', 
          content: chartText, 
          scenarioId: 'lateral-range' 
        },
        { 
          id: `s3`, 
          type: 'quiz', 
          content: 'Hora de aplicar a teoria na prática e testar sua visão de águia:', 
          scenarioId: 'lateral-range', 
          quiz: { 
            question: 'Analisando este cenário padrão de consolidação do preço, como devemos reagir?', 
            options: [
              {id:'1', label:'Operar as extremidades (comprar perto do chão, vender perto do teto)', isCorrect:true}, 
              {id:'2', label:'Tentar comprar no meio do caixote acreditando que vai estourar pro alto', isCorrect:false}
            ], 
            explanationCorrect: 'Mente de Sniper! Exato. Num cenário lateral (caixote), o preço está espremido num corredor. Exemplo prático: é como jogar ping-pong; você só rebate quando a bolinha chega perto de você na extremidade da mesa. Jogar no meio é confusão e perda de dinheiro. Espere os extremos ou um rompimento limpo!', 
            explanationIncorrect: 'Sinal Vermelho! O meio de um mercado lateral é chamado de "liquidificador" porque mói seu dinheiro. Exemplo prático: tentar pegar o movimento no meio do caminho sem uma direção clara é como atravessar uma rodovia movimentada de olhos vendados. Tenha paciência, trader!' 
          } 
        }
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
      { id: 'm1-s3', type: 'quiz', content: 'Raciocínio lógico rápido:', scenarioId: 'single-candle-green', quiz: { question: 'O que significa uma vela verde enorme no gráfico?', options: [{id:'1',label:'Os compradores entraram rasgando, dominando o período',isCorrect:true}, {id:'2',label:'Os vendedores estão no controle absoluto',isCorrect:false}], explanationCorrect:'Perfeito! Verde = preço subiu = compradores fortes. Exemplo prático: pense num leilão onde muita gente quer a mesma obra de arte incrível. O preço dispara porque a demanda é avassaladora! Aqui no gráfico, a vela verde gigante, com um corpo cheio e imponente, é o mercado te gritando que os grandes tubarões entraram comprando pesado. Vá com eles!', explanationIncorrect:'Cuidado, lembre da regra de ouro: Verde sobe, Vermelho cai. Exemplo prático: se o time de compradores entra com muito mais dinheiro na roda de negociações, o preço sobe, formando uma vela verde gigantesca. Lutar contra essa força é como tentar segurar um trem com as próprias mãos. Jamais aposte contra!' } }
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
      { id: 'm2-s3', type: 'quiz', content: 'Raciocínio lógico rápido:', scenarioId: 'single-candle-red', quiz: { question: 'Se aparecer uma sequência de velas vermelhas fortes, qual a mensagem?', options: [{id:'1',label:'Vendedores estão no controle empurrando o preço ladeira abaixo',isCorrect:true}, {id:'2',label:'É um ótimo momento para comprar sem olhar mais nada',isCorrect:false}], explanationCorrect:'Isso aí! O mercado está caindo com fúria. Exemplo prático: quando sai uma notícia péssima de uma empresa (como um rombo financeiro), todos os investidores querem vender suas ações ao mesmo tempo num ataque de pânico e ninguém quer comprar. O preço derrete igual gelo no asfalto quente. Seguir as velas vermelhas grandes te livra de entrar em armadilhas de baixa!', explanationIncorrect:'Tentar segurar faca caindo machuca feio a mão. O controle é 100% vendedor. Exemplo prático: se uma pedra gigante está rolando montanha abaixo na sua direção, você não tenta parar ela com o peito. Você sai da frente! Espere ela bater no fundo do poço (suporte forte) antes de sonhar em fazer alguma compra!' } }
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
      { id: 'm3-s3', type: 'quiz', content: 'Atenção aos sinais:', scenarioId: 'wick-rejection', quiz: { question: 'O que um pavio gigante para cima indica?', options: [{id:'1',label:'Rejeição. O preço tentou subir e tomou um choque dos vendedores.',isCorrect:true}, {id:'2',label:'Continuação forte de alta.',isCorrect:false}], explanationCorrect:'Exato! É um baita choque de realidade no gráfico. Exemplo prático: os compradores tentaram invadir o castelo dos vendedores lá no topo da montanha, chegaram na porta, mas levaram um banho de óleo quente e tiveram que recuar as pressas. O pavio enorme que fica é literalmente o "rastro de sangue" dessa tentativa frustrada. Mostra exaustão e uma chance incrível de reversão!', explanationIncorrect:'O pavio mostra justamente que o preço NÃO conseguiu se manter lá em cima. Exemplo prático: é exatamente como arremessar uma bola de tênis contra uma parede de concreto; ela bate e volta com o dobro da velocidade. O preço foi rejeitado violentamente pelos vendedores. Comprar aí é armadilha pura.' } }
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
      { id: 'm4-s3', type: 'quiz', content: 'Siga a correnteza:', scenarioId: 'trend-up', quiz: { question: 'Em uma tendência de alta clara, o que você deve focar em fazer?', options: [{id:'1',label:'Procurar oportunidades de Compra (ir com a maré)',isCorrect:true}, {id:'2',label:'Vender (apostar na queda contra a maré)',isCorrect:false}], explanationCorrect:'Sempre nade a favor da correnteza, trader! Exemplo prático: se você surfa, você quer pegar a onda gigantesca que está se formando, não remar contra ela de cara feia. Numa tendência de alta declarada (com topos e fundos cada vez mais altos), cada pequena queda é apenas um "descanso do preço" para pegar fôlego e disparar em uma nova pernada de alta. Foco exclusivo em compras nos suportes!', explanationIncorrect:'Nadar contra a maré cansa, esgota a margem e te afoga. Se está subindo bonito, procure compras! Exemplo prático: apostar cegamente na queda durante uma forte tendência de alta é como apostar que um trem-bala sem freio vai parar no meio do nada magicamente. Pare de tentar adivinhar o topo e vá com a força predominante.' } }
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
      { id: 'm11-s3', type: 'quiz', content: 'Você não pode errar essa:', scenarioId: 'ema-trend', quiz: { question: 'Se as velas estão dançando ACIMA da EMA 200, você deve:', options: [{id:'1',label:'Procurar compras, pois os compradores dominam a tendência maior',isCorrect:true}, {id:'2',label:'Procurar vendas imediatas',isCorrect:false}], explanationCorrect:'Isso! O GPS mestre mandou ir firme para o norte. Exemplo prático: a EMA 200 (a famosa média móvel de 200 períodos) atua como a linha do Equador do gráfico. Se o preço vive e respira no "hemisfério norte" (acima dela), é um verão ensolarado para os compradores! O foco do seu plano de trade deve ser 100% em buscar pullbacks (retrações) para oportunidades de compra na tendência.', explanationIncorrect:'A regra é muito clara: acima da média é compra. Abaixo é venda. Não invente moda. Exemplo prático: você não vai sair de casa usando um casaco pesado de neve num calor infernal de 40 graus, certo? Se o preço está deslizando majestosamente acima da EMA 200, estamos no quintal dos compradores. Operar vendido aqui é buscar sarna para se coçar com altíssimo risco de ser liquidado!' } }
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
      { id: 'm12-s3', type: 'quiz', content: 'Fique atento ao tanque de combustível:', scenarioId: 'rsi-overbought', quiz: { question: 'O preço explodiu para cima e o RSI passou de 85. O que você faz?', options: [{id:'1',label:'Não compro nada. O mercado cansou e vai corrigir. Espero.',isCorrect:true}, {id:'2',label:'Compro agora antes que suba mais.',isCorrect:false}], explanationCorrect:'Você tem sangue frio e vai longe! Comprar exatamente no topo é pagar a conta inteira de uma festa que você chegou atrasado. Exemplo prático: imagine que você chegou no final de uma festa incrível de arromba (o RSI explodindo acima de 85); a bebida já acabou, o som abaixou e o dono da casa já quer dormir. Não entre comprando eufórico agora. Aja como um lobo: espere o preço corrigir (descansar), o RSI aliviar a pressão e voltar a um nível atrativo antes de preparar o bote.', explanationIncorrect:'Se você comprar com o tanque completamente vazio e o motor superaquecido, o carro vai fundir e parar no meio da estrada deserta com você dentro. Exemplo prático: um velocista olímpico que acabou de dar um sprint insano de 100m rasos não consegue dar outro tiro de mais 100m no mesmo ritmo imediatamente. Ele vai despencar. O mercado também é assim, ele respira e corrige. Não pague o pato pela euforia!' } }
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
      { id: 'm21-s3', type: 'quiz', content: 'Identifique a força:', scenarioId: 'bos-up', quiz: { question: 'O que o BOS confirma para você?', options: [{id:'1',label:'Que a tendência é forte e tem fôlego para continuar',isCorrect:true}, {id:'2',label:'Que o mercado vai despencar',isCorrect:false}], explanationCorrect:'Na mosca! Rompeu a barreira com vontade extrema, a tendência segue vivíssima e mandando no pedaço. Exemplo prático: imagine um lutador de boxe em ascensão que finalmente consegue nocautear seu maior e mais difícil rival (a zona de resistência histórica). Agora o caminho está escancarado e livre para ele subir pro topo do ranking mundial. Um BOS (Quebra de Estrutura) confirmado com uma vela direcional e cheia indica agressão pura dos compradores e forte continuação do movimento de alta. Embarque junto!', explanationIncorrect:'Erro crítico! O teto foi destruído para cima. Isso é demonstração de poder de alta, jamais de baixa. Exemplo prático: se uma represa gigantesca de concreto arrebenta de repente liberando toda água, o fluxo intenso vai inundar e rasgar tudo que tiver pela frente naquela direção específica. Tentar vender apostando contra um rompimento estrutural verdadeiro e validado é suicídio de banca. Acompanhe a força!' } }
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
      { id: 'm22-s3', type: 'quiz', content: 'Proteja seu capital:', scenarioId: 'liquidity', quiz: { question: 'O que o Sweep de liquidez mostra?', options: [{id:'1',label:'Uma manipulação rápida dos grandes players para pegar stops antes de ir na direção real',isCorrect:true}, {id:'2',label:'Apenas um movimento normal que não significa nada',isCorrect:false}], explanationCorrect:'Sensacional! Você já está pensando friamente como um grande tubarão financeiro. Exemplo prático: grandes instituições bilionárias precisam "enganar" as sardinhas (os peixes pequenos e eufóricos) para conseguirem o montante imenso de liquidez que precisam para entrar no mercado. O que eles fazem? Um falso mergulho rápido que espeta abaixo de um suporte vital, acionando todos os "stops de venda" de quem estava posicionado (assim eles compram absurdamente barato o que as sardinhas vendem no desespero) e logo em seguida disparam o preço feito um foguete espacial pra lua. Sacar essa malícia te põe na mesa com eles.', explanationIncorrect:'Atenção redobrada: Nunca ouse ignorar um Sweep. Essa é a impressão digital escancarada dos tubarões institucionais agindo no escuro. Exemplo prático: esse falso rompimento malicioso num fundo forte é uma clássica armadilha para urso (bear trap). Eles querem que você olhe e pense no desespero "Meu Deus, vai cair a zero!" e venda sua posição no fundo. Aí eles tomam todo seu dinheiro como bala e sobem com violência quando você estiver de fora. Fique esperto!' } }
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
      { id: 'm36-s3', type: 'quiz', content: 'Seja paciente:', scenarioId: 'fakeout', quiz: { question: 'Como se livrar da armadilha do falso rompimento?', options: [{id:'1',label:'Sempre esperar a vela fechar para ver se o CORPO ficou acima da linha',isCorrect:true}, {id:'2',label:'Entrar correndo para não perder o movimento',isCorrect:false}], explanationCorrect:'Perfeito! A paciência é a moeda mais cara no trade. Velas fechadas não mentem jamais. Exemplo prático: você jamais seria louco de assinar um contrato milionário sem ler meticulosamente até a última vírgula da página, certo? No gráfico, isso traduz em nunca agir no desespero, mas sim esperar religiosamente a contagem regressiva e o fechamento do tempo gráfico daquele candle. Se ele parecia estar rompendo com tudo, mas de repente recuou e deixou só um fio de pavio quilométrico no topo... Era uma emboscada letal (Fakeout). Seu dinheiro ficou seguro porque você teve disciplina de aço e esperou!', explanationIncorrect:'Esse é o atalho rápido pra zerar a conta. A ansiedade destrói até as melhores estratégias. Espere sempre o santo fechamento da vela! Exemplo prático: comprar antecipadamente um rompimento com o candle em movimento (aberto) é exatamente o mesmo que um time de futebol começar a comemorar o gol antes da bola cruzar a rede; o Fakeout é o juiz do VAR que volta a jogada de forma implacável e anula seu golaço nos acréscimos, te deixando de mãos vazias no topo do movimento. Calma!' } }
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
