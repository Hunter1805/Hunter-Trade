import { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { detectMarketStructure } from '../utils/marketStructure';

export type MoodType = '😴 cansado' | '🙂 normal' | '🔥 focado' | '🤯 ansioso';
export type ObjectiveType = 'estudar' | 'simular' | 'operar real';
export type ChecklistStatus = 'sim' | 'não' | 'ignorei' | null;

export interface CopilotChecklist {
  ema: ChecklistStatus;
  rsi: ChecklistStatus;
  bos: ChecklistStatus;
  volume: ChecklistStatus;
  liquidez: ChecklistStatus;
  tendenciaMacro: ChecklistStatus;
}

export function useCopilotEngine() {
  const { marketData, activeTimeframe } = useMarket();
  
  const [status, setStatus] = useState<'closed' | 'active' | 'review'>('closed');
  
  // Setup Info
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [mood, setMood] = useState<MoodType>('🙂 normal');
  const [objective, setObjective] = useState<ObjectiveType>('operar real');
  const [startTime, setStartTime] = useState<number>(0);

  // Checklist
  const [checklist, setChecklist] = useState<CopilotChecklist>({
    ema: null, rsi: null, bos: null, volume: null, liquidez: null, tendenciaMacro: null
  });

  // Trade Result
  const [tradeResult, setTradeResult] = useState<'Gain' | 'Loss' | 'Empate' | null>(null);
  
  // Live Data Snapshot
  const assetData = marketData[symbol];
  
  // Score Calculator
  const getScoreAndFeedback = () => {
    let score = 100;
    const feedbacks: string[] = [];

    if (!assetData || !assetData.candles || assetData.candles.length < 30) {
      return { score: 0, feedbacks: ['Aguardando dados estruturais do ativo.'] };
    }

    const price = assetData.price;
    const rsi = assetData.rsi;
    const ema9 = assetData.ema9;
    const ema21 = assetData.ema21;
    const ema200 = assetData.ema200;
    const structure = detectMarketStructure(symbol, assetData.candles, price, ema9, ema21, ema200);

    // Avaliação EMA vs Realidade
    if (checklist.ema === 'sim') {
      if (Math.abs(ema9 - ema21) < (price * 0.0005)) {
        score -= 15;
        feedbacks.push('Você marcou EMA alinhada, mas as médias curtas estão consolidadas/cruzadas sem força.');
      }
    } else if (checklist.ema === 'ignorei') {
      score -= 20;
      feedbacks.push('Ignorar EMA aumenta risco direcional. Aja com lotes reduzidos.');
    }

    // Avaliação RSI vs Realidade
    if (checklist.rsi === 'sim') {
      if (rsi > 35 && rsi < 65) {
        score -= 10;
        feedbacks.push('Você considerou RSI favorável, porém o indicador está estagnado em zona neutra.');
      }
    } else if (checklist.rsi === 'ignorei') {
      if (rsi > 75 || rsi < 25) {
        score -= 30;
        feedbacks.push('PERIGO: Você ignorou um RSI em sobre-extensão severa. O risco de reversão instantânea é fatal.');
      } else {
        score -= 5;
      }
    }

    // Avaliação Estrutura BOS
    if (checklist.bos === 'sim') {
      if (structure.bos === 'Nenhum rompimento recente confirmado') {
        score -= 25;
        feedbacks.push('Você afirmou ter BOS confirmado, mas a varredura IA não encontrou nenhum rompimento claro de estrutura. Alucinação de Setup detectada.');
      }
    } else if (checklist.bos === 'ignorei') {
      score -= 15;
      feedbacks.push('Operar sem validação de BOS é agir na base da adivinhação de topos e fundos.');
    }

    // Punição de Humor
    if (mood === '🤯 ansioso' || mood === '😴 cansado') {
      score -= 10;
      feedbacks.push(`Seu estado mental (${mood}) reduz sua eficácia cognitiva. Mantenha as mãos longe do botão em caso de dúvidas.`);
    }

    // Volume e Liquidez
    if (checklist.volume === 'ignorei') score -= 10;
    if (checklist.liquidez === 'ignorei') score -= 10;

    // Conclusão
    if (feedbacks.length === 0) {
      feedbacks.push('Leitura alinhada. O viés estrutural condiz com a sua visão humana.');
    }

    return {
      score: Math.max(Math.min(score, 100), 0),
      feedbacks
    };
  };

  const { score, feedbacks } = getScoreAndFeedback();

  const startSession = (s: string, m: MoodType, o: ObjectiveType) => {
    setSymbol(s);
    setMood(m);
    setObjective(o);
    setStartTime(Date.now());
    setChecklist({ ema: null, rsi: null, bos: null, volume: null, liquidez: null, tendenciaMacro: null });
    setTradeResult(null);
    setStatus('active');
  };

  const updateChecklist = (field: keyof CopilotChecklist, value: ChecklistStatus) => {
    setChecklist(prev => ({ ...prev, [field]: value }));
  };

  const endTrade = (result: 'Gain' | 'Loss' | 'Empate') => {
    setTradeResult(result);
    setStatus('review');
  };

  const finalizeAndSave = () => {
    // Salvar no StudyMemory
    const raw = localStorage.getItem('@hunter:studyMemory');
    let studies = [];
    if (raw) {
      try { studies = JSON.parse(raw); } catch(e){}
    }

    // Snapshot Estrutural da hora do encerramento
    let structSnapshot = 'Desconhecida';
    if (assetData?.candles && assetData.candles.length >= 30) {
      const s = detectMarketStructure(symbol, assetData.candles, assetData.price, assetData.ema9, assetData.ema21, assetData.ema200);
      structSnapshot = s.trend;
    }

    const durationMins = Math.round((Date.now() - startTime) / 60000);
    const postReview = generatePostSessionReport();

    const newStudy = {
      id: `copilot-${Date.now()}`,
      symbol: symbol,
      assetName: `COPILOTO REAL - ${symbol}`,
      rsi: assetData?.rsi || 50,
      ema: `EMA9: ${assetData?.ema9?.toFixed(4)} / EMA21: ${assetData?.ema21?.toFixed(4)}`,
      estrutura: structSnapshot,
      conclusaoIA: `${postReview.recomendacao}`,
      score: score,
      horario: new Date().toLocaleString('pt-BR'),
      timestamp: Date.now(),
      resultadoObservado: tradeResult === 'Gain' ? 'Subiu' : tradeResult === 'Loss' ? 'Caiu' : 'Lateralizou',
      alertaId: `copilot`,
      expectedDirection: tradeResult === 'Gain' ? 'Alta' : 'Baixa' // Simplificação pra manter compatibilidade de taxa de acerto
    };

    studies.unshift(newStudy);
    localStorage.setItem('@hunter:studyMemory', JSON.stringify(studies));
    
    // Resetar
    setStatus('closed');
  };

  const generatePostSessionReport = () => {
    let bom = '';
    let mal = '';
    let risco = '';
    let rec = '';
    const durMins = Math.round((Date.now() - startTime) / 60000);

    if (tradeResult === 'Gain') {
      bom = 'Manutenção da disciplina e execução bem-sucedida do alvo.';
      if (score < 60) mal = 'Apesar do ganho, você operou desrespeitando regras cruciais (Score Baixo). Sorte não é método.';
      else mal = 'Nenhum erro fatal mapeado na estrutura de entrada.';
      
      risco = durMins < 2 ? 'Operação em scalping extremo (Impulsiva?).' : 'Risco moderado sob controle.';
      rec = 'Lucro no bolso. Não seja ganancioso e faça uma pausa de tela.';
    } else if (tradeResult === 'Loss') {
      bom = 'Cortar perdas rápido é a única ação aceitável em cenários de invalidação.';
      mal = feedbacks.length > 1 ? 'Sua entrada foi altamente enviesada. A IA avisou os riscos estruturais.' : 'A estrutura falhou. Ocorreu manipulação ou stop hunt da pool de liquidez.';
      risco = mood === '🤯 ansioso' ? 'Risco extremo de Revenge Trading (Operar por vingança) agora!' : 'Risco de abalo psicológico leve.';
      rec = 'Feche o gráfico imediatamente. Aceite a perda. Só volte após descompressão mental.';
    } else {
      bom = 'Proteger o capital saindo no empate é uma virtude.';
      mal = 'Falta de volatilidade ou indefinição de estrutura.';
      risco = 'Desgaste psicológico pelo tempo segurando uma posição morta.';
      rec = 'Filtre melhor ativos com expansão de volume.';
    }

    return { oQueFezBem: bom, ondeErrou: mal, riscoDetectado: risco, recomendacao: rec, duracao: durMins };
  };

  return {
    status,
    symbol, mood, objective, checklist, tradeResult,
    score, feedbacks,
    startSession, updateChecklist, endTrade, finalizeAndSave,
    generatePostSessionReport
  };
}
