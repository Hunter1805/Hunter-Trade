import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { analyzeAssetSignals, ScannerAssetResult, ScannerSignal } from '../utils/scannerSignals';
import { 
  Radar, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Brain, 
  Activity, 
  Volume2, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export function ScannerView() {
  const { 
    marketData, 
    loading, 
    changeSymbol, 
    aiAnalysis, 
    aiLoading, 
    runAIAnalysis, 
    symbols 
  } = useMarket();

  const [selectedAsset, setSelectedAsset] = useState<ScannerAssetResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'forex'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'symbol' | 'change'>('score');

  // Calcula os sinais de todos os ativos disponíveis
  const scannerResults: ScannerAssetResult[] = symbols
    .map(sym => {
      const data = marketData[sym.symbol];
      if (!data) return null;
      return analyzeAssetSignals(data);
    })
    .filter((res): res is ScannerAssetResult => res !== null);

  // Filtra e ordena os resultados
  const filteredResults = scannerResults
    .filter(res => {
      const symInfo = symbols.find(s => s.symbol === res.symbol);
      if (!symInfo) return false;
      if (filterType === 'crypto') return symInfo.type === 'crypto';
      if (filterType === 'forex') return symInfo.type === 'forex';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'change') return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      return 0;
    });

  // Abre o painel lateral e carrega a análise de IA
  const handleOpenAnalysis = async (result: ScannerAssetResult) => {
    setSelectedAsset(result);
    setIsDrawerOpen(true);
    
    // Altera o símbolo ativo no contexto para que o AI Engine processe o ativo correto
    changeSymbol(result.symbol);
  };

  // Se o Drawer estiver aberto e o símbolo mudar, atualiza o selectedAsset com os dados mais recentes do marketData
  useEffect(() => {
    if (isDrawerOpen && selectedAsset) {
      const updatedData = marketData[selectedAsset.symbol];
      if (updatedData) {
        setSelectedAsset(analyzeAssetSignals(updatedData));
      }
    }
  }, [marketData, isDrawerOpen]);

  // Executa a IA quando o Drawer abre ou quando o ativo selecionado muda
  useEffect(() => {
    if (isDrawerOpen && selectedAsset) {
      runAIAnalysis();
    }
  }, [selectedAsset?.symbol, isDrawerOpen]);

  const getScoreColor = (score: number) => {
    if (score >= 61) return 'text-primary border-primary/30 bg-primary/5';
    if (score >= 31) return 'text-secondary-container border-secondary-container/30 bg-secondary-container/5';
    return 'text-on-surface-variant border-outline-variant bg-surface-variant/20';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 61) return 'bg-primary/20 text-primary border-primary/50';
    if (score >= 31) return 'bg-secondary-container/20 text-secondary-container border-secondary-container/50';
    return 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/50';
  };

  const formatPrice = (symbol: string, val: number) => {
    if (symbol === 'USDJPY=X') return val.toFixed(2);
    if (symbol === 'XAUUSD=X') return val.toFixed(2);
    if (symbol === 'XRPUSDT') return val.toFixed(4);
    if (symbol.endsWith('USDT')) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toFixed(4);
  };

  const renderSignalIcon = (type: string) => {
    switch (type) {
      case 'rsi': return <Activity size={12} className="text-secondary-container" />;
      case 'ema': return <Zap size={12} className="text-primary" />;
      case 'volume': return <Volume2 size={12} className="text-yellow-400" />;
      case 'change': return <ArrowUpRight size={12} className="text-orange-400" />;
      case 'breakout': return <Sparkles size={12} className="text-purple-400" />;
      default: return <Activity size={12} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/30 p-1.5 rounded-lg">
            <Radar className="text-primary animate-pulse" size={20} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
              🔥 Market Scanner
            </h2>
            <p className="font-label-sm text-[11px] text-on-surface-variant/70">
              Oportunidades de mercado detectadas em tempo real
            </p>
          </div>
        </div>

        {/* Filtros e Ordenação */}
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-lowest border border-outline-variant rounded-lg p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                filterType === 'all' ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('crypto')}
              className={`px-3 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                filterType === 'crypto' ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cripto
            </button>
            <button
              onClick={() => setFilterType('forex')}
              className={`px-3 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                filterType === 'forex' ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Forex
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-label-sm text-[11px] text-on-surface-variant">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-[11px] text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="score">Score de Oportunidade</option>
              <option value="symbol">Símbolo</option>
              <option value="change">Variação %</option>
            </select>
          </div>
        </div>
      </header>

      {/* Grid de Cards */}
      <div className="flex-1 p-6 overflow-y-auto pb-24">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-on-surface-variant text-label-md">Inicializando scanner e carregando feeds de dados...</p>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center bg-surface-container/50 border border-outline-variant p-6 rounded-2xl max-w-sm">
              <AlertCircle size={40} className="text-on-surface-variant/50 mx-auto mb-3" />
              <p className="text-on-surface font-bold mb-1">Nenhum ativo disponível</p>
              <p className="text-on-surface-variant text-[12px]">Verifique a conexão de rede ou o estado da API externa.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredResults.map((result) => {
              const isPositive = result.changePercent >= 0;
              const hasHighOpportunity = result.score >= 61;
              const hasModOpportunity = result.score >= 31 && result.score <= 60;
              
              return (
                <div 
                  key={result.symbol}
                  className={`glass-panel rounded-xl p-4 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-outline hover:translate-y-[-2px] relative overflow-hidden group ${
                    hasHighOpportunity ? 'shadow-[0_0_20px_rgba(0,240,118,0.05)] border-primary/20' : ''
                  }`}
                >
                  {/* Indicador de Alta Oportunidade */}
                  {hasHighOpportunity && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent"></div>
                  )}

                  {/* Topo do Card */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-md text-[16px] font-bold text-on-surface font-sans">
                          {result.name}
                        </span>
                        <span className="bg-surface-variant/80 text-on-surface-variant/90 border border-outline-variant/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
                          {result.symbol.endsWith('=X') ? 'Forex' : 'Cripto'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono text-label-md font-bold text-on-surface">
                          {formatPrice(result.symbol, result.price)}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center ${isPositive ? 'text-primary' : 'text-error'}`}>
                          {isPositive ? '+' : ''}{result.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Opportunity Score Circle */}
                    <div className={`border rounded-lg px-2.5 py-1 text-center flex flex-col items-center justify-center shrink-0 ${getScoreColor(result.score)}`}>
                      <span className="text-[18px] font-mono font-black leading-none">{result.score}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold mt-0.5 opacity-80">Score</span>
                    </div>
                  </div>

                  {/* Sinais Detectados */}
                  <div className="flex-1 flex flex-col gap-2 mb-4 justify-center">
                    <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold block">
                      Sinais Ativos ({result.signals.length})
                    </span>
                    {result.signals.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {result.signals.map((sig, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-outline-variant/30 bg-surface-container-high/60 text-on-surface/90`}
                          >
                            {renderSignalIcon(sig.type)}
                            <span>{sig.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-on-surface-variant/60 italic">
                        Nenhum sinal relevante no momento
                      </div>
                    )}
                  </div>

                  {/* Base do Card */}
                  <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-center text-[11px]">
                    <div className="flex flex-col gap-0.5 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="opacity-70" />
                        <span>Confiança: <strong className="text-on-surface">{result.confidence}%</strong></span>
                      </div>
                      <div>
                        <span>Status: <strong className={result.score >= 61 ? 'text-primary' : result.score >= 31 ? 'text-secondary-container' : 'text-on-surface-variant'}>{result.status}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAnalysis(result)}
                      className="bg-surface-container-high hover:bg-primary hover:text-on-primary border border-outline-variant/50 hover:border-primary text-on-surface font-label-sm text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      Análise IA
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer Lateral - Painel de Análise IA */}
      {isDrawerOpen && selectedAsset && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-[460px] bg-surface/95 backdrop-blur-2xl border-l border-outline-variant shadow-2xl z-50 flex flex-col transition-all duration-300 transform translate-x-0 overflow-hidden">
            {/* Topo do Drawer */}
            <div className="p-5 border-b border-outline-variant flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <Brain className="text-primary animate-pulse" size={20} />
                <div>
                  <h3 className="font-headline-md text-[16px] font-bold text-on-surface">
                    Análise IA — {selectedAsset.name}
                  </h3>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {selectedAsset.symbol} • Preço: {formatPrice(selectedAsset.symbol, selectedAsset.price)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-variant/40 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do Drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-24">
              
              {/* Score do Scanner no Drawer */}
              <div className="bg-surface-container-high/50 border border-outline-variant/60 rounded-xl p-4 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Opportunity Score</span>
                  <span className="text-[14px] text-on-surface">Classificação: <strong className={selectedAsset.score >= 61 ? 'text-primary' : selectedAsset.score >= 31 ? 'text-secondary-container' : 'text-on-surface-variant'}>{selectedAsset.classification}</strong></span>
                </div>
                <div className={`border rounded-lg px-3 py-1.5 text-center flex flex-col items-center justify-center min-w-[70px] ${getScoreColor(selectedAsset.score)}`}>
                  <span className="text-[24px] font-mono font-black leading-none">{selectedAsset.score}</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5 opacity-80">Score</span>
                </div>
              </div>

              {/* Bloco de Análise de IA */}
              <div className="bg-surface-container-high/40 border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-secondary-container"></div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-secondary-container" size={16} />
                  <h4 className="font-headline-md text-[14px] font-bold text-on-surface uppercase tracking-wide">
                    Motor de Inteligência Artificial
                  </h4>
                </div>

                {aiLoading ? (
                  <div className="flex flex-col gap-3 py-8 items-center justify-center">
                    <div className="w-8 h-8 border-3 border-secondary-container border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-label-sm text-on-surface-variant animate-pulse">Gemini processando padrões de mercado...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                        <span className="font-label-sm text-[10px] text-on-surface-variant block mb-0.5">Tendência IA</span>
                        <span className={`font-label-md text-[13px] font-bold flex items-center gap-1 ${
                          aiAnalysis?.trend === 'Bullish' ? 'text-primary' : aiAnalysis?.trend === 'Bearish' ? 'text-error' : 'text-on-surface'
                        }`}>
                          {aiAnalysis?.trend === 'Bullish' && <TrendingUp size={12} />}
                          {aiAnalysis?.trend === 'Bearish' && <TrendingDown size={12} />}
                          {aiAnalysis?.trend || 'Neutro'}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                        <span className="font-label-sm text-[10px] text-on-surface-variant block mb-0.5">Risco</span>
                        <span className={`font-label-md text-[13px] font-bold ${
                          aiAnalysis?.risk === 'Low' ? 'text-primary' : aiAnalysis?.risk === 'High' ? 'text-error' : 'text-warning'
                        }`}>
                          {aiAnalysis?.risk === 'Low' ? 'Baixo' : aiAnalysis?.risk === 'High' ? 'Alto' : 'Moderado'}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                        <span className="font-label-sm text-[10px] text-on-surface-variant block mb-0.5">Padrão Estrutural</span>
                        <span className="font-label-md text-[12px] text-on-surface font-bold truncate block">
                          {aiAnalysis?.structure || 'Consolidação'}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                        <span className="font-label-sm text-[10px] text-on-surface-variant block mb-0.5">Confiança IA</span>
                        <span className="font-label-md text-[13px] text-secondary-container font-bold block">
                          {aiAnalysis?.confidence || 50}%
                        </span>
                      </div>
                    </div>

                    {/* Explicação da IA */}
                    {aiAnalysis?.explanation && (
                      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
                        <span className="font-label-sm text-[11px] text-on-surface-variant font-bold block mb-1">Análise Contextual</span>
                        <p className="text-[12px] text-on-surface/90 leading-relaxed font-sans">
                          {aiAnalysis.explanation}
                        </p>
                      </div>
                    )}

                    {/* Conclusão Operacional */}
                    {aiAnalysis?.conclusion && (
                      <div className="bg-secondary-container/10 border border-secondary-container/30 p-3 rounded-lg flex gap-2.5 items-start">
                        <CheckCircle2 className="text-secondary-container mt-0.5 shrink-0" size={15} />
                        <div>
                          <span className="font-label-sm text-[11px] text-secondary-container font-bold block mb-0.5">
                            Conclusão Operacional
                          </span>
                          <p className="text-[12px] text-on-surface/90 leading-snug">
                            {aiAnalysis.conclusion}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sinais do Scanner & Explicação */}
              <div className="bg-surface-container-high/40 border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-primary" size={16} />
                  <h4 className="font-headline-md text-[14px] font-bold text-on-surface uppercase tracking-wide">
                    Sinais Técnicos Mapeados
                  </h4>
                </div>

                <div className="space-y-2">
                  {/* RSI */}
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                    <span className="text-[12px] text-on-surface font-medium">Índice de Força Relativa (RSI-14)</span>
                    <div className="text-right">
                      <span className={`text-[12px] font-bold block ${
                        selectedAsset.signals.some(s => s.type === 'rsi' && s.status === 'Sobrecomprado') ? 'text-error' :
                        selectedAsset.signals.some(s => s.type === 'rsi' && s.status === 'Sobrevendido') ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {marketData[selectedAsset.symbol]?.rsi || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* EMA */}
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                    <span className="text-[12px] text-on-surface font-medium">Médias Móveis (EMA 9/21)</span>
                    <div className="text-right flex items-center gap-1">
                      <span className="text-[11px] text-[#38bdf8] font-bold">
                        {marketData[selectedAsset.symbol]?.ema9 || '0'}
                      </span>
                      <span className="text-on-surface-variant text-[10px]">/</span>
                      <span className="text-[11px] text-[#4b8eff] font-bold">
                        {marketData[selectedAsset.symbol]?.ema21 || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30">
                    <span className="text-[12px] text-on-surface font-medium">Volume Atual</span>
                    <span className="text-[11px] text-on-surface font-mono font-bold">
                      {marketData[selectedAsset.symbol]?.volume.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Explicação Curta do Scanner */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 mt-1">
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-bold block mb-1">Explicação Curta (Sinais)</span>
                  <p className="text-[12px] text-on-surface/90 leading-relaxed">
                    {selectedAsset.signals.length > 0 ? (
                      `O score de oportunidade de ${selectedAsset.score} foi determinado devido aos seguintes eventos técnicos: ${selectedAsset.signals.map(s => {
                        if (s.type === 'rsi') return `RSI em patamar extremo (${s.status})`;
                        if (s.type === 'ema') return `Cruzamento recente das médias rápidas (${s.status})`;
                        if (s.type === 'volume') return `Aumento anormal no volume de negociação (${s.status})`;
                        if (s.type === 'breakout') return `Rompimento da faixa de preço de curto prazo (${s.status})`;
                        if (s.type === 'change') return `Movimento percentual brusco e veloz (${s.status})`;
                        return s.status;
                      }).join(', ')}.`
                    ) : (
                      `O mercado para ${selectedAsset.name} está em um estado de baixa volatilidade ou consolidação neutra no timeframe selecionado, sem sinais técnicos extremos mapeados.`
                    )}
                  </p>
                </div>
              </div>

            </div>

            {/* Rodapé do Drawer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant bg-surface/95 flex gap-3 shrink-0">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 text-on-surface font-label-md py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer do Scanner */}
      <footer className="bg-surface-container-low border-t border-outline-variant fixed bottom-0 left-64 right-0 flex justify-between items-center h-12 px-6 z-40">
        <div className="flex items-center gap-4">
          <span className="font-label-md text-label-md font-bold text-on-surface">
            © 2024 HUNTER TRADE OS - Scanner Real-Time Engine
          </span>
          <div className="h-4 w-px bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="text-on-surface-variant text-[11px] font-label-sm">
              Análise contínua ativa para 8 ativos
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
