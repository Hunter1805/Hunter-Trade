import { MarketData, Candle } from '../services/marketEngine';

export interface ScannerSignal {
  type: 'rsi' | 'ema' | 'volume' | 'change' | 'breakout';
  status: string; // Ex: "Sobrecomprado", "Sobrevendido", "Bullish Cross", "Bearish Cross", "Volume Spike", "Strong Move", "Possible Breakout"
  direction: 'up' | 'down' | 'neutral';
}

export interface ScannerAssetResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  score: number;
  classification: 'Baixa' | 'Moderada' | 'Alta';
  signals: ScannerSignal[];
  confidence: number;
  status: string;
  lastUpdated: string;
}

/**
 * Analisa os dados de mercado de um ativo e retorna a análise de sinais e pontuação
 */
export function analyzeAssetSignals(data: MarketData): ScannerAssetResult {
  const { symbol, name, price, changePercent, candles, rsi } = data;
  const signals: ScannerSignal[] = [];
  let score = 0;

  if (!candles || candles.length === 0) {
    return {
      symbol,
      name,
      price,
      changePercent,
      score: 0,
      classification: 'Baixa',
      signals: [],
      confidence: 40,
      status: 'Aguardando dados',
      lastUpdated: new Date().toLocaleTimeString('pt-BR'),
    };
  }

  const curr = candles[candles.length - 1];
  
  // 1. RSI
  if (rsi > 70) {
    signals.push({ type: 'rsi', status: 'Sobrecomprado', direction: 'down' });
    score += 20;
  } else if (rsi < 30) {
    signals.push({ type: 'rsi', status: 'Sobrevendido', direction: 'up' });
    score += 20;
  }

  // 2. EMA9 cruzando EMA21
  if (candles.length >= 2) {
    const prev = candles[candles.length - 2];
    if (
      curr.ema9 !== undefined &&
      curr.ema21 !== undefined &&
      prev.ema9 !== undefined &&
      prev.ema21 !== undefined
    ) {
      const prevDiff = prev.ema9 - prev.ema21;
      const currDiff = curr.ema9 - curr.ema21;

      if (prevDiff <= 0 && currDiff > 0) {
        signals.push({ type: 'ema', status: 'Bullish Cross', direction: 'up' });
        score += 30;
      } else if (prevDiff >= 0 && currDiff < 0) {
        signals.push({ type: 'ema', status: 'Bearish Cross', direction: 'down' });
        score += 30;
      }
    }
  }

  // Janela histórica para volume, variação e breakout (máximo 20 candles anteriores, excluindo o atual)
  const historyWindow = candles.slice(-21, -1);

  if (historyWindow.length > 0) {
    // 3. VOLUME SPIKE
    const avgVolume = historyWindow.reduce((sum, c) => sum + c.volume, 0) / historyWindow.length;
    if (curr.volume > avgVolume) {
      signals.push({ type: 'volume', status: 'Volume Spike', direction: 'neutral' });
      score += 20;
    }

    // 4. VARIAÇÃO (Strong Move)
    const currChange = Math.abs(curr.close - curr.open) / curr.open * 100;
    const pastChanges = historyWindow.map(c => Math.abs(c.close - c.open) / c.open * 100);
    const avgChange = pastChanges.reduce((sum, val) => sum + val, 0) / pastChanges.length;
    
    // Se o candle atual se mover 1.8 vezes mais que a variação média recente
    if (currChange > avgChange * 1.8) {
      signals.push({
        type: 'change',
        status: 'Strong Move',
        direction: curr.close >= curr.open ? 'up' : 'down'
      });
    }

    // 5. BREAKOUT (Rompimento)
    const highs = historyWindow.map(c => c.high);
    const lows = historyWindow.map(c => c.low);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);

    if (curr.close > maxHigh) {
      signals.push({ type: 'breakout', status: 'Possible Breakout', direction: 'up' });
      score += 30;
    } else if (curr.close < minLow) {
      signals.push({ type: 'breakout', status: 'Possible Breakout', direction: 'down' });
      score += 30;
    }
  }

  // Limita o score máximo a 100
  score = Math.min(score, 100);

  // Classificação do score
  let classification: 'Baixa' | 'Moderada' | 'Alta' = 'Baixa';
  if (score > 60) {
    classification = 'Alta';
  } else if (score > 30) {
    classification = 'Moderada';
  }

  // Confiança: baseada no score operacional
  const confidence = Math.min(Math.round(40 + (score * 0.6)), 100);

  // Status resumido principal
  let status = 'Neutro';
  const breakoutSignal = signals.find(s => s.type === 'breakout');
  const emaSignal = signals.find(s => s.type === 'ema');
  const rsiSignal = signals.find(s => s.type === 'rsi');

  if (breakoutSignal) {
    status = breakoutSignal.status;
  } else if (emaSignal) {
    status = emaSignal.status;
  } else if (rsiSignal) {
    status = rsiSignal.status;
  } else if (signals.length > 0) {
    status = signals[0].status;
  }

  return {
    symbol,
    name,
    price,
    changePercent,
    score,
    classification,
    signals,
    confidence,
    status,
    lastUpdated: new Date().toLocaleTimeString('pt-BR'),
  };
}
