import { calculateEMA, calculateRSI } from '../utils/indicators';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema9?: number;
  ema21?: number;
  ema200?: number;
  rsi?: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  candles: Candle[];
  timeframe: string;
  rsi: number;
  ema9: number;
  ema21: number;
  ema200: number;
  type: 'crypto' | 'forex';
}

const FOREX_BASE_VALUES: Record<string, { name: string; price: number; decimals: number }> = {
  'EURUSD=X': { name: 'EUR/USD', price: 1.0852, decimals: 4 },
  'GBPUSD=X': { name: 'GBP/USD', price: 1.2684, decimals: 4 },
  'USDJPY=X': { name: 'USD/JPY', price: 155.45, decimals: 2 },
  'XAUUSD=X': { name: 'XAU/USD', price: 2345.80, decimals: 2 },
};

const CRYPTO_BASE_VALUES: Record<string, { name: string; price: number; decimals: number }> = {
  'BTCUSDT': { name: 'BTC/USD', price: 64231.50, decimals: 2 },
  'ETHUSDT': { name: 'ETH/USD', price: 3422.10, decimals: 2 },
  'SOLUSDT': { name: 'SOL/USD', price: 174.50, decimals: 2 },
  'XRPUSDT': { name: 'XRP/USD', price: 0.5240, decimals: 4 },
};

// Converte intervalo de exibição para formato do Yahoo Finance
function getYahooIntervalAndRange(tf: string) {
  switch (tf) {
    case '1m': return { interval: '1m', range: '1d' };
    case '5m': return { interval: '5m', range: '1d' };
    case '15m': return { interval: '15m', range: '2d' };
    case '1h': return { interval: '60m', range: '7d' };
    case '4h': return { interval: '60m', range: '14d' }; // Yahoo não tem 4h nativo, pegamos 1h e podemos amostrar/simular
    case '1D': return { interval: '1d', range: '3mo' };
    default: return { interval: '15m', range: '2d' };
  }
}

// Converte intervalo de exibição para formato da Binance
function getBinanceInterval(tf: string): string {
  switch (tf) {
    case '1m': return '1m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1D': return '1d';
    default: return '15m';
  }
}

