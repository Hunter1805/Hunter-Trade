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
      { id: 'm1-s1', type: 'dialog', content: 'Olá, futuro(a) Hunter! Bem-vindo(a) à sua primeira missão. O gráfico de mercado pode parecer assustador à primeira vista, como um mar de barras verdes e vermelhas piscando. Mas não se preocupe! Cada uma dessas barrinhas se chama "Candle" (ou vela). Elas são os tijolos que constroem a história do preço, mostrando exatamente quem está no controle: compradores ou vendedores. Vamos aprender a ler esses tijolos.', chartConfig: {} },
      { id: 'm1-s2', type: 'chart-highlight', content: 'Se a vela é verde, significa que a força compradora dominou. Os compradores entraram no mercado com dinheiro, empurrando o preço para cima durante aquele período. Quanto maior a parte sólida da vela (o corpo), mais forte e confiante foi esse movimento de alta. É a prova visual de que as pessoas acreditam na valorização.', chartConfig: { highlightCandles: 'impulsive' } },
      { id: 'm1-s3', type: 'quiz', content: 'Agora que você viu uma vela verde subir com força, vamos testar o seu raciocínio lógico no mercado.', chartConfig: { highlightCandles: 'impulsive' }, quiz: { question: 'Quando uma vela verde muito grande aparece no gráfico, quem está dominando a guerra do mercado?', options: [{ id:'o1', label:'Os compradores estão com força total', isCorrect:true }, { id:'o2', label:'Os vendedores estão derrubando o preço', isCorrect:false }], explanationCorrect: 'Exatamente! A cor verde e o corpo grande sempre mostram que a força compradora entrou com volume no período.', explanationIncorrect: 'Lembre-se da regra básica: Verde significa que o preço subiu (compradores). Vermelho significa que caiu (vendedores).' } }
    ]
  },
  {
    id: 'm2',
    track: 'TRILHA 1 — O Básico',
    title: 'Como o preço sobe',
    description: 'Entenda os impulsos de alta e o domínio comprador.',
    xpReward: 50,
    steps: [
      { id: 'm2-s1', type: 'dialog', content: 'O preço de um ativo nunca sobe sozinho ou por mágica. Ele só sobe quando existe uma demanda real. Imagine um leilão: se muitas pessoas querem comprar um quadro raro e há poucos disponíveis, os compradores começam a oferecer cada vez mais dinheiro para garantir a compra. No mercado financeiro é a mesma coisa.', chartConfig: {} },
      { id: 'm2-s2', type: 'chart-highlight', content: 'Veja esse movimento ascendente no gráfico. Ele não sobe em uma linha reta perfeita, mas sim em pequenos degraus. Os compradores empurram o preço, alguns realizam lucro (fazendo o preço recuar um pouco), e logo depois novos compradores entram, levando o preço ainda mais alto.', chartConfig: { highlightTrend: 'up' } },
      { id: 'm2-s3', type: 'quiz', content: 'Baseado na lógica de oferta e demanda que acabamos de ver...', chartConfig: { highlightTrend: 'up' }, quiz: { question: 'O que faz o preço desenhar degraus de alta no gráfico?', options: [{ id:'o1', label:'Falta de interesse do mercado', isCorrect:false }, { id:'o2', label:'Forte demanda de compradores superando os vendedores', isCorrect:true }], explanationCorrect: 'Perfeito! É a pura lei da oferta e demanda agindo visualmente na sua tela.', explanationIncorrect: 'Quando o gráfico sobe, é sempre porque há mais dinheiro querendo comprar do que pessoas dispostas a vender barato.' } }
    ]
  },
  {
    id: 'm3',
    track: 'TRILHA 1 — O Básico',
    title: 'Como o preço cai',
    description: 'Os temidos movimentos de baixa.',
    xpReward: 50,
    steps: [
      { id: 'm3-s1', type: 'dialog', content: 'Da mesma forma que a euforia faz o preço subir, o pânico e a necessidade de colocar o dinheiro no bolso fazem o preço cair. Quando grandes instituições decidem que um ativo está caro demais, elas começam a vender suas posições.', chartConfig: {} },
      { id: 'm3-s2', type: 'chart-highlight', content: 'As velas vermelhas mostram essa força vendedora em ação. Repare como o preço forma uma verdadeira ladeira abaixo. O medo costuma ser uma emoção muito mais forte e rápida do que a ganância, por isso os movimentos de queda costumam ser mais agressivos.', chartConfig: { highlightTrend: 'down' } },
      { id: 'm3-s3', type: 'quiz', content: 'Entender a queda é vital para proteger seu capital e encontrar boas oportunidades.', chartConfig: { highlightTrend: 'down' }, quiz: { question: 'O que uma sequência forte de velas vermelhas indica?', options: [{ id:'o1', label:'Que o mercado está acumulando para subir', isCorrect:false }, { id:'o2', label:'Que a pressão vendedora assumiu o controle absoluto', isCorrect:true }], explanationCorrect: 'Ótima leitura! Os vendedores estão no controle e empurrando o preço para baixo.', explanationIncorrect: 'Uma sequência vermelha é sinal claro de domínio vendedor. Nunca tente adivinhar o fundo.' } }
    ]
  },
  {
    id: 'm4',
    track: 'TRILHA 1 — O Básico',
    title: 'O que é pavio',
    description: 'A trilha invisível de rejeição deixada no gráfico.',
    xpReward: 50,
    steps: [
      { id: 'm4-s1', type: 'dialog', content: 'Às vezes o preço vai até uma região e toma um choque, voltando tudo na mesma hora. Essa tentativa frustrada não apaga a história: ela fica registrada no gráfico através de uma linha fina.', chartConfig: {} },
      { id: 'm4-s2', type: 'chart-highlight', content: 'Repare nessas linhas finas saindo dos topos ou fundos das velas. Nós chamamos isso de "Pavio" (ou sombra). O pavio mostra que o preço foi até aquele extremo durante o período da vela, mas os compradores ou vendedores defenderam a região com unhas e dentes, empurrando o preço de volta.', chartConfig: { highlightCandles: 'weak' } },
      { id: 'm4-s3', type: 'quiz', content: 'O pavio é a assinatura visual da rejeição. É onde a briga aconteceu e um lado desistiu.', chartConfig: { highlightCandles: 'weak' }, quiz: { question: 'Se uma vela deixa um pavio enorme voltado para CIMA, o que isso revela?', options: [{ id:'o1', label:'O preço vai continuar subindo infinitamente', isCorrect:false }, { id:'o2', label:'O preço tentou subir, mas os vendedores o esmagaram para baixo', isCorrect:true }], explanationCorrect: 'Exato! O pavio longo para cima é um sinal claro de que os vendedores defenderam a resistência.', explanationIncorrect: 'Pense comigo: se a linha fina ficou em cima, o preço tentou ir lá, não aguentou a pressão de venda e recuou.' } }
    ]
  },
  {
    id: 'm6',
    track: 'TRILHA 1 — O Básico',
    title: 'A Importância da Tendência',
    description: 'A onda do mercado. Nunca nade contra a correnteza.',
    xpReward: 50,
    steps: [
      { id: 'm6-s1', type: 'dialog', content: 'Operar no mercado financeiro é exatamente como surfar. É infinitamente mais fácil e lucrativo remar a favor da onda do que tentar nadar contra ela. A "onda" do mercado é o que chamamos de Tendência.', chartConfig: {} },
      { id: 'm6-s2', type: 'chart-highlight', content: 'Observe esta movimentação. O preço está claramente apontando para o alto, renovando topos. Quem tentar vender (apostar na queda) aqui, será atropelado pela força da maré. Seguir a tendência é a regra número um da sobrevivência.', chartConfig: { highlightTrend: 'up' } },
      { id: 'm6-s3', type: 'practice', content: 'Mostre que você entendeu a regra de ouro.', chartConfig: { highlightTrend: 'up', simulateAction: true } }
    ]
  },
  {
    id: 'm7',
    track: 'TRILHA 1 — O Básico',
    title: 'Topos e Fundos',
    description: 'Os picos e vales do mercado financeiro.',
    xpReward: 50,
    steps: [
      { id: 'm7-s1', type: 'dialog', content: 'O preço não se move em linhas retas. Ele precisa "respirar". Quando ele sobe muito, faz uma pausa caindo um pouco, e depois volta a subir. Essas pausas criam os Topos (picos máximos) e Fundos (vales mínimos).', chartConfig: {} },
      { id: 'm7-s2', type: 'chart-highlight', content: 'Se você ligar os topos e fundos, verá a estrutura do mercado. Em uma tendência de alta saudável, os topos são cada vez mais altos (a escada sobe) e os fundos também são cada vez mais altos.', chartConfig: { highlightTrend: 'up', drawArrows: [{xIndex: -10, direction: 'up'}, {xIndex: -5, direction: 'up'}] } },
      { id: 'm7-s3', type: 'quiz', content: 'Vamos analisar os degraus.', chartConfig: { highlightTrend: 'up' }, quiz: { question: 'Como se comportam os topos e fundos numa Tendência de Alta autêntica?', options: [{id:'1', label:'Eles permanecem sempre no mesmo nível, lateralizados', isCorrect:false}, {id:'2', label:'Eles são progressivamente mais altos, como degraus de uma escada', isCorrect:true}], explanationCorrect:'Perfeito, é a própria definição de estrutura de alta!', explanationIncorrect:'Em uma tendência de alta verdadeira, cada topo e cada fundo precisa ser mais alto que o anterior, senão a escada perde a força.' } }
    ]
  },

  // ==========================================
  // TRILHA 2 — INDICADORES
  // ==========================================
  {
    id: 'm8',
    track: 'TRILHA 2 — Indicadores',
    title: 'A Força do Mercado (RSI)',
    description: 'O batimento cardíaco do mercado.',
    xpReward: 60,
    steps: [
      { id: 'm8-s1', type: 'dialog', content: 'Ler o preço puro é ótimo, mas e se tivéssemos um "raio-X" da energia do mercado? O RSI (Índice de Força Relativa) é o nosso monitor cardíaco. Ele mede se a subida ou descida está com combustível ou se o tanque está esvaziando.', chartConfig: { showRSI: true } },
      { id: 'm8-s2', type: 'chart-highlight', content: 'Olhe a linha azul na parte inferior. Se o RSI está apontando para cima e navegando na zona do meio (entre 40 e 60), o mercado está com uma energia excelente e equilibrada para continuar o movimento. Ele não está exausto.', chartConfig: { showRSI: true } },
      { id: 'm8-s3', type: 'quiz', content: 'O RSI é seu co-piloto para medir cansaço.', chartConfig: { showRSI: true }, quiz: { question: 'O que o RSI mede essencialmente?', options: [{id:'1', label:'O preço exato que o ativo vai alcançar no futuro', isCorrect:false}, {id:'2', label:'A velocidade, força e momento do preço atual', isCorrect:true}], explanationCorrect:'Isso mesmo! Ele é um termômetro de força.', explanationIncorrect:'Nenhum indicador prevê o futuro. O RSI apenas lê o quão rápido o preço está acelerando ou perdendo energia.' } }
    ]
  },
  {
    id: 'm9',
    track: 'TRILHA 2 — Indicadores',
    title: 'Extremos do RSI',
    description: 'Quando o mercado corre demais e perde o fôlego.',
    xpReward: 60,
    steps: [
      { id: 'm9-s1', type: 'dialog', content: 'Pense em um corredor que deu um sprint (tiro) muito forte. Logo ele vai precisar parar, colocar as mãos no joelho e respirar fundo. O mercado faz o mesmo. Se o preço sobe demais e sem pausas, o RSI vai acusar essa exaustão cruzando o limite superior.', chartConfig: { showRSI: true } },
      { id: 'm9-s2', type: 'chart-highlight', content: 'Quando o RSI passa de 70, dizemos que o mercado está "Sobrecomprado". Todo mundo que queria comprar já comprou, o dinheiro acabou e a energia zerou. É o pior momento para se entrar em uma operação de compra.', chartConfig: { showRSI: true, highlightRSI: 'overbought', paintRegion: { startIndex: -15, endIndex: -5, color: 'blue' } } },
      { id: 'm9-s3', type: 'quiz', content: 'Vamos colocar seu conhecimento à prova.', chartConfig: { showRSI: true, highlightRSI: 'overbought' }, quiz: { question: 'O gráfico acabou de esticar e o RSI está batendo 85. O que você faz?', options:[{id:'1',label:'Evito compras imediatas e aguardo o mercado "respirar" e recuar',isCorrect:true}, {id:'2',label:'Compro desesperadamente para surfar o restinho da alta',isCorrect:false}], explanationCorrect:'Mentalidade de trader profissional! Comprar em sobrecompra é pagar a conta da festa dos outros.', explanationIncorrect:'Lembre-se: RSI alto significa exaustão. Se você comprar quando todos já estão cansados, logo eles vão vender e o preço cairá na sua cabeça.' } }
    ]
  },
  {
    id: 'm12',
    track: 'TRILHA 2 — Indicadores',
    title: 'O GPS do Gráfico: EMA 200',
    description: 'A bússola mestre que separa o mercado comprador do vendedor.',
    xpReward: 60,
    steps: [
      { id: 'm12-s1', type: 'dialog', content: 'O maior desafio dos iniciantes é olhar para o gráfico e se perder na direção. Para resolver isso, usamos a EMA 200 (Média Móvel Exponencial de 200 períodos). Ela calcula o preço médio passado e desenha uma linha suave que funciona como uma bússola. É o filtro supremo de tendência.', chartConfig: { showEMA200: true } },
      { id: 'm12-s2', type: 'chart-highlight', content: 'Aqui está a regra inquebrável: se as velas estão trabalhando ACIMA da linha verde (EMA 200), estamos em um ambiente de ALTA (compradores no controle). Se estão ABAIXO da linha verde, estamos num ambiente de BAIXA (vendedores no controle).', chartConfig: { showEMA200: true, highlightTrend: 'up' } },
      { id: 'm12-s3', type: 'practice', content: 'Baseado na posição do preço em relação à EMA 200 que está na sua tela, qual seria sua atitude operacional prudente?', chartConfig: { showEMA200: true, simulateAction: true } }
    ]
  },

  // ==========================================
  // TRILHA 3 — ESTRUTURA
  // ==========================================
  {
    id: 'm15',
    track: 'TRILHA 3 — Estrutura',
    title: 'BOS (Quebra de Estrutura)',
    description: 'A confirmação de que a tendência tem força.',
    xpReward: 80,
    steps: [
      { id: 'm15-s1', type: 'dialog', content: 'Em uma tendência, o preço cria tetos invisíveis chamados de resistências. Quando os compradores tomam impulso e conseguem DESTRUIR esse teto anterior, chamamos esse evento de BOS (Break of Structure). É a assinatura de que a tendência continua viva e muito forte.', chartConfig: { showBOS: true } },
      { id: 'm15-s2', type: 'chart-highlight', content: 'Veja a linha pontilhada amarela representando o antigo topo. Repare como a vela verde não apenas chegou nela, mas a atravessou e fechou acima dela com confiança. O BOS foi confirmado! O caminho está livre para novos topos.', chartConfig: { showBOS: true, highlightCandles: 'impulsive' } },
      { id: 'm15-s3', type: 'quiz', content: 'A leitura do BOS te protege de entradas precipitadas.', chartConfig: { showBOS: true, highlightCandles: 'impulsive' }, quiz: { question: 'Qual a principal lição que tiramos ao ver um BOS a favor da tendência?', options:[{id:'1',label:'Os compradores provaram que têm força suficiente para continuar o movimento',isCorrect:true}, {id:'2',label:'O mercado encontrou um limite e vai reverter a qualquer momento',isCorrect:false}], explanationCorrect:'Excelente percepção. O rompimento do teto anterior é a prova real de força dominante.', explanationIncorrect:'Na verdade, o rompimento de um topo (BOS) a favor da alta é a prova de que não houve limite, a força compradora superou as barreiras.' } }
    ]
  },
  {
    id: 'm16',
    track: 'TRILHA 3 — Estrutura',
    title: 'CHoCH (Mudança de Rumo)',
    description: 'O primeiro grande alerta de que a festa pode estar acabando.',
    xpReward: 80,
    steps: [
      { id: 'm16-s1', type: 'dialog', content: 'E quando a tendência cansa de subir? O mercado não vira da noite para o dia, ele deixa rastros. Se o preço vinha subindo (fazendo BOS), mas de repente cai tanto que ROMPE o último Fundo de onde começou a alta... temos um CHoCH (Change of Character). É o grande alerta sonoro de reversão.', chartConfig: {} },
      { id: 'm16-s2', type: 'chart-highlight', content: 'Um CHoCH avisa que a estrutura foi violada na direção oposta. Se era de alta, e um fundo importante foi quebrado, os vendedores assumiram o palco. Quem ignora um CHoCH acaba comprando no topo e segurando grandes prejuízos.', chartConfig: { showBOS: true, highlightTrend: 'down' } },
      { id: 'm16-s3', type: 'quiz', content: 'A sobrevivência no mercado exige atenção aos primeiros sinais de perigo.', chartConfig: { showBOS: true, highlightTrend: 'down' }, quiz: { question: 'Qual a sua atitude imediata ao identificar um CHoCH de baixa (rompendo um fundo prévio)?', options:[{id:'1',label:'Comprar ainda mais pesado porque os preços caíram',isCorrect:false}, {id:'2',label:'Apertar os cintos, parar de procurar compras e ficar em alerta de reversão',isCorrect:true}], explanationCorrect:'Sensacional! O CHoCH não significa venda imediata, mas significa suspender compras e proteger capital.', explanationIncorrect:'Ignorar a mudança de característica do mercado é suicídio financeiro. Nunca nade contra um alerta de reversão.' } }
    ]
  },
  {
    id: 'm20',
    track: 'TRILHA 3 — Estrutura',
    title: 'Falso Rompimento',
    description: 'A armadilha dos tubarões do mercado (Smart Money).',
    xpReward: 80,
    steps: [
      { id: 'm20-s1', type: 'dialog', content: 'A maior armadilha do mercado é o Sweep de Liquidez (Rompimento Falso). O preço passa por um topo ou fundo importante, todo mundo acha que é um rompimento verdadeiro (BOS) e entra comprando no desespero. De repente, o preço desaba com força. Os tubarões engoliram o dinheiro dos apressados.', chartConfig: {} },
      { id: 'm20-s2', type: 'chart-highlight', content: 'A pista deixada no crime é o PAVIO. Se o preço ultrapassou a resistência, mas não conseguiu manter o corpo lá em cima, fechando abaixo da linha, foi só uma armadilha. Não houve força, apenas manipulação rápida.', chartConfig: { highlightCandles: 'weak' } },
      { id: 'm20-s3', type: 'quiz', content: 'Seja esperto e não caia na teia de aranha do mercado.', chartConfig: { highlightCandles: 'weak' }, quiz: { question: 'Como um trader inteligente evita cair em um falso rompimento?', options:[{id:'1',label:'Aguardando o fechamento do candle para confirmar se o corpo rompeu de fato a região',isCorrect:true}, {id:'2',label:'Entrando instantaneamente assim que o preço triscar na linha, para não perder tempo',isCorrect:false}], explanationCorrect:'Estratégia perfeita! A paciência evita os maiores stops da sua vida. O corpo da vela é o que importa.', explanationIncorrect:'Entrar sem esperar o fechamento da vela é jogar cara ou coroa. A maioria dos rompimentos iniciais falham.' } }
    ]
  },

  // ==========================================
  // TRILHA 4 — OPERACIONAL E MENTALIDADE
  // ==========================================
  {
    id: 'm22',
    track: 'TRILHA 4 — Operacional e Mentalidade',
    title: 'Quando NÃO entrar',
    description: 'O botão mais lucrativo do trader é ficar de fora.',
    xpReward: 100,
    steps: [
      { id: 'm22-s1', type: 'dialog', content: 'Muitos acham que para ganhar dinheiro precisam apertar os botões de compra e venda a cada cinco minutos. Errado. O trader profissional passa 90% do tempo apenas OBSERVANDO, aguardando que todos os fatores se alinhem. Entrar em cenários duvidosos é rasgar dinheiro.', chartConfig: {} },
      { id: 'm22-s2', type: 'chart-highlight', content: 'Se o mercado está lateralizado (preso num caixote), sem tendência clara, o RSI travado no meio e sem estrutura rompida... suas chances de acerto são de cassino. Nesse cenário, "estar de fora do mercado, também é uma posição operacional".', chartConfig: { highlightTrend: 'lateral' } },
      { id: 'm22-s3', type: 'practice', content: 'Perante a ausência de sinais nítidos na sua tela agora, qual botão te protege do caos?', chartConfig: { highlightTrend: 'lateral', simulateAction: true } }
    ]
  },
  {
    id: 'm28',
    track: 'TRILHA 4 — Operacional e Mentalidade',
    title: 'A síndrome do FOMO',
    description: 'Medo de ficar de fora e comprar o topo da euforia.',
    xpReward: 100,
    steps: [
      { id: 'm28-s1', type: 'dialog', content: 'Você abre o gráfico e vê uma vela verde GIGANTE, que subiu 5% em poucos minutos. Seu coração acelera, o desespero bate: "Nossa, se eu comprar agora vou ficar rico! Vou perder essa chance histórica!". Isso se chama FOMO (Fear of Missing Out). É o veneno do trader.', chartConfig: {} },
      { id: 'm28-s2', type: 'chart-highlight', content: 'Neste exato momento em que você se sente tentado a comprar no pico, o RSI está batendo 90 (estourado) e o movimento está totalmente esticado. Quem comprou aqui, comprou o lucro de quem entrou cedo, e amargará uma correção brutal na cara.', chartConfig: { highlightCandles: 'impulsive', showRSI: true, highlightRSI: 'overbought' } },
      { id: 'm28-s3', type: 'quiz', content: 'Dominar sua emoção vale mais do que dominar a técnica.', chartConfig: { highlightCandles: 'impulsive', showRSI: true, highlightRSI: 'overbought' }, quiz: { question: 'Frente a uma vela enorme e atrasada que explodiu de repente, o que a disciplina exige de você?', options: [{ id:'1', label:'Controlar o impulso, não entrar atrasado e esperar pacientemente o preço recuar (pullback)', isCorrect:true }, { id:'2', label:'Entrar imediatamente para tentar garantir pelo menos um restinho do lucro, custe o que custar', isCorrect:false }], explanationCorrect: 'Mentalidade de titânio! Se o bonde já passou, não corra atrás dele. Aguarde o próximo.', explanationIncorrect: 'Comprar topos eufóricos é a receita certa para a frustração. O mercado SEMPRE dá novas oportunidades para quem sabe esperar.' } }
    ]
  },

  // ==========================================
  // TRILHA 5 — PRÁTICA AVANÇADA
  // ==========================================
  {
    id: 'm38',
    track: 'TRILHA 5 — Prática Avançada',
    title: 'Simulador de Decisão (Confluência)',
    description: 'Junte todas as provas antes de apertar o gatilho.',
    xpReward: 200,
    steps: [
      { id: 'm38-s1', type: 'dialog', content: 'Este é o seu teste de fogo. Na polícia investigativa, você precisa de múltiplas provas para acusar um suspeito. No trading, precisamos de múltiplas confirmações (confluência) para arriscar dinheiro. Vamos analisar as provas.', chartConfig: {} },
      { id: 'm38-s2', type: 'chart-highlight', content: 'Primeira Prova: O preço está caminhando firmemente acima da EMA 200 verde. Segunda Prova: Tivemos um belo rompimento confirmando a estrutura (BOS). Terceira Prova: O RSI está descansado, na região de 50. O cenário está perfeitamente alinhado.', chartConfig: { showEMA200: true, showBOS: true, showRSI: true } },
      { id: 'm38-s3', type: 'practice', content: 'Com base nas três provas apresentadas (EMA, Estrutura e RSI), execute sua melhor ação operacional. Sinta a pressão do mercado real!', chartConfig: { showEMA200: true, showBOS: true, showRSI: true, simulateAction: true } }
    ]
  }
];
`;

fs.writeFileSync(path.join(__dirname, 'src/components/academy/modules.ts'), content, 'utf-8');
console.log('modules.ts generated successfully with richer content and charts');
