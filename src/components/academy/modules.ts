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
  {
    id: 'm1',
    title: 'O que é Tendência',
    description: 'Aprenda a ver a direção do mercado sem complicações.',
    xpReward: 50,
    steps: [
      {
        id: 'm1-s1',
        type: 'dialog',
        content: 'Olá! Muito bom ter você aqui. Aprender trading é como aprender a dirigir: vamos começar devagar. Primeiro, precisamos saber para onde a "estrada" está indo.',
        chartConfig: { }
      },
      {
        id: 'm1-s2',
        type: 'chart-highlight',
        content: 'Quando o mercado está subindo, nós chamamos de "Tendência de Alta". É como subir uma escada: cada degrau que pisamos é mais alto que o anterior.',
        chartConfig: { highlightTrend: 'up', drawArrows: [{xIndex: -10, direction: 'up'}, {xIndex: -5, direction: 'up'}] }
      },
      {
        id: 'm1-s3',
        type: 'chart-highlight',
        content: 'Para facilitar, nós usamos essa linha verde mágica, chamada EMA200. Se o preço está passeando acima da linha verde, os compradores estão no controle.',
        chartConfig: { showEMA200: true, highlightTrend: 'up' }
      },
      {
        id: 'm1-s4',
        type: 'quiz',
        content: 'Vamos testar seu olho mágico.',
        chartConfig: { showEMA200: true, highlightTrend: 'up' },
        quiz: {
          question: 'O que você enxerga acontecendo no gráfico agora?',
          options: [
            { id: 'opt1', label: 'Os preços estão caindo', isCorrect: false },
            { id: 'opt2', label: 'Os preços estão subindo', isCorrect: true },
            { id: 'opt3', label: 'Está parado', isCorrect: false }
          ],
          explanationCorrect: 'Boa! Você já tem o olho treinado. O preço está claramente subindo (acima da nossa linha verde).',
          explanationIncorrect: 'Sem problemas, é comum confundir no começo! Repare como o preço (as barrinhas coloridas) está acima da linha verde. Isso significa que ele está ganhando força para cima.'
        }
      }
    ]
  },
  {
    id: 'm2',
    title: 'Força do Mercado (RSI)',
    description: 'Entenda quando o mercado correu demais e precisa descansar.',
    xpReward: 60,
    steps: [
      {
        id: 'm2-s1',
        type: 'dialog',
        content: 'Imagine que o mercado é um atleta. Ele corre muito rápido (preço sobe), mas depois precisa descansar um pouco para respirar.',
        chartConfig: { showRSI: true }
      },
      {
        id: 'm2-s2',
        type: 'chart-highlight',
        content: 'O RSI é o batimento cardíaco desse atleta. Se a linha azul passar do limite de cima (70), ele correu demais. Dizemos que está "Sobrecomprado".',
        chartConfig: { showRSI: true, highlightRSI: 'overbought', paintRegion: { startIndex: -15, endIndex: -5, color: 'blue' } }
      },
      {
        id: 'm2-s3',
        type: 'quiz',
        content: 'Olhe para a linha azul agora (RSI).',
        chartConfig: { showRSI: true },
        quiz: {
          question: 'Onde está o batimento do nosso atleta?',
          options: [
            { id: 'opt1', label: 'Passou de 70 (cansado/sobrecomprado)', isCorrect: false },
            { id: 'opt2', label: 'Abaixo de 30 (precisa subir)', isCorrect: false },
            { id: 'opt3', label: 'No meio do caminho (saudável)', isCorrect: true }
          ],
          explanationCorrect: 'Isso aí! O coração dele está batendo normal. Ele tem energia para correr para qualquer direção.',
          explanationIncorrect: 'Tranquilo! Dê uma olhada na linha azul no finalzinho. Ela não está nem estourando lá em cima, nem lá embaixo. Está no meio, então está saudável.'
        }
      }
    ]
  },
  {
    id: 'm4',
    title: 'Rompimento (BOS)',
    description: 'Aprenda a ver quando o mercado ganha coragem para continuar.',
    xpReward: 80,
    steps: [
      {
        id: 'm4-s1',
        type: 'dialog',
        content: 'Às vezes, o mercado encontra um "teto". Quando ele bate nesse teto e rompe ele com força, chamamos isso de BOS (Break of Structure).',
        chartConfig: { showBOS: true }
      },
      {
        id: 'm4-s2',
        type: 'chart-highlight',
        content: 'Veja aquela linha amarela. O mercado bateu nela antes. Mas agora ele rompeu a linha para cima com uma barra forte verde!',
        chartConfig: { showBOS: true, highlightCandles: 'impulsive' }
      },
      {
        id: 'm4-s3',
        type: 'quiz',
        content: 'Observando esse rompimento da linha amarela...',
        chartConfig: { showBOS: true, highlightCandles: 'impulsive' },
        quiz: {
          question: 'O que você enxerga?',
          options: [
            { id: 'opt1', label: 'Uma barra fraca, sem força', isCorrect: false },
            { id: 'opt2', label: 'Um rompimento forte (BOS)', isCorrect: true },
            { id: 'opt3', label: 'Uma reversão (vai cair)', isCorrect: false }
          ],
          explanationCorrect: 'Excelente percepção! Ele quebrou o teto anterior com uma barra verde forte, mostrando que tem intenção de continuar subindo.',
          explanationIncorrect: 'Relaxa! Fica de olho na barrinha verde brilhante passando da linha pontilhada. Ela passou com tudo, o que chamamos de Rompimento (BOS).'
        }
      }
    ]
  },
  {
    id: 'm7',
    title: 'A Prática (Simulação)',
    description: 'O que você faria se estivesse operando agora?',
    xpReward: 150,
    steps: [
      {
        id: 'm7-s1',
        type: 'dialog',
        content: 'Chegou a hora de juntar as peças do que-bra cabeça. Não precisa ter medo de errar, estamos em um laboratório seguro.',
      },
      {
        id: 'm7-s2',
        type: 'practice',
        content: 'Vamos olhar o cenário:\n\n1. O preço está subindo acima da linha verde.\n2. Ele rompeu o teto (BOS).\n3. O batimento (RSI) está saudável, no meio.\n\nO que o seu extinto diz?',
        chartConfig: { showEMA200: true, showBOS: true, showRSI: true, simulateAction: true }
      }
    ]
  }
];
