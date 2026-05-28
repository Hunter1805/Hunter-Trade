export type StepType = 'dialog' | 'chart-highlight' | 'quiz' | 'practice';

export interface Step {
  id: string;
  type: StepType;
  content: string; // O que o professor fala
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
  title: string;
  description: string;
  xpReward: number;
  steps: Step[];
}

export const beginnerModules: Module[] = [
  // ==========================================
  // TRILHA 1 — O QUE É O MERCADO
  // ==========================================
  {
    id: 'm1',
    title: 'Missão 1: O que é um candle',
    description: 'Entenda os bloquinhos que formam o gráfico.',
    xpReward: 50,
    steps: [
      {
        id: 'm1-s1',
        type: 'dialog',
        content: 'Olá! Muito bom ter você aqui. O mercado financeiro parece assustador, mas é só uma disputa entre compradores e vendedores. Vamos olhar para o gráfico.'
      },
      {
        id: 'm1-s2',
        type: 'chart-highlight',
        content: 'Cada barrinha dessas se chama "Candle" (vela). Se ela é verde, os compradores ganharam aquela briga e o preço subiu. Se é vermelha, os vendedores ganharam e o preço caiu.',
        chartConfig: { highlightCandles: 'impulsive' }
      },
      {
        id: 'm1-s3',
        type: 'quiz',
        content: 'Vamos ver se você pegou a ideia.',
        quiz: {
          question: 'O que significa um candle verde bem grande?',
          options: [
            { id: 'opt1', label: 'Que o preço caiu muito', isCorrect: false },
            { id: 'opt2', label: 'Que os compradores entraram com força', isCorrect: true },
            { id: 'opt3', label: 'Que o mercado fechou', isCorrect: false }
          ],
          explanationCorrect: 'Exato! Verde significa força compradora.',
          explanationIncorrect: 'Não exatamente. Verde sempre significa que o preço subiu (compradores venceram).'
        }
      }
    ]
  },
  {
    id: 'm2',
    title: 'Missão 2: O que é pavio',
    description: 'A trilha invisível que o preço deixa.',
    xpReward: 50,
    steps: [
      {
        id: 'm2-s1',
        type: 'chart-highlight',
        content: 'Repare que algumas velas têm uma linhazinha fina saindo por cima ou por baixo. Chamamos isso de "Pavio".',
        chartConfig: { highlightCandles: 'weak' }
      },
      {
        id: 'm2-s2',
        type: 'quiz',
        content: 'O pavio é a "marca" de onde o preço tentou ir, mas não conseguiu ficar.',
        quiz: {
          question: 'Se um candle verde deixa um pavio enorme para cima, o que aconteceu?',
          options: [
            { id: 'opt1', label: 'Os compradores empurraram, mas os vendedores devolveram', isCorrect: true },
            { id: 'opt2', label: 'O preço vai subir para sempre', isCorrect: false }
          ],
          explanationCorrect: 'Perfeito! O preço tentou subir muito, mas perdeu força e voltou.',
          explanationIncorrect: 'Na verdade, o pavio mostra rejeição. O preço tentou ir lá, tomou um choque e voltou.'
        }
      }
    ]
  },
  {
    id: 'm3',
    title: 'Missão 3: O que é tendência',
    description: 'Aprenda a ver a direção do mercado sem complicações.',
    xpReward: 60,
    steps: [
      {
        id: 'm3-s1',
        type: 'dialog',
        content: 'Operar no mercado é como surfar. É muito mais fácil ir a favor da onda do que contra ela. A "onda" é a tendência.'
      },
      {
        id: 'm3-s2',
        type: 'chart-highlight',
        content: 'Quando o mercado está subindo, formando degraus cada vez mais altos, chamamos de Tendência de Alta.',
        chartConfig: { highlightTrend: 'up', drawArrows: [{xIndex: -10, direction: 'up'}, {xIndex: -5, direction: 'up'}] }
      },
      {
        id: 'm3-s3',
        type: 'quiz',
        content: 'Olhando para a direção geral...',
        quiz: {
          question: 'Para onde está indo a nossa onda agora?',
          options: [
            { id: 'opt1', label: 'Para baixo', isCorrect: false },
            { id: 'opt2', label: 'Para cima (Alta)', isCorrect: true }
          ],
          explanationCorrect: 'Boa! Você já tem o olho treinado. A onda está subindo.',
          explanationIncorrect: 'Olhe a inclinação geral das velas, elas estão subindo degrau por degrau.'
        }
      }
    ]
  },
  {
    id: 'm4',
    title: 'Missão 4: Topos e Fundos',
    description: 'Os picos e vales do gráfico.',
    xpReward: 60,
    steps: [
      {
        id: 'm4-s1',
        type: 'dialog',
        content: 'O preço não sobe em linha reta. Ele sobe, respira, sobe, respira. Isso cria os "Topos" e "Fundos".'
      },
      {
        id: 'm4-s2',
        type: 'chart-highlight',
        content: 'Um Topo é o ponto mais alto antes do preço cair. Um Fundo é o ponto mais baixo antes do preço voltar a subir.',
        chartConfig: { highlightTrend: 'lateral' }
      },
      {
        id: 'm4-s3',
        type: 'quiz',
        content: 'Imagine uma montanha-russa.',
        quiz: {
          question: 'Em uma tendência de alta, como são os topos e fundos?',
          options: [
            { id: 'opt1', label: 'Cada vez mais baixos', isCorrect: false },
            { id: 'opt2', label: 'Cada vez mais altos', isCorrect: true }
          ],
          explanationCorrect: 'Exato! A escada continua subindo.',
          explanationIncorrect: 'Pense numa escada subindo: cada degrau (fundo) e cada patamar (topo) é mais alto que o anterior.'
        }
      }
    ]
  },

  // ==========================================
  // TRILHA 2 — LER O GRÁFICO E INDICADORES
  // ==========================================
  {
    id: 'm5',
    title: 'Missão 5: A mágica da EMA 200',
    description: 'A linha que separa o bem do mal no gráfico.',
    xpReward: 70,
    steps: [
      {
        id: 'm5-s1',
        type: 'dialog',
        content: 'Você não precisa adivinhar a tendência. Existe uma ferramenta chamada EMA 200 (Média Móvel de 200 períodos) que faz isso por você.'
      },
      {
        id: 'm5-s2',
        type: 'chart-highlight',
        content: 'Essa linha verde funciona como uma bússola. Se o preço está passeando ACIMA dela, a onda é de alta. Abaixo dela, a onda é de baixa.',
        chartConfig: { showEMA200: true, highlightTrend: 'up' }
      },
      {
        id: 'm5-s3',
        type: 'quiz',
        content: 'Regra de ouro do trader iniciante:',
        quiz: {
          question: 'Se o preço está abaixo da EMA 200 (linha verde), o que NÃO devemos fazer?',
          options: [
            { id: 'opt1', label: 'Procurar compras (ir contra a onda)', isCorrect: true },
            { id: 'opt2', label: 'Procurar vendas', isCorrect: false }
          ],
          explanationCorrect: 'Exatamente! Se a tendência é de queda, tentar comprar é como tentar segurar uma faca caindo.',
          explanationIncorrect: 'Cuidado! Abaixo da linha verde os vendedores dominam. Comprar aí é muito arriscado.'
        }
      }
    ]
  },
  {
    id: 'm6',
    title: 'Missão 6: Força do Mercado (RSI)',
    description: 'Entenda quando o mercado correu demais e precisa descansar.',
    xpReward: 70,
    steps: [
      {
        id: 'm6-s1',
        type: 'dialog',
        content: 'Imagine que o mercado é um atleta. Ele corre muito rápido (preço sobe), mas depois precisa descansar um pouco para respirar.',
        chartConfig: { showRSI: true }
      },
      {
        id: 'm6-s2',
        type: 'chart-highlight',
        content: 'O RSI é o batimento cardíaco desse atleta. Se a linha azul passar de 70, ele correu demais. Dizemos que está "Sobrecomprado".',
        chartConfig: { showRSI: true, highlightRSI: 'overbought', paintRegion: { startIndex: -15, endIndex: -5, color: 'blue' } }
      },
      {
        id: 'm6-s3',
        type: 'quiz',
        content: 'Olhe para a linha azul agora (RSI).',
        chartConfig: { showRSI: true },
        quiz: {
          question: 'Onde está o batimento do nosso atleta?',
          options: [
            { id: 'opt1', label: 'Passou de 70 (cansado/sobrecomprado)', isCorrect: false },
            { id: 'opt2', label: 'No meio do caminho (saudável)', isCorrect: true }
          ],
          explanationCorrect: 'Isso aí! O coração dele está batendo normal. Ele tem energia para continuar a tendência.',
          explanationIncorrect: 'Tranquilo! Dê uma olhada na linha azul. Ela não está nem estourando lá em cima, nem lá embaixo. Está saudável no meio.'
        }
      }
    ]
  },

  // ==========================================
  // TRILHA 3 — ESTRUTURA E CONTEXTO
  // ==========================================
  {
    id: 'm7',
    title: 'Missão 7: Rompimento (BOS)',
    description: 'Quando o mercado ganha coragem para continuar.',
    xpReward: 80,
    steps: [
      {
        id: 'm7-s1',
        type: 'dialog',
        content: 'Lembra dos topos? Às vezes o mercado bate em um topo e recua. Mas quando ele volta e ROMPE esse topo com força, chamamos de BOS (Break of Structure).',
        chartConfig: { showBOS: true }
      },
      {
        id: 'm7-s2',
        type: 'chart-highlight',
        content: 'Veja aquela linha amarela. O mercado bateu nela antes. Mas agora ele rompeu a linha para cima com uma barra forte verde!',
        chartConfig: { showBOS: true, highlightCandles: 'impulsive' }
      },
      {
        id: 'm7-s3',
        type: 'quiz',
        content: 'O que o BOS significa na prática?',
        chartConfig: { showBOS: true, highlightCandles: 'impulsive' },
        quiz: {
          question: 'O que você entende quando vê esse rompimento (BOS)?',
          options: [
            { id: 'opt1', label: 'O mercado cansou e vai cair', isCorrect: false },
            { id: 'opt2', label: 'Os compradores têm força e querem continuar subindo', isCorrect: true }
          ],
          explanationCorrect: 'Isso mesmo! É uma confirmação de que a tendência de alta está viva e forte.',
          explanationIncorrect: 'O BOS a favor da tendência é um sinal de força. Os compradores quebraram a barreira.'
        }
      }
    ]
  },
  {
    id: 'm8',
    title: 'Missão 8: Mudança de Rota (CHoCH)',
    description: 'O momento em que a tendência pode estar morrendo.',
    xpReward: 80,
    steps: [
      {
        id: 'm8-s1',
        type: 'dialog',
        content: 'E se o mercado estava subindo, mas de repente rompe um FUNDO importante para baixo? Isso é um CHoCH (Change of Character).',
        chartConfig: { showBOS: true }
      },
      {
        id: 'm8-s2',
        type: 'quiz',
        content: 'O CHoCH é um alerta.',
        quiz: {
          question: 'Se o mercado vinha de alta e faz um CHoCH para baixo, o que eu devo pensar?',
          options: [
            { id: 'opt1', label: 'Vou comprar mais, está barato', isCorrect: false },
            { id: 'opt2', label: 'Ouvir o alerta: a tendência pode estar virando para queda', isCorrect: true }
          ],
          explanationCorrect: 'Ótimo raciocínio! O CHoCH é o primeiro aviso de que a festa pode ter acabado.',
          explanationIncorrect: 'Cuidado! Comprar logo após um CHoCH de baixa é muito perigoso.'
        }
      }
    ]
  },
  {
    id: 'm9',
    title: 'Missão 9: Falso Rompimento',
    description: 'A armadilha dos grandes players.',
    xpReward: 80,
    steps: [
      {
        id: 'm9-s1',
        type: 'dialog',
        content: 'Às vezes o preço rompe um topo, todo mundo entra comprando, e de repente o preço desaba. Isso é um falso rompimento (ou sweep de liquidez).'
      },
      {
        id: 'm9-s2',
        type: 'chart-highlight',
        content: 'O falso rompimento geralmente deixa um PAVIO enorme acima da região. O corpo da vela fecha abaixo. É uma armadilha perfeita.',
        chartConfig: { highlightCandles: 'weak' }
      },
      {
        id: 'm9-s3',
        type: 'quiz',
        content: 'Como nos protegemos?',
        quiz: {
          question: 'Se o preço passa a linha mas volta rápido deixando só o pavio, o que fazemos?',
          options: [
            { id: 'opt1', label: 'Compramos imediatamente', isCorrect: false },
            { id: 'opt2', label: 'Ficamos de fora, pois não confirmou força', isCorrect: true }
          ],
          explanationCorrect: 'Você tem sangue frio! Um trader inteligente espera o fechamento da vela para confirmar o rompimento.',
          explanationIncorrect: 'A pressa é inimiga da perfeição. Entrar só porque o preço "beliscou" a linha causa muito loss.'
        }
      }
    ]
  },

  // ==========================================
  // TRILHA 4 — TOMADA DE DECISÃO E MENTE DO TRADER
  // ==========================================
  {
    id: 'm10',
    title: 'Missão 10: Quando NÃO entrar',
    description: 'O botão mais lucrativo do trader é o botão de ficar de fora.',
    xpReward: 100,
    steps: [
      {
        id: 'm10-s1',
        type: 'dialog',
        content: 'O erro mais comum de quem está começando é querer apertar botão o tempo todo (Overtrading).'
      },
      {
        id: 'm10-s2',
        type: 'quiz',
        content: 'Imagine que o mercado está lateral, o RSI está no meio e não há tendência.',
        quiz: {
          question: 'O que o Hunter ensina a fazer nessa hora?',
          options: [
            { id: 'opt1', label: 'Tentar adivinhar para onde vai romper', isCorrect: false },
            { id: 'opt2', label: 'Ficar de fora e preservar o dinheiro (Esperar)', isCorrect: true }
          ],
          explanationCorrect: 'Brilhante! "Estar fora do mercado também é uma posição". É a posição mais segura na dúvida.',
          explanationIncorrect: 'Adivinhar é jogar no cassino. Nós operamos probabilidades, não sorte.'
        }
      }
    ]
  },
  {
    id: 'm11',
    title: 'Missão 11: FOMO (Medo de Ficar de Fora)',
    description: 'Você piscou e o preço subiu muito. E agora?',
    xpReward: 100,
    steps: [
      {
        id: 'm11-s1',
        type: 'dialog',
        content: 'Você abre o gráfico e vê uma vela verde GIGANTE. Seu coração acelera: "Nossa, se eu comprar agora vou ficar rico!".'
      },
      {
        id: 'm11-s2',
        type: 'quiz',
        content: 'Esse sentimento se chama FOMO (Fear of Missing Out). O preço já esticou, o RSI está em 85 (super sobrecomprado).',
        quiz: {
          question: 'Você compra no topo daquela vela enorme?',
          options: [
            { id: 'opt1', label: 'Lógico, o foguete não tem ré', isCorrect: false },
            { id: 'opt2', label: 'De jeito nenhum. Eu espero o preço recuar e respirar.', isCorrect: true }
          ],
          explanationCorrect: 'Mentalidade de ferro! Comprar vela esticada é comprar o lucro de quem entrou cedo. O mercado sempre respira.',
          explanationIncorrect: 'Infelizmente, é aí que a "baleia" vende e faz o preço cair na sua cara. Nunca compre algo já esticado.'
        }
      }
    ]
  },

  // ==========================================
  // TRILHA 5 — PRÁTICA OPERACIONAL GUIADA
  // ==========================================
  {
    id: 'm12',
    title: 'Missão 12: Prática Guiada - Tendência',
    description: 'O que você faria se estivesse operando agora?',
    xpReward: 150,
    steps: [
      {
        id: 'm12-s1',
        type: 'dialog',
        content: 'Chegou a hora de juntar as peças do quebra-cabeça. Não precisa ter medo de errar, estamos em um laboratório seguro.',
      },
      {
        id: 'm12-s2',
        type: 'practice',
        content: 'Vamos olhar o cenário:\n\n1. O preço está SUBINDO ACIMA da linha verde (EMA 200).\n2. Ele acabou de romper o teto (BOS).\n3. O batimento (RSI) está saudável.\n\nO que você faria agora?',
        chartConfig: { showEMA200: true, showBOS: true, showRSI: true, simulateAction: true }
      }
    ]
  },
  {
    id: 'm13',
    title: 'Missão 13: Prática Guiada - Cautela',
    description: 'Mostre que você aprendeu a se controlar.',
    xpReward: 150,
    steps: [
      {
        id: 'm13-s1',
        type: 'practice',
        content: 'Cenário atual:\n\n1. O preço está caindo (Abaixo da EMA 200).\n2. Porém, o RSI está batendo em 20 (Super sobrevendido, cansado de cair).\n3. Está perto de um fundo.\n\nVocê faz o que?',
        chartConfig: { showEMA200: true, showRSI: true, simulateAction: true }
      }
      // O botão "Esperar" é avaliado no BeginnerPathEngine nativamente.
    ]
  }
];
