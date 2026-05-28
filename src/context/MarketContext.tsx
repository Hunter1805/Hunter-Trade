import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MarketData, Candle, loadMarketData, getTimeframeMs, generateSyntheticCandles } from '../services/marketEngine';
import { analyzeMarketWithAI, AIAnalysisResult } from '../services/aiEngine';
import { calculateEMA, calculateRSI } from '../utils/indicators';
import { telemetry } from '../services/telemetry';

interface MarketContextType {
  activeSymbol: string;
  activeTimeframe: string;
  marketData: Record<string, MarketData>;
  loading: boolean;
  error: string | null;
  aiAnalysis: AIAnalysisResult | null;
  aiLoading: boolean;
  changeSymbol: (symbol: string) => void;
  changeTimeframe: (timeframe: string) => void;
  runAIAnalysis: () => Promise<void>;
  symbols: { symbol: string; name: string; type: 'crypto' | 'forex' }[];
  highlightStructure: string | null;
  setHighlightStructure: (structure: string | null) => void;
}

const symbolsList = [
  { symbol: 'BTCUSDT', name: 'BTC/USD', type: 'crypto' as const },
  { symbol: 'ETHUSDT', name: 'ETH/USD', type: 'crypto' as const },
  { symbol: 'SOLUSDT', name: 'SOL/USD', type: 'crypto' as const },
  { symbol: 'XRPUSDT', name: 'XRP/USD', type: 'crypto' as const },
  { symbol: 'EURUSD=X', name: 'EUR/USD', type: 'forex' as const },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', type: 'forex' as const },
  { symbol: 'USDJPY=X', name: 'USD/JPY', type: 'forex' as const },
  { symbol: 'XAUUSD=X', name: 'XAU/USD', type: 'forex' as const },
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSymbol, setActiveSymbol] = useState<string>(() => {
    return localStorage.getItem('@hunter:activeSymbol') || 'BTCUSDT';
  });
  const [activeTimeframe, setActiveTimeframe] = useState<string>(() => {
    return localStorage.getItem('@hunter:activeTimeframe') || '15m';
  });
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [highlightStructure, setHighlightStructure] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const forexIntervalRef = useRef<number | null>(null);
  const priceFluctuationRef = useRef<number | null>(null);

  // Carrega os dados iniciais de todos os ativos em paralelo
  useEffect(() => {
    let active = true;

    async function initData() {
      setLoading(true);
      setError(null);
      try {
        const loadPromises = symbolsList.map(async (s) => {
          try {
            return await loadMarketData(s.symbol, activeTimeframe);
          } catch (err) {
            console.error(`[MarketContext] Erro ao carregar dados para ${s.symbol}:`, err);
            return null;
          }
        });
        
        const results = await Promise.all(loadPromises);
        const newMarketData: Record<string, MarketData> = {};
        results.forEach((data) => {
          if (data) {
            newMarketData[data.symbol] = data;
          }
        });

        if (active) {
          setMarketData(newMarketData);
          setLoading(false);
          // Aciona análise de IA para o ativo selecionado
          const activeData = newMarketData[activeSymbol];
          if (activeData) {
            triggerAIAnalysis(activeData);
          }
        }
      } catch (err: any) {
        telemetry.trackError('Erro initData: ' + (err?.message || err));
        console.error('[MarketContext] Erro ao carregar dados iniciais:', err);
        if (active) {
          setError('Falha ao obter dados de mercado.');
          setLoading(false);
        }
      }
    }

    initData();

    return () => {
      active = false;
    };
  }, [activeTimeframe]);

  // Executa análise de IA quando o símbolo ativo mudar
  useEffect(() => {
    const data = marketData[activeSymbol];
    if (data) {
      triggerAIAnalysis(data);
    }
  }, [activeSymbol]);

  // Função para executar a análise técnica de IA
  const triggerAIAnalysis = async (data: MarketData) => {
    if (!data || data.candles.length === 0) return;
    setAiLoading(true);
    try {
      const closes = data.candles.map(c => c.close);
      const highs = data.candles.map(c => c.high);
      const lows = data.candles.map(c => c.low);

      const maxPrice = Math.max(...highs);
      const minPrice = Math.min(...lows);

      const analysis = await analyzeMarketWithAI({
        symbol: data.name,
        price: data.price,
        rsi: data.rsi,
        ema9: data.ema9,
        ema21: data.ema21,
        ema200: data.ema200,
        volume: data.volume,
        timeframe: data.timeframe,
        highsLows: { maxPrice, minPrice }
      });
      setAiAnalysis(analysis);
    } catch (err) {
      console.error('[MarketContext] Erro na análise do AI Engine:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    const currentData = marketData[activeSymbol];
    if (currentData) {
      await triggerAIAnalysis(currentData);
    }
  };

  // Gerencia conexões WebSocket para Cripto e Polling/Fluorescência para Forex para TODOS os ativos em paralelo
  useEffect(() => {
    // 1. Limpa conexões antigas
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (forexIntervalRef.current) {
      window.clearInterval(forexIntervalRef.current);
      forexIntervalRef.current = null;
    }
    if (priceFluctuationRef.current) {
      window.clearInterval(priceFluctuationRef.current);
      priceFluctuationRef.current = null;
    }

    const binanceIntervalMap: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1D': '1d'
    };
    const interval = binanceIntervalMap[activeTimeframe] || '15m';

    // A. WebSocket Combinado para Criptoativos
    const cryptoSymbols = symbolsList.filter(s => s.type === 'crypto');
    const streams = cryptoSymbols.map(s => `${s.symbol.toLowerCase()}@kline_${interval}`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    telemetry.trackConnectionState('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      telemetry.trackConnectionState('connected');
    };

    ws.onclose = () => {
      telemetry.trackConnectionState('disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const streamData = msg.data || msg;
        const kline = streamData.k;
        if (!kline) return;

        if (msg.E) {
          telemetry.trackWsLatency(Date.now() - msg.E);
        }
        telemetry.trackMarketUpdate();

        const symbol = streamData.s; // ex: "BTCUSDT"
        const price = parseFloat(kline.c);
        const open = parseFloat(kline.o);
        const high = parseFloat(kline.h);
        const low = parseFloat(kline.l);
        const close = parseFloat(kline.c);
        const volume = parseFloat(kline.v);
        const time = kline.t;

        setMarketData((prev) => {
          const current = prev[symbol];
          if (!current) return prev;

          let updatedCandles = [...current.candles];
          const lastCandle = updatedCandles[updatedCandles.length - 1];

          if (lastCandle && lastCandle.time === time) {
            // Atualiza o candle atual
            updatedCandles[updatedCandles.length - 1] = {
              time,
              open,
              high: Math.max(lastCandle.high, high),
              low: Math.min(lastCandle.low, low),
              close,
              volume,
            };
          } else if (!lastCandle || time > lastCandle.time) {
            // Inicia um novo candle
            updatedCandles.push({ time, open, high, low, close, volume });
            if (updatedCandles.length > 100) {
              updatedCandles.shift();
            }
          }

          // Recalcula indicadores rápidos
          const closePrices = updatedCandles.map(c => c.close);
          const rsis = calculateRSI(closePrices, 14);
          const ema9s = calculateEMA(closePrices, 9);
          const ema21s = calculateEMA(closePrices, 21);
          const ema200s = calculateEMA(closePrices, 200);

          // Atribui os indicadores aos candles
          updatedCandles.forEach((c, idx) => {
            c.ema9 = ema9s[idx];
            c.ema21 = ema21s[idx];
            c.ema200 = ema200s[idx];
            c.rsi = rsis[idx];
          });

          const lastIdx = updatedCandles.length - 1;
          const decimals = symbol === 'XRPUSDT' ? 4 : 2;

          return {
            ...prev,
            [symbol]: {
              ...current,
              price,
              volume,
              candles: updatedCandles,
              rsi: Number((rsis[lastIdx] ?? 50).toFixed(2)),
              ema9: Number((ema9s[lastIdx] ?? price).toFixed(decimals)),
              ema21: Number((ema21s[lastIdx] ?? price).toFixed(decimals)),
              ema200: Number((ema200s[lastIdx] ?? price).toFixed(decimals)),
            }
          };
        });
      } catch (err: any) {
        telemetry.trackError('WS Msg Error: ' + err.message);
        console.error('[MarketContext] Erro ao processar WebSocket Binance:', err);
      }
    };

    ws.onerror = (err) => {
      telemetry.trackError('WebSocket Binance Connection Error');
      console.warn('[MarketContext] Erro WebSocket Binance, reconectando via REST fallback...', err);
    };

    // B. Forex Polling (a cada 15 segundos)
    telemetry.trackConnectionState('forex_polling');
    const forexSymbols = symbolsList.filter(s => s.type === 'forex');

    const updateForexReal = async () => {
      for (const fs of forexSymbols) {
        try {
          const freshData = await loadMarketData(fs.symbol, activeTimeframe);
          setMarketData((prev) => ({ ...prev, [fs.symbol]: freshData }));
        } catch (err: any) {
          console.warn(`[MarketContext] Polling de Forex para ${fs.symbol} falhou.`, err);
        }
      }
      telemetry.trackMarketUpdate();
    };

    forexIntervalRef.current = window.setInterval(updateForexReal, 15000);

    // C. Flutuação de Forex local (a cada 1.5 segundos para dinamismo)
    priceFluctuationRef.current = window.setInterval(() => {
      telemetry.trackMarketUpdate();
      setMarketData((prev) => {
        const next = { ...prev };
        let changed = false;

        forexSymbols.forEach((fs) => {
          const current = prev[fs.symbol];
          if (!current || current.candles.length === 0) return;

          const decimals = fs.symbol === 'USDJPY=X' || fs.symbol === 'XAUUSD=X' ? 2 : 4;
          const isGold = fs.symbol === 'XAUUSD=X';
          const volatility = isGold ? 0.0003 : 0.0001;
          const pct = 1 + volatility * (Math.random() - 0.49);
          const newPrice = Number((current.price * pct).toFixed(decimals));

          let updatedCandles = [...current.candles];
          const lastIdx = updatedCandles.length - 1;
          const lastCandle = { ...updatedCandles[lastIdx] };

          lastCandle.close = newPrice;
          if (newPrice > lastCandle.high) lastCandle.high = newPrice;
          if (newPrice < lastCandle.low) lastCandle.low = newPrice;
          updatedCandles[lastIdx] = lastCandle;

          const closePrices = updatedCandles.map(c => c.close);
          const rsis = calculateRSI(closePrices, 14);
          const ema9s = calculateEMA(closePrices, 9);
          const ema21s = calculateEMA(closePrices, 21);
          const ema200s = calculateEMA(closePrices, 200);

          updatedCandles.forEach((c, idx) => {
            c.ema9 = ema9s[idx];
            c.ema21 = ema21s[idx];
            c.ema200 = ema200s[idx];
            c.rsi = rsis[idx];
          });

          next[fs.symbol] = {
            ...current,
            price: newPrice,
            candles: updatedCandles,
            rsi: Number((rsis[lastIdx] ?? 50).toFixed(2)),
            ema9: Number((ema9s[lastIdx] ?? newPrice).toFixed(decimals)),
            ema21: Number((ema21s[lastIdx] ?? newPrice).toFixed(decimals)),
            ema200: Number((ema200s[lastIdx] ?? newPrice).toFixed(decimals)),
          };
          changed = true;
        });

        return changed ? next : prev;
      });
    }, 1500);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (forexIntervalRef.current) window.clearInterval(forexIntervalRef.current);
      if (priceFluctuationRef.current) window.clearInterval(priceFluctuationRef.current);
    };
  }, [activeTimeframe]);

  const changeSymbol = (symbol: string) => {
    if (symbolsList.some(s => s.symbol === symbol)) {
      setActiveSymbol(symbol);
      localStorage.setItem('@hunter:activeSymbol', symbol);
    }
  };

  const changeTimeframe = (tf: string) => {
    const validTfs = ['1m', '5m', '15m', '1h', '4h', '1D'];
    if (validTfs.includes(tf)) {
      setActiveTimeframe(tf);
      localStorage.setItem('@hunter:activeTimeframe', tf);
    }
  };

  return (
    <MarketContext.Provider
      value={{
        activeSymbol,
        activeTimeframe,
        marketData,
        loading,
        error,
        aiAnalysis,
        aiLoading,
        changeSymbol,
        changeTimeframe,
        runAIAnalysis,
        symbols: symbolsList,
        highlightStructure,
        setHighlightStructure,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket deve ser usado dentro de um MarketProvider');
  }
  return context;
};
