import {
  Activity,
  ArrowUp,
  ArrowDown,
  Brain,
  Droplets,
  Filter,
  LineChart,
  MapPin,
  MoreVertical,
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Candle } from '../services/marketEngine';

export function DashboardView() {
  const {
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
    symbols,
  } = useMarket();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown de busca se o usuário clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAssetData = marketData[activeSymbol];
  const decimals = activeSymbol === 'USDJPY=X' || activeSymbol === 'XAUUSD=X' || activeSymbol === 'XRPUSDT' ? 4 : 2;

  // Formata preço de acordo com o ativo
  const formatValue = (val: number) => {
    if (activeSymbol === 'USDJPY=X') return val.toFixed(2);
    if (activeSymbol === 'XAUUSD=X') return val.toFixed(2);
    if (activeSymbol === 'XRPUSDT') return val.toFixed(4);
    if (activeSymbol.endsWith('USDT')) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toFixed(4);
  };

  // Filtra lista de ativos
  const filteredSymbols = symbols.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Candles e limites do gráfico
  const candles = activeAssetData?.candles || [];
  const visibleCount = 28; // quantidade ideal de candles visíveis
  const visibleCandles = candles.slice(-visibleCount);

  const pricesHigh = visibleCandles.map((c) => c.high);
  const pricesLow = visibleCandles.map((c) => c.low);
  const maxPrice = pricesHigh.length > 0 ? Math.max(...pricesHigh) : 100;
  const minPrice = pricesLow.length > 0 ? Math.min(...pricesLow) : 0;
  const priceRange = maxPrice - minPrice || 1;

  // Adiciona margem de 5% no topo e na base do gráfico para visualização limpa
  const chartMax = maxPrice + priceRange * 0.05;
  const chartMin = minPrice - priceRange * 0.05;
  const chartRange = chartMax - chartMin || 1;

  // Eixo Y: 5 níveis de preço
  const yTicksCount = 5;
  const yPriceTicks = Array.from({ length: yTicksCount }).map((_, idx) => {
    return chartMax - (chartRange / (yTicksCount - 1)) * idx;
  });

  // Eixo X: Rótulos de tempo dos candles a cada 5 candles
  const xTicks = visibleCandles.filter((_, idx) => idx % 5 === 0);

  // Máximo do volume visível para escala
  const maxVolume = visibleCandles.length > 0 ? Math.max(...visibleCandles.map((c) => c.volume)) : 100;

  // Geração de caminhos SVG para as EMAs
  const generateEmaPath = (emaKey: 'ema9' | 'ema21' | 'ema200') => {
    if (visibleCandles.length < 2) return '';
    const points = visibleCandles.map((candle, idx) => {
      const val = candle[emaKey] || candle.close;
      const x = (idx / (visibleCount - 1)) * 100; // percentual horizontal
      const y = ((chartMax - val) / chartRange) * 100; // percentual vertical (de cima para baixo)
      return { x, y };
    });

    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  };

  const ema9Path = generateEmaPath('ema9');
  const ema21Path = generateEmaPath('ema21');
  const ema200Path = generateEmaPath('ema200');

  // Variação percentual formatada
  const changePercent = activeAssetData?.changePercent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-4 w-64 relative" ref={searchContainerRef}>
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary-container transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar ativos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-1.5 pl-9 pr-4 text-on-surface font-label-sm focus:border-secondary-container focus:ring-1 focus:ring-secondary-container/50 focus:outline-none transition-all placeholder-on-surface-variant/50"
            />
          </div>

          {/* Dropdown de Busca Ativa */}
          {searchFocused && (
            <div className="absolute top-12 left-0 right-0 bg-surface-container-high border border-outline-variant rounded-xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
              <div className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider px-3 py-1 border-b border-outline-variant/30 mb-1">
                Ativos Disponíveis
              </div>
              {filteredSymbols.length > 0 ? (
                filteredSymbols.map((item) => {
                  const itemData = marketData[item.symbol];
                  const isSelected = item.symbol === activeSymbol;
                  return (
                    <button
                      key={item.symbol}
                      onMouseDown={() => {
                        changeSymbol(item.symbol);
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-surface-variant/50 text-on-surface'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md">{item.name}</span>
                        <span className="text-[10px] text-on-surface-variant capitalize">{item.type}</span>
                      </div>
                      {itemData && (
                        <span className="font-mono text-label-sm text-on-surface-variant">
                          {formatValue(itemData.price)}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-label-sm text-on-surface-variant">Nenhum ativo encontrado</div>
              )}
            </div>
          )}
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-1">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => {
            const isActive = tf === activeTimeframe;
            return (
              <button
                key={tf}
                onClick={() => changeTimeframe(tf)}
                className={`px-3 py-1 rounded transition-all font-label-md cursor-pointer ${
                  isActive
                    ? 'text-primary bg-surface-container-high border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary opacity-80'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-4 hidden md:flex">
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors opacity-80 font-label-md capitalize">
            {activeAssetData?.type || 'Mercado'}
          </button>
          <div className="h-4 w-px bg-outline-variant mx-2"></div>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <Filter size={18} />
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <MoreVertical size={18} />
          </button>
          <button
            onClick={runAIAnalysis}
            disabled={aiLoading || loading}
            className={`bg-primary-container text-on-primary-container font-label-md text-label-md font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(0,240,118,0.2)] ml-2 cursor-pointer ${
              aiLoading ? 'opacity-70 cursor-not-allowed animate-pulse' : ''
            }`}
          >
            <Zap size={16} className="fill-current" />
            {aiLoading ? 'Analisando...' : 'Analyze AI'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="w-full lg:w-[70%] flex flex-col border-r border-outline-variant p-4 gap-4 h-full overflow-y-auto pb-16">
          <div className="flex justify-between items-start">
            <div className="flex items-baseline gap-3">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {activeAssetData?.name || 'Carregando...'}
              </h2>
              <span className="font-headline-md text-headline-md text-primary-container font-mono">
                {activeAssetData ? formatValue(activeAssetData.price) : '0.00'}
              </span>
              <span
                className={`font-label-md text-label-md px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                  isPositive ? 'text-primary bg-primary/10' : 'text-error bg-error/10'
                }`}
              >
                {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-2">
              <div className="bg-surface-container-high border border-outline-variant rounded-full px-3 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Mercado Aberto</span>
              </div>
              <div className="bg-surface-container-high border border-outline-variant rounded-full px-3 py-1 flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Sentimento:</span>
                <span
                  className={`font-label-sm text-label-sm font-bold capitalize ${
                    aiAnalysis?.trend === 'Bullish'
                      ? 'text-primary'
                      : aiAnalysis?.trend === 'Bearish'
                      ? 'text-error'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {aiLoading ? '...' : aiAnalysis?.trend || 'Neutro'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-b border-outline-variant pb-2">
            <div className="flex gap-3 text-label-sm font-label-sm text-on-surface-variant">
              <span className="text-[#38bdf8] font-bold border-b border-[#38bdf8]">EMA 9</span>
              <span className="text-[#4b8eff] font-bold border-b border-[#4b8eff]">EMA 21</span>
              <span className="text-primary border-b border-primary font-bold">EMA 200</span>
              <div className="w-px h-3 bg-outline-variant self-center mx-1"></div>
              <span className="hover:text-primary cursor-pointer border-b border-transparent">MACD</span>
              <span className="text-secondary-container border-b border-secondary-container font-bold">
                RSI (14): {activeAssetData?.rsi || '50'}
              </span>
              <span className="hover:text-primary cursor-pointer border-b border-transparent">VOL</span>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] bg-surface-container-lowest border border-outline-variant rounded-xl relative overflow-hidden flex flex-col group chart-grid">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="font-display-lg text-[120px] font-black text-on-surface">HUNTER OS</span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-on-surface-variant text-label-md">Conectando ao feed de mercado...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative w-full h-full p-4">
                {/* Eixo Y de Preços à Direita */}
                <div className="absolute right-4 top-4 bottom-12 w-16 flex flex-col justify-between items-end font-label-sm text-[10px] text-on-surface-variant font-mono z-30">
                  {yPriceTicks.map((tick, i) => (
                    <span key={i} className="bg-surface-container-lowest/70 backdrop-blur-sm px-1 rounded">
                      {formatValue(tick)}
                    </span>
                  ))}
                </div>

                {/* Eixo X de Tempo na Base */}
                <div className="absolute left-4 right-20 bottom-2 h-4 flex justify-between items-center font-label-sm text-[10px] text-on-surface-variant font-mono z-30">
                  {xTicks.map((candle, idx) => {
                    const date = new Date(candle.time);
                    const formattedTime =
                      activeTimeframe === '1D'
                        ? `${date.getDate()}/${date.getMonth() + 1}`
                        : `${date.getHours().toString().padStart(2, '0')}:${date
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}`;
                    return <span key={idx}>{formattedTime}</span>;
                  })}
                  <span>(Agora)</span>
                </div>

                {/* Área de Desenho dos Candlesticks e Marcador de Preço Atual */}
                <div className="absolute inset-4 right-20 bottom-12 flex items-end justify-around gap-[2px] px-1 z-20">
                  {visibleCandles.map((candle, idx) => {
                    const isBullish = candle.close >= candle.open;
                    const colorClass = isBullish ? 'bg-primary-container' : 'bg-error';
                    const shadowColorClass = isBullish ? 'bg-primary-container' : 'bg-error';

                    // Altura e bottom do corpo em porcentagem da área visível
                    const bodyHigh = Math.max(candle.open, candle.close);
                    const bodyLow = Math.min(candle.open, candle.close);

                    const bodyHeightPct = ((bodyHigh - bodyLow) / chartRange) * 100;
                    const bodyBottomPct = ((bodyLow - chartMin) / chartRange) * 100;

                    // Altura e bottom da sombra (pavio)
                    const shadowHeightPct = ((candle.high - candle.low) / chartRange) * 100;
                    const shadowBottomPct = ((candle.low - chartMin) / chartRange) * 100;

                    const isLastCandle = idx === visibleCandles.length - 1;

                    return (
                      <div key={idx} className="relative flex-1 max-w-[14px] min-w-[3px] h-full group/candle">
                        {/* Pavio (Sombra) */}
                        <div
                          className={`absolute w-[1px] ${shadowColorClass} opacity-80`}
                          style={{
                            height: `${shadowHeightPct}%`,
                            bottom: `${shadowBottomPct}%`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        />

                        {/* Corpo do candle */}
                        <div
                          className={`absolute w-full rounded-sm ${colorClass} transition-all duration-300 ${
                            isLastCandle && isBullish ? 'shadow-[0_0_12px_rgba(0,240,118,0.6)] animate-pulse' : ''
                          }`}
                          style={{
                            height: `${Math.max(bodyHeightPct, 1.5)}%`,
                            bottom: `${bodyBottomPct}%`,
                          }}
                        >
                          {/* Tooltip Hover no Candle */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/candle:flex flex-col bg-surface-container-high border border-outline-variant rounded p-2 text-[9px] font-mono text-on-surface z-50 pointer-events-none whitespace-nowrap shadow-xl">
                            <div>O: {formatValue(candle.open)}</div>
                            <div>H: {formatValue(candle.high)}</div>
                            <div>L: {formatValue(candle.low)}</div>
                            <div>C: {formatValue(candle.close)}</div>
                            <div>V: {Math.round(candle.volume)}</div>
                          </div>

                          {/* Se for o último candle, desenha a linha horizontal de preço dinâmico */}
                          {isLastCandle && (
                            <>
                              <div
                                className="absolute right-[-74px] top-1/2 -translate-y-1/2 bg-primary-container text-on-primary-container text-[10px] px-1 py-0.5 rounded font-mono font-bold whitespace-nowrap z-50 shadow-[0_0_8px_rgba(0,240,118,0.4)]"
                                style={{
                                  transform: 'translateY(-50%)',
                                }}
                              >
                                {formatValue(activeAssetData.price)}
                              </div>
                              <div
                                className="absolute right-0 top-1/2 w-[2000px] h-px bg-primary-container/45 border-t border-dashed border-primary-container/70 pointer-events-none z-10"
                                style={{
                                  transform: 'translateX(-2000px)',
                                }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Curvas SVG das EMAs (9, 21, 200) */}
                <svg
                  className="absolute inset-4 right-20 bottom-12 w-[calc(100%-1.5rem)] h-[calc(100%-4rem)] pointer-events-none z-15"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  {/* Linha EMA 200 (Cinza Tracejada) */}
                  {ema200Path && (
                    <path
                      d={ema200Path}
                      fill="none"
                      stroke="#e1e2e6"
                      strokeDasharray="4 2"
                      strokeWidth="1.2"
                      className="opacity-40"
                    />
                  )}
                  {/* Linha EMA 21 (Azul) */}
                  {ema21Path && <path d={ema21Path} fill="none" stroke="#4b8eff" strokeWidth="1.5" className="opacity-70" />}
                  {/* Linha EMA 9 (Ciano) */}
                  {ema9Path && <path d={ema9Path} fill="none" stroke="#38bdf8" strokeWidth="1.5" className="opacity-80" />}
                </svg>

                {/* Volume de Mercado na Base do Gráfico */}
                <div className="absolute left-4 right-20 bottom-12 h-12 flex items-end justify-around gap-[2px] px-1 border-t border-outline-variant/20 pt-1 z-10">
                  {visibleCandles.map((candle, idx) => {
                    const volHeightPct = maxVolume > 0 ? (candle.volume / maxVolume) * 100 : 0;
                    const volColorClass = candle.close >= candle.open ? 'bg-primary-container/20' : 'bg-error/20';
                    const isLast = idx === visibleCandles.length - 1;

                    return (
                      <div
                        key={idx}
                        className={`flex-1 max-w-[14px] min-w-[3px] ${volColorClass} rounded-t-[1px]`}
                        style={{
                          height: `${Math.max(volHeightPct, 5)}%`,
                          borderTop: isLast ? '1px solid var(--md-sys-color-primary-container)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="hidden lg:flex w-[30%] flex-col p-4 gap-4 h-full overflow-y-auto pb-20">
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-secondary-container"></div>
            <div className="flex items-center gap-2">
              <Brain className="text-secondary-container" size={20} />
              <h3 className="font-headline-md text-[16px] font-bold text-on-surface uppercase tracking-wide">
                IA Analisando Mercado
              </h3>
            </div>

            {/* AI Panel Loading Overlay */}
            {aiLoading ? (
              <div className="flex flex-col gap-3 py-6 items-center justify-center">
                <div className="w-8 h-8 border-3 border-secondary-container border-t-transparent rounded-full animate-spin"></div>
                <span className="text-label-sm text-on-surface-variant animate-pulse">Gemini processando padrões...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Tendência</span>
                    <span
                      className={`font-label-md text-label-md font-bold flex items-center gap-1 ${
                        aiAnalysis?.trend === 'Bullish'
                          ? 'text-primary'
                          : aiAnalysis?.trend === 'Bearish'
                          ? 'text-error'
                          : 'text-on-surface'
                      }`}
                    >
                      <TrendingUp
                        size={14}
                        className={aiAnalysis?.trend === 'Bearish' ? 'rotate-180 text-error' : 'text-primary'}
                      />{' '}
                      {aiAnalysis?.trend || 'Neutro'}
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Estrutura</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate block">
                      {aiAnalysis?.structure || 'Indefinida'}
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Liquidez</span>
                    <span className="font-label-md text-label-md text-secondary-container font-bold">Zona Próxima</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Risco</span>
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        aiAnalysis?.risk === 'Low'
                          ? 'text-primary'
                          : aiAnalysis?.risk === 'High'
                          ? 'text-error'
                          : 'text-warning'
                      }`}
                    >
                      {aiAnalysis?.risk === 'Low' ? 'Baixo' : aiAnalysis?.risk === 'High' ? 'Alto' : 'Moderado'}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface">Confiança da IA</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(0,240,118,0.6)] transition-all duration-500"
                        style={{ width: `${aiAnalysis?.confidence || 50}%` }}
                      ></div>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-primary-container">
                      {aiAnalysis?.confidence || 50}%
                    </span>
                  </div>
                </div>

                {/* Explicação da IA */}
                {aiAnalysis?.explanation && (
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block mb-1">Análise Contextual</span>
                    <p className="font-body-md text-[12px] text-on-surface/90 leading-relaxed">
                      {aiAnalysis.explanation}
                    </p>
                  </div>
                )}

                <div className="bg-secondary-container/10 border border-secondary-container/30 p-3 rounded-lg flex gap-3 items-start">
                  <MapPin className="text-secondary-container mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary-container font-bold block mb-0.5">
                      Conclusão Operacional
                    </span>
                    <p className="font-body-md text-[13px] text-on-surface/90 leading-tight">
                      {aiAnalysis?.conclusion || 'Aguardando sinais adicionais de preço para posicionamento.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-surface-container-high border border-primary-container/30 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-[0_0_15px_rgba(0,240,118,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="text-primary-container" size={18} />
              <h3 className="font-headline-md text-[16px] font-bold text-primary-container uppercase tracking-wide">
                Gatilhos de Decisão
              </h3>
            </div>
            <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-container font-bold text-[12px]">
                  RSI
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Indicador</span>
                  <span className="font-headline-md text-[14px] font-bold text-on-surface block">Força Relativa</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block">Valor Atual</span>
                <span className="font-headline-md text-[15px] font-bold text-primary-container block">
                  {activeAssetData?.rsi || '50'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Motivos do AI Engine:</span>
              <ul className="font-label-sm text-[12px] text-on-surface flex flex-col gap-1.5 list-none">
                {aiLoading ? (
                  <li className="text-on-surface-variant animate-pulse">Carregando motivos...</li>
                ) : aiAnalysis?.reasons && aiAnalysis.reasons.length > 0 ? (
                  aiAnalysis.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 leading-tight">
                      <LineChart className="text-secondary-container mt-0.5 shrink-0" size={13} />
                      <span>{reason}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2 leading-tight">
                      <LineChart className="text-secondary-container mt-0.5 shrink-0" size={13} />
                      Preço sendo negociado em relação às médias móveis principais.
                    </li>
                    <li className="flex items-start gap-2 leading-tight">
                      <Droplets className="text-secondary-container mt-0.5 shrink-0" size={13} />
                      Monitoramento de volume dinâmico ativo.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant fixed bottom-0 left-64 right-0 flex justify-between items-center h-12 px-6 z-40">
        <div className="flex items-center gap-4">
          <span className="font-label-md text-label-md font-bold text-on-surface">
            © 2024 HUNTER TRADE OS - Precision Grade AI
          </span>
          <div className="h-4 w-px bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-3 hidden lg:flex">
            <span className="text-on-surface-variant text-sm">Quick History:</span>
            <div className="flex items-center gap-2">
              <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface text-xs border border-outline-variant/50 cursor-pointer hover:border-primary-container transition-colors">
                BTC Long (Win)
              </span>
              <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface text-xs border border-outline-variant/50 cursor-pointer hover:border-primary-container transition-colors">
                ETH Alert Setup
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
