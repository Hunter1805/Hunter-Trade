/**
 * Calcula a Média Móvel Exponencial (EMA) para uma série de preços.
 * @param prices Array de números contendo os preços de fechamento.
 * @param period Período da média móvel (ex: 9, 21, 200).
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  if (prices.length < period) return Array(prices.length).fill(prices[prices.length - 1]);

  const ema: number[] = [];
  const k = 2 / (period + 1);

  // Primeira EMA é estimada usando a média simples (SMA)
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
    ema.push(prices[i]); // preenche os primeiros elementos
  }

  let currentEma = sum / period;
  ema[period - 1] = currentEma;

  for (let i = period; i < prices.length; i++) {
    currentEma = prices[i] * k + currentEma * (1 - k);
    ema.push(currentEma);
  }

  return ema;
}

/**
 * Calcula o Índice de Força Relativa (RSI) para uma série de preços (padrão 14 períodos).
 * @param prices Array de números contendo os preços de fechamento.
 * @param period Período do cálculo do RSI (geralmente 14).
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length === 0) return [];
  if (prices.length <= period) return Array(prices.length).fill(50); // Valor neutro de fallback

  const rsi: number[] = Array(prices.length).fill(50);
  let gains = 0;
  let losses = 0;

  // Primeiro cálculo dos ganhos e perdas médios (SMA do primeiro período)
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  // Média suavizada de Wilder para o restante do array
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}
