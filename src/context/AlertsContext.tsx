import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMarket } from './MarketContext';
import { detectMarketStructure } from '../utils/marketStructure';
import { analyzeAssetSignals } from '../utils/scannerSignals';

export interface Alert {
  id: string;
  symbol: string;
  assetName: string;
  time: string;
  timestamp: number;
  type: string;
  level: 'Alta' | 'Moderada' | 'Baixa';
  confidence: number;
  summary: string;
  status: 'unread' | 'read';
  candlesData: any; // snapshot para estudo posterior
}

export interface StudyOpportunity {
  id: string;
  symbol: string;
  assetName: string;
  rsi: number;
  ema: string;
  estrutura: string;
  conclusaoIA: string;
  score: number;
  horario: string;
  timestamp: number;
  resultadoObservado: 'Subiu' | 'Caiu' | 'Lateralizou' | null;
  alertaId?: string;
  expectedDirection: 'Alta' | 'Baixa' | 'Neutra';
}

interface AlertsContextType {
  alerts: Alert[];
  studyMemory: StudyOpportunity[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteAlert: (id: string) => void;
  saveToStudyMemory: (alertId: string) => void;
  updateStudyResult: (studyId: string, result: 'Subiu' | 'Caiu' | 'Lateralizou') => void;
  clearStudyMemory: () => void;
  clearAlerts: () => void;
  unreadCount: number;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { marketData, activeTimeframe } = useMarket();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [studyMemory, setStudyMemory] = useState<StudyOpportunity[]>([]);

  // Referência para impedir alertas duplicados na mesma vela (candle time) para o mesmo ativo e tipo
  const lastAlertCandleRef = useRef<Record<string, number>>({});

  // Carrega dados do LocalStorage na inicialização
  useEffect(() => {
    const storedAlerts = localStorage.getItem('@hunter:alerts');
    if (storedAlerts) {
      try {
        setAlerts(JSON.parse(storedAlerts));
      } catch (e) {
        console.error('Erro ao ler alertas locais', e);
      }
    }

    const storedStudies = localStorage.getItem('@hunter:studyMemory');
    if (storedStudies) {
      try {
        setStudyMemory(JSON.parse(storedStudies));
      } catch (e) {
        console.error('Erro ao ler memória de estudo', e);
      }
    }
  }, []);

  // Salva alertas no LocalStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('@hunter:alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Salva memória de estudo no LocalStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('@hunter:studyMemory', JSON.stringify(studyMemory));
  }, [studyMemory]);

  // Motor Principal de Geração de Alertas
  useEffect(() => {
    if (!marketData || Object.keys(marketData).length === 0) return;

    let newAlertsGenerated = false;
    const newAlerts: Alert[] = [];

    // Avalia cada ativo do marketData
    Object.values(marketData).forEach((data) => {
      const { symbol, name, candles, rsi, ema9, ema21, ema200, price } = data;
      if (!candles || candles.length < 30) return;

      const currentCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];
      const candleTime = currentCandle.time;

      // Função auxiliar para verificar e registrar disparo único por candle
      const shouldTrigger = (type: string) => {
        const key = `${symbol}_${activeTimeframe}_${type}`;
        if (lastAlertCandleRef.current[key] === candleTime) {
          return false; // Já disparado para este candle
        }
        return true;
      };

      const registerTrigger = (type: string) => {
        const key = `${symbol}_${activeTimeframe}_${type}`;
        lastAlertCandleRef.current[key] = candleTime;
      };

      const createAlert = (
        type: string,
        level: 'Alta' | 'Moderada' | 'Baixa',
        summary: string,
        confidence: number,
        snapshotStructure: string,
        expectedDirection: 'Alta' | 'Baixa' | 'Neutra'
      ) => {
        if (!shouldTrigger(type)) return;
        
        const alertObj: Alert = {
          id: `${Date.now()}-${symbol}-${type}`,
          symbol,
          assetName: name,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          type,
          level,
          confidence,
          summary,
          status: 'unread',
          candlesData: {
            rsi,
            ema: `EMA9: ${ema9} / EMA21: ${ema21}`,
            estrutura: snapshotStructure,
            price,
            expectedDirection
          }
        };
        newAlerts.push(alertObj);
        registerTrigger(type);
        newAlertsGenerated = true;
      };

      // Avaliação das 9 Condições:

      // 1. Opportunity Score > 70
      const scannerResult = analyzeAssetSignals(data);
      if (scannerResult.score >= 70) {
        createAlert('score', 'Alta', `${name} apresentou um Opportunity Score elevado de ${scannerResult.score}, indicando forte confluência técnica.`, scannerResult.confidence, 'Confluência de Sinais', scannerResult.classification === 'Alta' ? 'Alta' : 'Neutra');
      }

      // 2. RSI > 70
      if (rsi > 70) {
        createAlert('rsi_high', 'Moderada', `${name} cruzou o nível de sobrecompra (RSI em ${rsi}), sinalizando exaustão de alta no curto prazo.`, 75, 'Sobrecomprado', 'Baixa');
      }

      // 3. RSI < 30
      if (rsi < 30) {
        createAlert('rsi_low', 'Moderada', `${name} cruzou o nível de sobrevenda (RSI em ${rsi}), sinalizando exaustão de baixa no curto prazo.`, 75, 'Sobrevendido', 'Alta');
      }

      // 4. EMA Bullish Cross (EMA9 cruza EMA21 pra cima)
      const prevFastAboveSlow = (prevCandle.ema9 || 0) > (prevCandle.ema21 || 0);
      const currFastAboveSlow = (currentCandle.ema9 || 0) > (currentCandle.ema21 || 0);
      if (!prevFastAboveSlow && currFastAboveSlow) {
        createAlert('ema_bullish', 'Moderada', `${name} apresentou cruzamento rápido de médias (EMA9 cruzou EMA21 para cima).`, 80, 'Tendência de Alta', 'Alta');
      }

      // 5. EMA Bearish Cross (EMA9 cruza EMA21 pra baixo)
      if (prevFastAboveSlow && !currFastAboveSlow) {
        createAlert('ema_bearish', 'Moderada', `${name} apresentou cruzamento rápido de médias (EMA9 cruzou EMA21 para baixo).`, 80, 'Tendência de Baixa', 'Baixa');
      }

      // 6. Breakout
      const historyWindow = candles.slice(-21, -1);
      if (historyWindow.length > 0) {
        const highs = historyWindow.map(c => c.high);
        const lows = historyWindow.map(c => c.low);
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);

        if (price > maxHigh) {
          createAlert('breakout_up', 'Alta', `${name} registrou um Breakout de alta, rompendo a resistência recente.`, 85, 'Rompimento de Alta', 'Alta');
        } else if (price < minLow) {
          createAlert('breakout_down', 'Alta', `${name} registrou um Breakout de baixa, rompendo o suporte recente.`, 85, 'Rompimento de Baixa', 'Baixa');
        }
        
        // 9. Volume Spike
        const avgVolume = historyWindow.reduce((sum, c) => sum + c.volume, 0) / historyWindow.length;
        if (currentCandle.volume > avgVolume * 1.5) {
          createAlert('volume_spike', 'Moderada', `${name} registrou um aumento anormal de volume (Volume Spike), possível injeção institucional.`, 70, 'Expansão de Volume', 'Neutra');
        }
      }

      // 7 & 8. BOS e CHoCH via marketStructure util
      const structure = detectMarketStructure(symbol, candles, price, ema9, ema21, ema200);
      
      if (structure.isBosBullish) {
        createAlert('bos_bullish', 'Alta', `${name} registrou uma quebra de estrutura (BOS autista), confirmando continuação da tendência de alta.`, 90, 'BOS Bullish', 'Alta');
      } else if (structure.isBosBearish) {
        createAlert('bos_bearish', 'Alta', `${name} registrou uma quebra de estrutura (BOS baixista), confirmando continuação da tendência de queda.`, 90, 'BOS Bearish', 'Baixa');
      }

      if (structure.isChochBullish) {
        createAlert('choch_bullish', 'Alta', `${name} apresentou uma mudança de caráter (CHoCH autista), indicando possível reversão para alta.`, 88, 'CHoCH Bullish', 'Alta');
      } else if (structure.isChochBearish) {
        createAlert('choch_bearish', 'Alta', `${name} apresentou uma mudança de caráter (CHoCH baixista), indicando possível reversão para queda.`, 88, 'CHoCH Bearish', 'Baixa');
      }
    });

    if (newAlertsGenerated) {
      setAlerts(prev => {
        // Adiciona no início e mantém os últimos 100 alertas para não estourar localstorage
        const combined = [...newAlerts.reverse(), ...prev];
        return combined.slice(0, 100);
      });
    }

  }, [marketData, activeTimeframe]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'read' })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const saveToStudyMemory = (alertId: string) => {
    const alertObj = alerts.find(a => a.id === alertId);
    if (!alertObj) return;

    // Checa se já não salvou
    if (studyMemory.some(s => s.alertaId === alertId)) return;

    // Calcula um score dinâmico com base na confiança
    const finalScore = alertObj.confidence;
    
    const newStudy: StudyOpportunity = {
      id: `study-${Date.now()}`,
      symbol: alertObj.symbol,
      assetName: alertObj.assetName,
      rsi: alertObj.candlesData.rsi || 50,
      ema: alertObj.candlesData.ema || 'N/A',
      estrutura: alertObj.candlesData.estrutura || 'Consolidação',
      conclusaoIA: 'Aguardando validação do AI Analyst', // Será aprimorado se tiver dados locais
      score: finalScore,
      horario: new Date().toLocaleString('pt-BR'),
      timestamp: Date.now(),
      resultadoObservado: null,
      alertaId: alertId,
      expectedDirection: alertObj.candlesData.expectedDirection || 'Neutra'
    };

    setStudyMemory(prev => [newStudy, ...prev]);
    markAsRead(alertId); // opcional: marca como lido ao salvar
  };

  const updateStudyResult = (studyId: string, result: 'Subiu' | 'Caiu' | 'Lateralizou') => {
    setStudyMemory(prev => prev.map(s => s.id === studyId ? { ...s, resultadoObservado: result } : s));
  };

  const clearStudyMemory = () => setStudyMemory([]);
  const clearAlerts = () => setAlerts([]);

  const unreadCount = alerts.filter(a => a.status === 'unread').length;

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        studyMemory,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        saveToStudyMemory,
        updateStudyResult,
        clearStudyMemory,
        clearAlerts,
        unreadCount
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts deve ser usado dentro de AlertsProvider');
  }
  return context;
};
