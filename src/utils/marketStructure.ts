import { Candle } from '../services/marketEngine';
import { formatPrice } from './scannerSignals'; // Precisamos de um formatPrice genérico. Vou criar um simples aqui ou usar o da view se pudermos centralizar.

// Função auxiliar local para formatar o preço de acordo com o ativo
export const formatAssetPrice = (symbol: string, val: number): string => {
  if (!val) return '0.00';
  if (symbol === 'USDJPY=X') return val.toFixed(2);
  if (symbol === 'XAUUSD=X') return val.toFixed(2);
  if (symbol === 'XRPUSDT') return val.toFixed(4);
  if (symbol.endsWith('USDT')) {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val.toFixed(4);
};

export interface MarketStructureResult {
  range: string;
  trend: string;
  bos: string;
  choch: string;
  liquidity: string;
  isBosBullish: boolean;
  isBosBearish: boolean;
  isChochBullish: boolean;
  isChochBearish: boolean;
}

export function detectMarketStructure(
  symbol: string,
  candles: Candle[],
  currentPrice: number,
  ema9: number,
  ema21: number,
  ema200: number
): MarketStructureResult {
  if (!candles || candles.length < 30) {
    return {
      bos: 'Aguardando mais dados históricos...',
      choch: 'Aguardando mais dados históricos...',
      range: 'Calculando canal...',
      trend: 'Neutro',
      liquidity: 'Buscando pools de liquidez...',
      isBosBullish: false,
      isBosBearish: false,
      isChochBullish: false,
      isChochBearish: false
    };
  }

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  // 1. Range (últimos 30 candles)
  const recentHighs = highs.slice(-30);
  const recentLows = lows.slice(-30);
  const rangeMax = Math.max(...recentHighs);
  const rangeMin = Math.min(...recentLows);
  const range = `${formatAssetPrice(symbol, rangeMin)} — ${formatAssetPrice(symbol, rangeMax)}`;

  // 2. Tendência (combinação de EMA200 e EMAs curtas)
  const isAboveEma200 = currentPrice > ema200;
  const isFastAboveSlow = ema9 > ema21;
  let trend = 'Lateralização';
  if (isAboveEma200 && isFastAboveSlow) {
    trend = 'Forte Tendência de Alta (Bullish)';
  } else if (isAboveEma200 && !isFastAboveSlow) {
    trend = 'Correção de Alta (Pullback)';
  } else if (!isAboveEma200 && !isFastAboveSlow) {
    trend = 'Forte Tendência de Baixa (Bearish)';
  } else if (!isAboveEma200 && isFastAboveSlow) {
    trend = 'Repique na Queda (Bear Rally)';
  }

  // 3. BOS (Break of Structure)
  const lookbackCandles = candles.slice(-25, -3);
  const prevMax = Math.max(...lookbackCandles.map(c => c.high));
  const prevMin = Math.min(...lookbackCandles.map(c => c.low));

  let bos = 'Nenhum rompimento recente confirmado';
  let isBosBullish = false;
  let isBosBearish = false;

  if (currentPrice > prevMax && isAboveEma200) {
    bos = `Bullish BOS confirmado em ${formatAssetPrice(symbol, prevMax)}`;
    isBosBullish = true;
  } else if (currentPrice < prevMin && !isAboveEma200) {
    bos = `Bearish BOS confirmado em ${formatAssetPrice(symbol, prevMin)}`;
    isBosBearish = true;
  }

  // 4. CHoCH (Change of Character)
  let choch = 'Estrutura de momentum mantida';
  let isChochBullish = false;
  let isChochBearish = false;

  if (candles.length >= 7) {
    const currentCross = ema9 > ema21;
    const oldCandle = candles[candles.length - 6];
    const oldCross = (oldCandle.ema9 || 0) > (oldCandle.ema21 || 0);

    if (currentCross !== oldCross) {
      if (currentCross) {
        choch = `Bullish CHoCH (Reversão de Momentum em ${formatAssetPrice(symbol, currentPrice)})`;
        isChochBullish = true;
      } else {
        choch = `Bearish CHoCH (Reversão de Momentum em ${formatAssetPrice(symbol, currentPrice)})`;
        isChochBearish = true;
      }
    }
  }

  // 5. Liquidez Simples
  let liquidity = `Liquidez acumulada acima de ${formatAssetPrice(symbol, rangeMax)} (Stops de venda) e abaixo de ${formatAssetPrice(symbol, rangeMin)} (Stops de compra)`;
  
  let foundEqh = false;
  let foundEql = false;
  let eqhVal = 0;
  let eqlVal = 0;

  for (let i = candles.length - 20; i < candles.length - 1; i++) {
    for (let j = i + 2; j < candles.length; j++) {
      const h1 = candles[i].high;
      const h2 = candles[j].high;
      const diffH = Math.abs(h1 - h2) / h1;
      if (diffH < 0.0008 && h1 > currentPrice) {
        foundEqh = true;
        eqhVal = (h1 + h2) / 2;
      }

      const l1 = candles[i].low;
      const l2 = candles[j].low;
      const diffL = Math.abs(l1 - l2) / l1;
      if (diffL < 0.0008 && l1 < currentPrice) {
        foundEql = true;
        eqlVal = (l1 + l2) / 2;
      }
    }
  }

  if (foundEqh && foundEql) {
    liquidity = `Equal Highs em ${formatAssetPrice(symbol, eqhVal)} (Piscina de Liquidez acima) & Equal Lows em ${formatAssetPrice(symbol, eqlVal)} (Piscina de Liquidez abaixo)`;
  } else if (foundEqh) {
    liquidity = `Buy-side Liquidity (EQH) detectada em ${formatAssetPrice(symbol, eqhVal)} (Topos Relativamente Iguais)`;
  } else if (foundEql) {
    liquidity = `Sell-side Liquidity (EQL) detectada em ${formatAssetPrice(symbol, eqlVal)} (Fundos Relativamente Iguais)`;
  }

  return {
    range,
    trend,
    bos,
    choch,
    liquidity,
    isBosBullish,
    isBosBearish,
    isChochBullish,
    isChochBearish
  };
}
