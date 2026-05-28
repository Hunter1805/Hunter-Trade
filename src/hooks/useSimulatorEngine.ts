import { useState, useEffect, useRef, useCallback } from 'react';
import { loadMarketData, Candle } from '../services/marketEngine';
import { detectMarketStructure, MarketStructureResult } from '../utils/marketStructure';

export type SimulatorMode = 'free' | 'challenge';
export type SimulatorStatus = 'setup' | 'loading' | 'running' | 'paused' | 'finished';
export type PositionType = 'long' | 'short';

export interface TradePosition {
  type: PositionType;
  entryPrice: number;
  size: number;
  sl: number | null;
  tp: number | null;
  openIndex: number;
  openTime: number;
}

export interface TradeHistory {
  type: PositionType;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  candlesHeld: number;
  reason: 'TP' | 'SL' | 'Manual' | 'ChallengeOver';
}

export interface ChallengeState {
  targetProfitPercent: number; // ex: 5
  maxLossPercent: number;      // ex: 2
  targetCandles: number;       // ex: 30
  candlesSurvived: number;
  status: 'active' | 'won' | 'lost';
  reason?: string;
}

export function useSimulatorEngine() {
  // Configs
  const [mode, setMode] = useState<SimulatorMode>('free');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('15m');
  
  // State
  const [status, setStatus] = useState<SimulatorStatus>('setup');
  const [fullCandles, setFullCandles] = useState<Candle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(30); // starts after 30 to have history for indicators
  const [speed, setSpeed] = useState<number>(1);
  const intervalRef = useRef<number | null>(null);

  // Financials
  const [balance, setBalance] = useState(1000);
  const [position, setPosition] = useState<TradePosition | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);

  // Challenge
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);

  // Visible Data
  const visibleCandles = fullCandles.slice(0, currentIndex + 1);
  const currentCandle = visibleCandles[visibleCandles.length - 1];

  // Estrutura calculada em tempo real (Memoization simplificada pela própria função do hook)
  const currentStructure: MarketStructureResult | null = currentCandle ? detectMarketStructure(
    symbol, 
    visibleCandles, 
    currentCandle.close, 
    currentCandle.ema9 || 0, 
    currentCandle.ema21 || 0, 
    currentCandle.ema200 || 0
  ) : null;

  // Calculo de PnL Real-time
  const getUnrealizedPnL = () => {
    if (!position || !currentCandle) return { value: 0, percent: 0 };
    const price = currentCandle.close;
    const isLong = position.type === 'long';
    const diff = isLong ? price - position.entryPrice : position.entryPrice - price;
    const percent = (diff / position.entryPrice) * 100;
    // O size é em Dólares alocados (margem 1x)
    const value = position.size * (percent / 100);
    return { value, percent };
  };

  const unrealized = getUnrealizedPnL();
  const currentEquity = balance + unrealized.value;
  const equityPercentChange = ((currentEquity - 1000) / 1000) * 100;

  // Carregar dados de mercado
  const startSimulation = async () => {
    setStatus('loading');
    try {
      const data = await loadMarketData(symbol, timeframe);
      let candles = data.candles;
      
      // Se não tiver pelo menos 60 candles, simula mais (simulador precisa de gordura histórica)
      if (candles.length < 60) {
        throw new Error('Histórico insuficiente para simulação.');
      }

      setFullCandles(candles);
      setCurrentIndex(30); // 30 candles pre-carregados para ver a estrutura inicial
      setBalance(1000);
      setPosition(null);
      setTradeHistory([]);

      if (mode === 'challenge') {
        setChallenge({
          targetProfitPercent: 5,
          maxLossPercent: 2,
          targetCandles: 30,
          candlesSurvived: 0,
          status: 'active'
        });
      } else {
        setChallenge(null);
      }

      setStatus('paused');
    } catch (err) {
      console.error('Falha ao carregar simulador', err);
      setStatus('setup');
    }
  };

  // Lógica principal de Tick de Vela (Avanço no Tempo)
  const tick = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      
      // Verifica se o histórico acabou
      if (nextIndex >= fullCandles.length) {
        setStatus('finished');
        return prev;
      }

      const nextCandle = fullCandles[nextIndex];

      // 1. Atualizar Challenge
      if (mode === 'challenge' && challenge && challenge.status === 'active') {
        let newStatus = challenge.status;
        let newReason = '';
        const survived = challenge.candlesSurvived + 1;

        // Regra PnL Global (Baseado no Equity)
        // Precisamos calcular equity com a máxima e mínima para stopar intra-candle no desafio? 
        // Simplificando usando o close do candle atual, ou se loss exceder na mínima.
        const eqPercent = equityPercentChange; 

        if (eqPercent <= -2) {
          newStatus = 'lost';
          newReason = 'Drawdown excedeu o limite de -2% da banca inicial.';
        } else if (eqPercent >= 5) {
          newStatus = 'won';
          newReason = 'Meta de lucro global de +5% atingida com sucesso!';
        } else if (survived >= 30) {
          newStatus = 'won';
          newReason = 'Sobreviveu 30 velas intacto. Desafio concluído!';
        }

        if (newStatus !== 'active') {
          setChallenge(c => c ? { ...c, candlesSurvived: survived, status: newStatus as any, reason: newReason } : null);
          setStatus('finished');
        } else {
          setChallenge(c => c ? { ...c, candlesSurvived: survived } : null);
        }
      }

      // 2. Verificar SL/TP intra-candle
      setPosition(currentPos => {
        if (!currentPos) return currentPos;

        let closed = false;
        let exitPrice = 0;
        let reason: 'TP' | 'SL' = 'TP';

        if (currentPos.type === 'long') {
          if (currentPos.sl && nextCandle.low <= currentPos.sl) {
            closed = true;
            exitPrice = currentPos.sl;
            reason = 'SL';
          } else if (currentPos.tp && nextCandle.high >= currentPos.tp) {
            closed = true;
            exitPrice = currentPos.tp;
            reason = 'TP';
          }
        } else { // short
          if (currentPos.sl && nextCandle.high >= currentPos.sl) {
            closed = true;
            exitPrice = currentPos.sl;
            reason = 'SL';
          } else if (currentPos.tp && nextCandle.low <= currentPos.tp) {
            closed = true;
            exitPrice = currentPos.tp;
            reason = 'TP';
          }
        }

        if (closed) {
          // Finaliza trade
          const isLong = currentPos.type === 'long';
          const diff = isLong ? exitPrice - currentPos.entryPrice : currentPos.entryPrice - exitPrice;
          const pct = (diff / currentPos.entryPrice);
          const pnlValue = currentPos.size * pct;

          setBalance(b => b + pnlValue);
          setTradeHistory(h => [...h, {
            type: currentPos.type,
            entryPrice: currentPos.entryPrice,
            exitPrice: exitPrice,
            pnl: pnlValue,
            pnlPercent: pct * 100,
            candlesHeld: nextIndex - currentPos.openIndex,
            reason
          }]);
          
          return null;
        }

        return currentPos;
      });

      return nextIndex;
    });
  }, [fullCandles, mode, challenge?.status, equityPercentChange]);

  // Controle do Loop de Play
  useEffect(() => {
    if (status === 'running') {
      const baseMs = 2000; // 2 segundos por vela padrão
      const ms = baseMs / speed;
      
      intervalRef.current = window.setInterval(() => {
        tick();
      }, ms);
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [status, speed, tick]);

  // Controles
  const play = () => setStatus('running');
  const pause = () => setStatus('paused');
  const nextCandleAction = () => { if (status !== 'finished') tick(); };
  const prevCandleAction = () => {
    // Para simplificar e evitar trapaças reescrevendo saldo, só permitimos voltar se NÃO tiver trade aberta ou desafio rodando
    if (position || mode === 'challenge') return;
    if (currentIndex > 30) setCurrentIndex(c => c - 1);
  };
  const reset = () => setStatus('setup');

  // Ordens
  const executeOrder = (type: PositionType, amountUsd: number, slPrice: number | null, tpPrice: number | null) => {
    if (!currentCandle || position) return; // Só 1 posição por vez para o simulador simples

    setPosition({
      type,
      entryPrice: currentCandle.close,
      size: amountUsd,
      sl: slPrice,
      tp: tpPrice,
      openIndex: currentIndex,
      openTime: currentCandle.time
    });
  };

  const closePosition = () => {
    if (!position || !currentCandle) return;

    const price = currentCandle.close;
    const isLong = position.type === 'long';
    const diff = isLong ? price - position.entryPrice : position.entryPrice - price;
    const pct = (diff / position.entryPrice);
    const pnlValue = position.size * pct;

    setBalance(b => b + pnlValue);
    setTradeHistory(h => [...h, {
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: price,
      pnl: pnlValue,
      pnlPercent: pct * 100,
      candlesHeld: currentIndex - position.openIndex,
      reason: 'Manual'
    }]);
    
    setPosition(null);
  };

  // Avaliação Pós-Operação (Feita externamente na View baseada no histórico ou equity, mas provemos helper aqui)
  const generateReport = () => {
    let score = 50;
    const isWin = equityPercentChange > 0;
    if (isWin) score += 20;
    if (challenge?.status === 'won') score += 30;
    if (challenge?.status === 'lost') score -= 30;

    // A avaliação detalhada estrutural pode ser renderizada pela tela, aqui damos uma base
    return {
      score: Math.min(Math.max(score, 0), 100),
      isWin,
      trades: tradeHistory.length,
      finalEquity: currentEquity,
      roi: equityPercentChange
    };
  };

  return {
    // Configurações
    mode, setMode,
    symbol, setSymbol,
    timeframe, setTimeframe,
    speed, setSpeed,
    
    // Estado do Motor
    status,
    startSimulation,
    play, pause, nextCandleAction, prevCandleAction, reset,
    
    // Dados de Mercado
    currentCandle,
    visibleCandles,
    currentStructure,
    
    // Finanças
    balance,
    currentEquity,
    equityPercentChange,
    position,
    unrealizedPnL: unrealized,
    tradeHistory,
    
    // Operações
    executeOrder,
    closePosition,
    
    // Desafio
    challenge,
    
    // Relatório
    generateReport
  };
}
