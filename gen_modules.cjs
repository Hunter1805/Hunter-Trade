const fs = require('fs');
const path = require('path');

const content = `export type StepType = 'dialog' | 'chart-highlight' | 'quiz' | 'practice';

export interface Step {
  id: string;
  type: StepType;
  content: string;
  chartConfig?: {
    showEMA200?: boolean;
    highlightTrend?: 'up' | 'down' | 'lateral';
    showBOS?: boolean;
    showRSI?: boolean;
    highlightRSI?: 'overbought' | 'oversold' | 'neutral';
    highlightCandles?: 'impulsive' | 'weak';
    simulateAction?: boolean; 
    drawArrows?: { xIndex: number, direction: 'up' | 'down' }[];
    paintRegion?: { startIndex: number, endIndex: number, color: 'green' | 'red' | 'blue' };
  };
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

export const beginnerModules: Module[] = [
  // ==========================================
  // TRILHA 1 — O BÁSICO
  // ==========================================
  {
    id: 'm1',
    track: 'TRILHA 1 — O Básico',
    title: 'O que é um candle',
    description: 'Entenda os bloquinhos que formam o gráfico.',
    xpReward: 50,
    steps: [
      { id: 'm1-s1', type: 'dialog', content: 'Olá! O gráfico parece um monte de barras coloridas, certo? Cada uma se chama Candle (vela).' },
      { id: 'm1-s2', type: 'chart-highlight', content: 'Se a vela é verde, os compradores estão mais fortes e o preço subiu.', chartConfig: { highlightCandles: 'impulsive' } },
      { id: 'm1-s3', type: 'quiz', content: 'Você viu uma vela verde subir com força.', quiz: { question: 'Quem está dominando?', options: [{ id:'o1', label:'Compradores', isCorrect:true }, { id:'o2', label:'Vendedores', isCorrect:false }], explanationCorrect: 'Exato!', explanationIncorrect: 'A cor verde sempre mostra a força compradora no período.' } }
    ]
  },
  {
    id: 'm2',
    track: 'TRILHA 1 — O Básico',
    title: 'Como o preço sobe',
    description: 'Entenda os impulsos de alta.',
    xpReward: 50,
    steps: [
      { id: 'm2-s1', type: 'dialog', content: 'O preço não sobe sozinho. Ele precisa de pessoas comprando ao mesmo tempo.' },
      { id: 'm2-s2', type: 'chart-highlight', content: 'Veja esse movimento. Ele sobe em degraus.', chartConfig: { highlightTrend: 'up' } }
    ]
  },
  {
    id: 'm3',
    track: 'TRILHA 1 — O Básico',
    title: 'Como o preço cai',
    description: 'Os temidos movimentos de baixa.',
    xpReward: 50,
    steps: [
      { id: 'm3-s1', type: 'dialog', content: 'Da mesma forma, quando há pânico ou lucro, o pessoal vende.' },
      { id: 'm3-s2', type: 'chart-highlight', content: 'As velas vermelhas mostram a força vendedora. É a ladeira abaixo.', chartConfig: { highlightTrend: 'down' } }
    ]
  },
  {
    id: 'm4',
    track: 'TRILHA 1 — O Básico',
    title: 'O que é pavio',
    description: 'A trilha invisível deixada para trás.',
    xpReward: 50,
    steps: [
      { id: 'm4-s1', type: 'chart-highlight', content: 'Repare na linhazinha fina saindo da vela. Chamamos de "pavio".', chartConfig: { highlightCandles: 'weak' } },
      { id: 'm4-s2', type: 'quiz', content: 'O pavio é a rejeição.', quiz: { question: 'Um pavio grande em cima significa:', options: [{ id:'o1', label:'O preço vai subir', isCorrect:false }, { id:'o2', label:'O preço subiu mas foi empurrado para baixo', isCorrect:true }], explanationCorrect: 'Isso! Os vendedores não deixaram ele ficar lá no alto.', explanationIncorrect: 'Preste atenção, o pavio mostra onde ele NÃO aguentou ficar.' } }
    ]
  },
  {
    id: 'm5',
    track: 'TRILHA 1 — O Básico',
    title: 'O que é volatilidade',
    description: 'A velocidade dos movimentos.',
    xpReward: 50,
    steps: [
      { id: 'm5-s1', type: 'dialog', content: 'Se as velas estão gigantes e o gráfico pula loucamente, isso é volatilidade. O mercado está agitado.' }
    ]
  },
  {
    id: 'm6',
    track: 'TRILHA 1 — O Básico',
    title: 'Tendência',
    description: 'A onda do momento.',
    xpReward: 50,
    steps: [
      { id: 'm6-s1', type: 'dialog', content: 'Nunca lute contra o mercado. Operar a favor da onda é muito mais seguro.' },
      { id: 'm6-s2', type: 'chart-highlight', content: 'Isso é uma tendência.', chartConfig: { highlightTrend: 'up' } }
    ]
  },
  {
    id: 'm7',
    track: 'TRILHA 1 — O Básico',
    title: 'Topos e Fundos',
    description: 'Os picos e vales.',
    xpReward: 50,
    steps: [
      { id: 'm7-s1', type: 'dialog', content: 'O preço sobe e respira. Isso forma os topos (picos) e fundos (vales).' },
      { id: 'm7-s2', type: 'quiz', content: 'Na tendência de alta...', quiz: { question: 'Como são os topos?', options: [{id:'1', label:'Sempre iguais', isCorrect:false}, {id:'2', label:'Cada vez mais altos', isCorrect:true}], explanationCorrect:'Isso mesmo, é uma escada subindo!', explanationIncorrect:'Em tendência de alta, a escada precisa continuar subindo.' } }
    ]
  },

  // ==========================================
  // TRILHA 2 — INDICADORES
  // ==========================================
  {
    id: 'm8',
    track: 'TRILHA 2 — Indicadores',
    title: 'RSI Básico',
    description: 'O batimento cardíaco do mercado.',
    xpReward: 60,
    steps: [
      { id: 'm8-s1', type: 'dialog', content: 'O RSI mede a força. Se ele vai subindo, os compradores têm energia.', chartConfig: { showRSI: true } }
    ]
  },
  {
    id: 'm9',
    track: 'TRILHA 2 — Indicadores',
    title: 'RSI Extremo',
    description: 'Quando o mercado corre demais.',
    xpReward: 60,
    steps: [
      { id: 'm9-s1', type: 'chart-highlight', content: 'RSI passando de 70? O mercado está sobrecomprado. Cansado. Se chegar abaixo de 30, está sobrevendido.', chartConfig: { showRSI: true, highlightRSI: 'overbought' } },
      { id: 'm9-s2', type: 'quiz', content: 'Teste prático:', quiz: { question: 'Você compraria com RSI em 85?', options:[{id:'1',label:'Não, está esticado',isCorrect:true}, {id:'2',label:'Sim',isCorrect:false}], explanationCorrect:'Você é inteligente!', explanationIncorrect:'É muito arriscado. O preço logo vai precisar respirar.' } }
    ]
  },
  {
    id: 'm10',
    track: 'TRILHA 2 — Indicadores',
    title: 'EMA 9',
    description: 'A média rápida.',
    xpReward: 60,
    steps: [
      { id: 'm10-s1', type: 'dialog', content: 'A EMA 9 é grudada no preço. Ela mostra a força imediata do momento.' }
    ]
  },
  {
    id: 'm11',
    track: 'TRILHA 2 — Indicadores',
    title: 'EMA 21',
    description: 'A média moderada.',
    xpReward: 60,
    steps: [
      { id: 'm11-s1', type: 'dialog', content: 'A EMA 21 nos ajuda a ver pequenos recuos (pullbacks).' }
    ]
  },
  {
    id: 'm12',
    track: 'TRILHA 2 — Indicadores',
    title: 'EMA 200',
    description: 'A bússola mestre.',
    xpReward: 60,
    steps: [
      { id: 'm12-s1', type: 'chart-highlight', content: 'A linha verde é a EMA200. Preço acima dela: Alta. Abaixo dela: Baixa. Simples assim.', chartConfig: { showEMA200: true } }
    ]
  },
  {
    id: 'm13',
    track: 'TRILHA 2 — Indicadores',
    title: 'Volume',
    description: 'A gasolina do preço.',
    xpReward: 60,
    steps: [
      { id: 'm13-s1', type: 'dialog', content: 'Vela grande e muito volume? Movimento real. Vela grande com volume zero? Falso rompimento.' }
    ]
  },
  {
    id: 'm14',
    track: 'TRILHA 2 — Indicadores',
    title: 'Volume forte',
    description: 'Sinal de dinheiro grande.',
    xpReward: 60,
    steps: [
      { id: 'm14-s1', type: 'chart-highlight', content: 'O volume valida tudo que vemos nas velas.', chartConfig: { highlightCandles: 'impulsive' } }
    ]
  },

  // ==========================================
  // TRILHA 3 — ESTRUTURA
  // ==========================================
  {
    id: 'm15',
    track: 'TRILHA 3 — Estrutura',
    title: 'BOS',
    description: 'Break of Structure.',
    xpReward: 80,
    steps: [
      { id: 'm15-s1', type: 'chart-highlight', content: 'O preço rompeu um topo e confirmou a tendência. Isso é um BOS.', chartConfig: { showBOS: true } }
    ]
  },
  {
    id: 'm16',
    track: 'TRILHA 3 — Estrutura',
    title: 'CHoCH',
    description: 'Mudança de rota.',
    xpReward: 80,
    steps: [
      { id: 'm16-s1', type: 'dialog', content: 'Se ele vinha subindo, mas quebra o fundo anterior... temos um aviso de reversão (CHoCH).' }
    ]
  },
  {
    id: 'm17',
    track: 'TRILHA 3 — Estrutura',
    title: 'Liquidez',
    description: 'Onde está o dinheiro.',
    xpReward: 80,
    steps: [
      { id: 'm17-s1', type: 'dialog', content: 'Atrás de cada fundo ou topo, as pessoas deixam seus "Stop Loss". O mercado vai atrás disso.' }
    ]
  },
  {
    id: 'm18',
    track: 'TRILHA 3 — Estrutura',
    title: 'Sweep',
    description: 'Caça à liquidez.',
    xpReward: 80,
    steps: [
      { id: 'm18-s1', type: 'dialog', content: 'Eles passam da linha, pegam o dinheiro e voltam correndo. Isso cria os pavios longos.' }
    ]
  },
  {
    id: 'm19',
    track: 'TRILHA 3 — Estrutura',
    title: 'Range',
    description: 'O mercado caixote.',
    xpReward: 80,
    steps: [
      { id: 'm19-s1', type: 'chart-highlight', content: 'Quando o preço não vai pra lugar nenhum, ele fica preso em um range. Cuidado.', chartConfig: { highlightTrend: 'lateral' } }
    ]
  },
  {
    id: 'm20',
    track: 'TRILHA 3 — Estrutura',
    title: 'Rompimento falso',
    description: 'A armadilha mortal.',
    xpReward: 80,
    steps: [
      { id: 'm20-s1', type: 'quiz', content: 'Você viu o preço passar uma resistência forte, mas recuar no mesmo minuto.', quiz: { question: 'O que houve?', options:[{id:'1',label:'Rompimento falso',isCorrect:true}, {id:'2',label:'Nova tendência',isCorrect:false}], explanationCorrect:'Isso aí! Sem confirmação de corpo, é furada.', explanationIncorrect:'Sem fechamento da vela acima, não tem rompimento real.' } }
    ]
  },
  {
    id: 'm21',
    track: 'TRILHA 3 — Estrutura',
    title: 'Confluência',
    description: 'Juntando as provas.',
    xpReward: 80,
    steps: [
      { id: 'm21-s1', type: 'dialog', content: 'Um fator só não basta. EMA + RSI + BOS juntos formam a confluência. Aí sim, a entrada é boa.' }
    ]
  },

  // ==========================================
  // TRILHA 4 — OPERACIONAL
  // ==========================================
  {
    id: 'm22',
    track: 'TRILHA 4 — Operacional',
    title: 'Esperar confirmação',
    description: 'Paciência paga.',
    xpReward: 100,
    steps: [
      { id: 'm22-s1', type: 'dialog', content: 'Nunca adivinhe o fundo ou o topo. Espere o preço confirmar que vai virar.' }
    ]
  },
  {
    id: 'm23',
    track: 'TRILHA 4 — Operacional',
    title: 'Entrada ruim',
    description: 'Como perder dinheiro rápido.',
    xpReward: 100,
    steps: [
      { id: 'm23-s1', type: 'chart-highlight', content: 'Comprar depois que a vela esticou muito, ou entrar sem ver o risco. Isso dói no bolso.', chartConfig: { highlightCandles: 'weak' } }
    ]
  },
  {
    id: 'm24',
    track: 'TRILHA 4 — Operacional',
    title: 'Entrada boa',
    description: 'Como lucrar com segurança.',
    xpReward: 100,
    steps: [
      { id: 'm24-s1', type: 'dialog', content: 'Preço próximo da média, tendência a seu favor, RSI bom. Simples e letal.' }
    ]
  },
  {
    id: 'm25',
    track: 'TRILHA 4 — Operacional',
    title: 'Operar contra tendência',
    description: 'Perigoso, mas possível?',
    xpReward: 100,
    steps: [
      { id: 'm25-s1', type: 'quiz', content: 'O preço só cai.', quiz: { question: 'Você pode tentar pescar o fundo?', options:[{id:'1',label:'Não é recomendado para o iniciante',isCorrect:true}, {id:'2',label:'Sim, sempre funciona',isCorrect:false}], explanationCorrect:'Você vai viver muito no mercado.', explanationIncorrect:'Tentar pegar a faca caindo corta a mão.' } }
    ]
  },
  {
    id: 'm26',
    track: 'TRILHA 4 — Operacional',
    title: 'Stop loss',
    description: 'Seu cinto de segurança.',
    xpReward: 100,
    steps: [
      { id: 'm26-s1', type: 'dialog', content: 'Sempre coloque um limite de perda. Nunca torça para o preço voltar. Torcida não funciona na bolsa.' }
    ]
  },
  {
    id: 'm27',
    track: 'TRILHA 4 — Operacional',
    title: 'Take profit',
    description: 'Hora de botar no bolso.',
    xpReward: 100,
    steps: [
      { id: 'm27-s1', type: 'dialog', content: 'Saiba onde vai sair antes mesmo de entrar. Aceite seu lucro e feche a tela.' }
    ]
  },

  // ==========================================
  // TRILHA 5 — MENTALIDADE
  // ==========================================
  {
    id: 'm28',
    track: 'TRILHA 5 — Mentalidade',
    title: 'FOMO',
    description: 'O medo de ficar de fora.',
    xpReward: 100,
    steps: [
      { id: 'm28-s1', type: 'dialog', content: 'Viu o preço disparar e seu dedo coçou para clicar "comprar"? Respire. O mercado vai respirar e te dar chance depois.' }
    ]
  },
  {
    id: 'm29',
    track: 'TRILHA 5 — Mentalidade',
    title: 'Revenge trading',
    description: 'Vingança sai caro.',
    xpReward: 100,
    steps: [
      { id: 'm29-s1', type: 'dialog', content: 'Tomou um loss e agora quer recuperar a qualquer custo? Você já perdeu o controle emocional. Saia do PC.' }
    ]
  },
  {
    id: 'm30',
    track: 'TRILHA 5 — Mentalidade',
    title: 'Overtrading',
    description: 'Operar demais faz mal.',
    xpReward: 100,
    steps: [
      { id: 'm30-s1', type: 'dialog', content: 'Você não precisa abrir 10 ordens por dia. 1 ou 2 entradas excelentes pagam a semana toda.' }
    ]
  },
  {
    id: 'm31',
    track: 'TRILHA 5 — Mentalidade',
    title: 'Ansiedade',
    description: 'O relógio que não passa.',
    xpReward: 100,
    steps: [
      { id: 'm31-s1', type: 'dialog', content: 'Se seu coração acelera ao abrir uma ordem, o tamanho dela está muito grande. Diminua a mão.' }
    ]
  },
  {
    id: 'm32',
    track: 'TRILHA 5 — Mentalidade',
    title: 'Paciência',
    description: 'A virtude dos milionários.',
    xpReward: 100,
    steps: [
      { id: 'm32-s1', type: 'dialog', content: 'Mercado é transferir dinheiro dos impacientes para os pacientes. Escolha de qual lado vai estar.' }
    ]
  },
  {
    id: 'm33',
    track: 'TRILHA 5 — Mentalidade',
    title: 'Disciplina',
    description: 'Fazer o que tem que ser feito.',
    xpReward: 100,
    steps: [
      { id: 'm33-s1', type: 'dialog', content: 'Siga seu plano, bata sua meta, desligue o PC. Todo dia.' }
    ]
  },

  // ==========================================
  // TRILHA 6 — PRÁTICA
  // ==========================================
  {
    id: 'm34',
    track: 'TRILHA 6 — Prática',
    title: 'Replay guiado',
    description: 'Aqueça as turbinas.',
    xpReward: 150,
    steps: [
      { id: 'm34-s1', type: 'practice', content: 'O preço está subindo acima da EMA 200.', chartConfig: { showEMA200: true, simulateAction: true } }
    ]
  },
  {
    id: 'm35',
    track: 'TRILHA 6 — Prática',
    title: 'Encontrar tendência',
    description: 'Leia o mapa.',
    xpReward: 150,
    steps: [
      { id: 'm35-s1', type: 'practice', content: 'Para onde está indo a onda?', chartConfig: { showEMA200: true, highlightTrend: 'down', simulateAction: true } }
    ]
  },
  {
    id: 'm36',
    track: 'TRILHA 6 — Prática',
    title: 'Detectar BOS',
    description: 'Veja a confirmação.',
    xpReward: 150,
    steps: [
      { id: 'm36-s1', type: 'practice', content: 'O preço quebrou o teto. O que você faz?', chartConfig: { showBOS: true, simulateAction: true } }
    ]
  },
  {
    id: 'm37',
    track: 'TRILHA 6 — Prática',
    title: 'Detectar RSI extremo',
    description: 'Hora de frear.',
    xpReward: 150,
    steps: [
      { id: 'm37-s1', type: 'practice', content: 'RSI em 88 e vela verde grande.', chartConfig: { showRSI: true, highlightRSI: 'overbought', simulateAction: true } }
    ]
  },
  {
    id: 'm38',
    track: 'TRILHA 6 — Prática',
    title: 'Simular entrada',
    description: 'O botão de tiro.',
    xpReward: 150,
    steps: [
      { id: 'm38-s1', type: 'practice', content: 'Tendência de alta confirmada, RSI saudável.', chartConfig: { showEMA200: true, showBOS: true, showRSI: true, simulateAction: true } }
    ]
  },
  {
    id: 'm39',
    track: 'TRILHA 6 — Prática',
    title: 'Identificar erro',
    description: 'A pegadinha.',
    xpReward: 150,
    steps: [
      { id: 'm39-s1', type: 'practice', content: 'Preço embaixo da EMA 200, mas rompeu uma resistênciazinha e você quer comprar.', chartConfig: { showEMA200: true, simulateAction: true } }
    ]
  },
  {
    id: 'm40',
    track: 'TRILHA 6 — Prática',
    title: 'Mestre Hunter',
    description: 'Formatura final.',
    xpReward: 300,
    steps: [
      { id: 'm40-s1', type: 'dialog', content: 'Você passou por toda a biblioteca e agora entende como o mercado respira e se movimenta.' },
      { id: 'm40-s2', type: 'practice', content: 'Sua última prova.', chartConfig: { showEMA200: true, showBOS: true, showRSI: true, simulateAction: true } }
    ]
  }
];
`;

fs.writeFileSync(path.join(__dirname, 'src/components/academy/modules.ts'), content, 'utf-8');
console.log('modules.ts generated successfully');
