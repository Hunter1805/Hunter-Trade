export interface StudyMemoryItem {
  id: string;
  symbol: string;
  assetName: string;
  rsi: number;
  ema: string;
  estrutura: string;
  conclusaoIA: string;
  score: number;
  horario: string; // ex: "27/05/2026, 14:30:00"
  timestamp: number;
  resultadoObservado: 'Subiu' | 'Caiu' | 'Lateralizou' | null;
  expectedDirection: 'Alta' | 'Baixa' | 'Neutra';
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  bestDayTime: string;
  bestAsset: string;
  bestStructure: string;
  currentStreak: number;
  isWinningStreak: boolean;
  maxWinStreak: number;
  maxLossStreak: number;
  emotionalScore: number;
  emotionalStatus: 'Estável' | 'Pressionado' | 'Em risco' | 'Crítico';
  fatigueDetected: boolean;
  revengeTradesCount: number;
  traderProfile: string;
  aiFeedbacks: string[];
}

export function analyzePerformance(studies: StudyMemoryItem[]): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    totalTrades: 0,
    winRate: 0,
    bestDayTime: 'Dados Insuficientes',
    bestAsset: 'Nenhum',
    bestStructure: 'Nenhum',
    currentStreak: 0,
    isWinningStreak: true,
    maxWinStreak: 0,
    maxLossStreak: 0,
    emotionalScore: 100,
    emotionalStatus: 'Estável',
    fatigueDetected: false,
    revengeTradesCount: 0,
    traderProfile: 'Iniciante Observador',
    aiFeedbacks: []
  };

  // Filtra apenas os finalizados que tem resultado válido
  const validTrades = studies.filter(s => s.resultadoObservado).sort((a, b) => a.timestamp - b.timestamp);
  
  if (validTrades.length === 0) {
    metrics.aiFeedbacks.push("Você ainda não avaliou nenhuma oportunidade no Diário ou no Simulador. Jogue ou anote os resultados para gerar a sua psicanálise.");
    return metrics;
  }

  metrics.totalTrades = validTrades.length;

  let wins = 0;
  let losses = 0;
  
  const dayTimeMap: Record<string, { w: number; l: number }> = {};
  const assetMap: Record<string, { w: number; l: number }> = {};
  const structureMap: Record<string, { w: number; l: number }> = {};
  
  let currentStreak = 0;
  let isWinStreak = true;
  let maxW = 0;
  let maxL = 0;
  let revengeCount = 0;

  validTrades.forEach((trade, i) => {
    // Definir Win ou Loss
    const isWin = (
      (trade.expectedDirection === 'Alta' && trade.resultadoObservado === 'Subiu') ||
      (trade.expectedDirection === 'Baixa' && trade.resultadoObservado === 'Caiu')
    );
    const isLoss = (
      (trade.expectedDirection === 'Alta' && trade.resultadoObservado === 'Caiu') ||
      (trade.expectedDirection === 'Baixa' && trade.resultadoObservado === 'Subiu')
    );

    if (isWin) wins++;
    if (isLoss) losses++;

    // Mapeamento Dia/Horário
    const date = new Date(trade.timestamp);
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dia = diasSemana[date.getDay()];
    const hora = date.getHours();
    
    let periodo = '00-06';
    if (hora >= 6 && hora < 12) periodo = '06-12';
    else if (hora >= 12 && hora < 18) periodo = '12-18';
    else if (hora >= 18) periodo = '18-24';

    const dayTimeKey = `${dia} à ${periodo === '00-06' ? 'Madrugada' : periodo === '06-12' ? 'Manhã' : periodo === '12-18' ? 'Tarde' : 'Noite'}`;
    if (!dayTimeMap[dayTimeKey]) dayTimeMap[dayTimeKey] = { w: 0, l: 0 };
    if (isWin) dayTimeMap[dayTimeKey].w++;
    if (isLoss) dayTimeMap[dayTimeKey].l++;

    // Mapeamento de Ativo
    if (!assetMap[trade.symbol]) assetMap[trade.symbol] = { w: 0, l: 0 };
    if (isWin) assetMap[trade.symbol].w++;
    if (isLoss) assetMap[trade.symbol].l++;

    // Mapeamento de Estrutura
    const est = trade.estrutura || 'Consolidação';
    if (!structureMap[est]) structureMap[est] = { w: 0, l: 0 };
    if (isWin) structureMap[est].w++;
    if (isLoss) structureMap[est].l++;

    // Streaks
    if (isWin) {
      if (isWinStreak) currentStreak++;
      else { currentStreak = 1; isWinStreak = true; }
      if (currentStreak > maxW) maxW = currentStreak;
    } else if (isLoss) {
      if (!isWinStreak) currentStreak++;
      else { currentStreak = 1; isWinStreak = false; }
      if (currentStreak > maxL) maxL = currentStreak;
    }

    // Revenge Trading Detect (Se entrou em até 5 minutos após uma perda anterior)
    if (i > 0 && isLoss) { // Espera, o revenge trading costuma ser: A trade anterior foi um loss, e essa trade foi lançada logo depois.
      // O trade 'i' foi aberto agora. O trade 'i-1' foi a perda.
      // Como estamos lendo "logs" onde o timestamp é do alerta, se o alerta ou trade for rápido:
      const prevTrade = validTrades[i - 1];
      const prevWasLoss = (
        (prevTrade.expectedDirection === 'Alta' && prevTrade.resultadoObservado === 'Caiu') ||
        (prevTrade.expectedDirection === 'Baixa' && prevTrade.resultadoObservado === 'Subiu')
      );
      
      const timeDiffMins = (trade.timestamp - prevTrade.timestamp) / (1000 * 60);
      if (prevWasLoss && timeDiffMins < 10) {
        revengeCount++;
      }
    }
  });

  metrics.winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
  metrics.maxWinStreak = maxW;
  metrics.maxLossStreak = maxL;
  metrics.currentStreak = currentStreak;
  metrics.isWinningStreak = isWinStreak;
  metrics.revengeTradesCount = revengeCount;

  // Calculo Best Day/Time
  let bestScore = -1;
  Object.entries(dayTimeMap).forEach(([key, val]) => {
    if (val.w > bestScore && val.w > 0) {
      bestScore = val.w;
      metrics.bestDayTime = key;
    }
  });

  // Calculo Best Asset
  let bestAssetScore = -1;
  Object.entries(assetMap).forEach(([key, val]) => {
    const wr = val.w / (val.w + val.l);
    if (val.w >= 1 && wr > bestAssetScore) {
      bestAssetScore = wr;
      metrics.bestAsset = key;
    }
  });

  // Calculo Best Structure
  let bestStructScore = -1;
  Object.entries(structureMap).forEach(([key, val]) => {
    const wr = val.w / (val.w + val.l);
    if (val.w >= 1 && wr > bestStructScore) {
      bestStructScore = wr;
      metrics.bestStructure = key;
    }
  });

  // ==========================================
  // ÍNDICE EMOCIONAL E FADIGA
  // ==========================================
  let score = 100;
  
  // Analisar Fadiga nas últimas 3 horas
  const last3HoursTrades = validTrades.filter(t => (Date.now() - t.timestamp) < (3 * 60 * 60 * 1000));
  if (last3HoursTrades.length > 5) {
    metrics.fatigueDetected = true;
    score -= 20; // Fadiga alta derruba o controle emocional
    metrics.aiFeedbacks.push("Cansaço operacional detectado. Você tem aberto muitas operações em um espaço curto de tempo hoje.");
  }

  // Punir por Revenge Trades
  if (revengeCount > 0) {
    score -= (revengeCount * 10);
    metrics.aiFeedbacks.push(`Você tende a abrir operações impulsivamente após perdas (Revenge Trading). Isso ocorreu ${revengeCount} vezes.`);
  }

  // Punir por Losing Streak atual pesada
  if (!isWinStreak && currentStreak >= 3) {
    score -= 25;
    metrics.aiFeedbacks.push(`Atenção: Você está em uma sequência pesada de perdas (${currentStreak} seguidas). Pare um momento e repense a estrutura do mercado.`);
  }

  score = Math.max(Math.min(score, 100), 0);
  metrics.emotionalScore = score;

  if (score >= 80) metrics.emotionalStatus = 'Estável';
  else if (score >= 60) metrics.emotionalStatus = 'Pressionado';
  else if (score >= 40) metrics.emotionalStatus = 'Em risco';
  else metrics.emotionalStatus = 'Crítico';

  // ==========================================
  // PERFIL COMPORTAMENTAL E FEEDBACKS IA
  // ==========================================
  if (revengeCount > 3 || (metrics.fatigueDetected && !isWinStreak)) {
    metrics.traderProfile = 'Trader Impulsivo';
  } else if (metrics.winRate >= 60 && metrics.bestStructure.includes('BOS')) {
    metrics.traderProfile = 'Trader de Tendência (Consistente)';
  } else if (metrics.winRate >= 50 && metrics.bestStructure.includes('CHoCH')) {
    metrics.traderProfile = 'Trader de Reversão';
  } else if (metrics.totalTrades > 20 && metrics.winRate < 45) {
    metrics.traderProfile = 'Trader Agressivo (Alerta)';
  } else if (metrics.totalTrades > 5 && metrics.winRate > 65) {
    metrics.traderProfile = 'Trader Conservador (Sniper)';
  } else {
    metrics.traderProfile = 'Trader Observador';
  }

  // Feedbacks Geniais Dinâmicos baseados no mapeamento cruzado
  if (metrics.bestDayTime !== 'Dados Insuficientes') {
    metrics.aiFeedbacks.push(`Sua performance atinge o pico na ${metrics.bestDayTime}. Priorize seus lotes grandes nesses períodos.`);
  }

  if (metrics.bestStructure !== 'Nenhum') {
    metrics.aiFeedbacks.push(`Você tem dominância operacional quando a estrutura exibe: "${metrics.bestStructure}".`);
  }

  if (metrics.winRate < 40 && metrics.totalTrades > 5) {
    metrics.aiFeedbacks.push("Sua taxa de assertividade está muito baixa. Considere abaixar a exposição (Mão) até alinhar a leitura das EMAs.");
  }

  return metrics;
}