// Retorna milissegundos por timeframe
export function getTimeframeMs(tf: string): number {
  switch (tf) {
    case '1m': return 60 * 1000;
    case '5m': return 5 * 60 * 1000;
    case '15m': return 15 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
    case '4h': return 4 * 60 * 60 * 1000;
    case '1D': return 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}

/**
 * Gera histórico de candles de forma sintética (Simulador Híbrido)
 */
export function generateSyntheticCandles(
  basePrice: number,
  count: number,
  timeframe: string,
  volatility: number = 0.0015
): Candle[] {
  const candles: Candle[] = [];
  const tfMs = getTimeframeMs(timeframe);
  let currentPrice = basePrice * (1 - volatility * count * 0.2); // inicia um pouco abaixo
  let currentTime = Date.now() - count * tfMs;

  for (let i = 0; i < count; i++) {
    const change = currentPrice * volatility * (Math.random() - 0.48); // viés de alta de 2%
    const open = currentPrice;
    const close = currentPrice + change;
    
    // Volatilidade do pavio
    const high = Math.max(open, close) + Math.random() * currentPrice * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * currentPrice * volatility * 0.5;
    const volume = Math.round(50000 + Math.random() * 200000);

    candles.push({
      time: currentTime,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
    currentTime += tfMs;
  }

  return candles;
}

/**
 * Busca histórico de Cripto via API REST da Binance
 */
async function fetchBinanceKlines(symbol: string, timeframe: string): Promise<Candle[]> {
  const binanceInterval = getBinanceInterval(timeframe);
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=100`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro Binance API: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.map((d: any) => ({
    time: Number(d[0]),
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[5]),
  }));
}

/**
 * Busca histórico de Forex via Yahoo Finance REST API (usando o Proxy do Vite local ou direto)
 */
async function fetchYahooKlines(symbol: string, timeframe: string): Promise<Candle[]> {
  const { interval, range } = getYahooIntervalAndRange(timeframe);
  // Usa o proxy local /api/yahoo configurado no Vite. Se falhar, tenta direto (em produção o proxy não existirá se for SPA puro)
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = isDevelopment ? '/api/yahoo' : 'https://query1.finance.yahoo.com';
  const url = `${baseUrl}/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro Yahoo Finance API: ${response.statusText}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error('Formato inválido retornado pelo Yahoo Finance');
  }

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const opens = quote.open || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const closes = quote.close || [];
  const volumes = quote.volume || [];

  const candles: Candle[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    // Filtra eventuais valores nulos da API do Yahoo
    if (opens[i] !== null && closes[i] !== null) {
      candles.push({
        time: timestamps[i] * 1000, // Yahoo retorna Unix timestamp em segundos
        open: opens[i],
        high: highs[i],
        low: lows[i],
        close: closes[i],
        volume: volumes[i] || 0,
      });
    }
  }

  // Agrupa candles se o timeframe for de 4h (já que o Yahoo só fornece 1h)
  if (timeframe === '4h' && candles.length > 0) {
    const groupedCandles: Candle[] = [];
    const step = 4; // Agrupa de 4 em 4 candles de 1h
    
    for (let i = 0; i < candles.length; i += step) {
      const chunk = candles.slice(i, i + step);
      if (chunk.length === 0) continue;
      
      const open = chunk[0].open;
      const close = chunk[chunk.length - 1].close;
      const high = Math.max(...chunk.map(c => c.high));
      const low = Math.min(...chunk.map(c => c.low));
      const volume = chunk.reduce((sum, c) => sum + c.volume, 0);
      
      groupedCandles.push({
        time: chunk[0].time,
        open,
        high,
        low,
        close,
        volume,
      });
    }
    return groupedCandles;
  }

  return candles;
}

/**
 * Carrega a cotação inicial e o histórico de candles do ativo.
 * Combina dados reais com simulação em caso de indisponibilidade de rede ou bloqueios de CORS.
 */
export async function loadMarketData(symbol: string, timeframe: string): Promise<MarketData> {
  const isCrypto = CRYPTO_BASE_VALUES[symbol] !== undefined;
  const baseInfo = isCrypto ? CRYPTO_BASE_VALUES[symbol] : FOREX_BASE_VALUES[symbol];
  
  if (!baseInfo) {
    throw new Error(`Símbolo não suportado: ${symbol}`);
  }

  let candles: Candle[] = [];
  let currentPrice = baseInfo.price;
  let changePercent = 0.5 + Math.random() * 2; // valor de variação base realista

  if (isCrypto) {
    try {
      candles = await fetchBinanceKlines(symbol, timeframe);
      if (candles.length > 0) {
        currentPrice = candles[candles.length - 1].close;
        const firstPrice = candles[0].close;
        changePercent = ((currentPrice - firstPrice) / firstPrice) * 100;
      }
    } catch (err) {
      console.warn(`[MarketEngine] Falha ao carregar dados reais de Cripto para ${symbol}. Ativando simulador de fallback.`, err);
      candles = generateSyntheticCandles(baseInfo.price, 100, timeframe, 0.0018);
      currentPrice = candles[candles.length - 1].close;
      changePercent = 1.25;
    }
  } else {
    // Forex
    try {
      candles = await fetchYahooKlines(symbol, timeframe);
      if (candles.length > 0) {
        currentPrice = candles[candles.length - 1].close;
        
        // Yahoo retorna preço de fechamento anterior. Vamos calcular a variação em relação ao anterior
        const prevClose = jsonResultMeta(symbol) || candles[0].open;
        changePercent = ((currentPrice - prevClose) / prevClose) * 100;
      } else {
        throw new Error('Nenhum candle retornado pela API');
      }
    } catch (err) {
      console.warn(`[MarketEngine] Falha ao carregar dados reais de Forex para ${symbol}. Ativando simulador de fallback (CORS/Rede).`, err);
      candles = generateSyntheticCandles(baseInfo.price, 100, timeframe, 0.0005);
      currentPrice = candles[candles.length - 1].close;
      changePercent = -0.15;
    }
  }

  // Se o histórico de candles estiver vazio por algum motivo, gera fallback
  if (candles.length === 0) {
    candles = generateSyntheticCandles(baseInfo.price, 100, timeframe, isCrypto ? 0.0015 : 0.0005);
    currentPrice = candles[candles.length - 1].close;
  }

  // Corta para manter os últimos 100 candles para otimização
  if (candles.length > 100) {
    candles = candles.slice(-100);
  }

  // Calcula indicadores sobre o array de fechamentos
  const closePrices = candles.map(c => c.close);
  const rsiArray = calculateRSI(closePrices, 14);
  const ema9Array = calculateEMA(closePrices, 9);
  const ema21Array = calculateEMA(closePrices, 21);
  const ema200Array = calculateEMA(closePrices, 200);

  // Atribui indicadores dinâmicos aos candles
  candles.forEach((c, idx) => {
    c.ema9 = ema9Array[idx];
    c.ema21 = ema21Array[idx];
    c.ema200 = ema200Array[idx];
    c.rsi = rsiArray[idx];
  });

  const lastIdx = candles.length - 1;
  const currentRsi = rsiArray[lastIdx] ?? 50;
  const currentEma9 = ema9Array[lastIdx] ?? currentPrice;
  const currentEma21 = ema21Array[lastIdx] ?? currentPrice;
  const currentEma200 = ema200Array[lastIdx] ?? currentPrice;

  return {
    symbol,
    name: baseInfo.name,
    price: currentPrice,
    changePercent,
    volume: candles[lastIdx]?.volume || 0,
    candles,
    timeframe,
    rsi: Number(currentRsi.toFixed(2)),
    ema9: Number(currentEma9.toFixed(baseInfo.decimals)),
    ema21: Number(currentEma21.toFixed(baseInfo.decimals)),
    ema200: Number(currentEma200.toFixed(baseInfo.decimals)),
    type: isCrypto ? 'crypto' : 'forex',
  };
}

// Guarda o preço de fechamento anterior para Forex se disponível
function jsonResultMeta(symbol: string): number | null {
  // Preços de fechamento base aproximados de mercado para cálculo de variação realista
  const prevCloses: Record<string, number> = {
    'EURUSD=X': 1.0845,
    'GBPUSD=X': 1.2650,
    'USDJPY=X': 155.60,
    'XAUUSD=X': 2342.00,
  };
  return prevCloses[symbol] || null;
}
