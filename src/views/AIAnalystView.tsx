import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Volume2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Layers,
  BookOpen,
  Info,
  Clock,
  Shield,
  HelpCircle,
  BarChart3
} from 'lucide-react';

type Level = 'iniciante' | 'intermediario' | 'avancado';

export function AIAnalystView() {
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
    symbols
  } = useMarket();

  const [level, setLevel] = useState<Level>('iniciante');

  // Garante que a análise técnica seja rodada sempre que trocar símbolo ou timeframe
  useEffect(() => {
    if (marketData[activeSymbol]) {
      runAIAnalysis();
    }
  }, [activeSymbol, activeTimeframe]);

  const currentData = marketData[activeSymbol];

  // Formatação de preço customizada por ativo
  const formatPrice = (symbol: string, val: number) => {
    if (!val) return '0.00';
    if (symbol === 'USDJPY=X') return val.toFixed(2);
    if (symbol === 'XAUUSD=X') return val.toFixed(2);
    if (symbol === 'XRPUSDT') return val.toFixed(4);
    if (symbol.endsWith('USDT')) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toFixed(4);
  };

  // Formatação de volume
  const formatVolume = (val: number) => {
    if (!val) return '0';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
    return Math.round(val).toString();
  };

  // ----------------------------------------------------
  // SEÇÃO 4: Algoritmos de Detecção de Estrutura
  // ----------------------------------------------------
  const detectMarketStructure = () => {
    if (!currentData || !currentData.candles || currentData.candles.length < 30) {
      return {
        bos: 'Aguardando mais dados históricos...',
        choch: 'Aguardando mais dados históricos...',
        range: 'Calculando canal...',
        trend: 'Neutro',
        liquidity: 'Buscando pools de liquidez...'
      };
    }

    const candles = currentData.candles;
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const currentPrice = currentData.price;

    // 1. Range (últimos 30 candles)
    const recentHighs = highs.slice(-30);
    const recentLows = lows.slice(-30);
    const rangeMax = Math.max(...recentHighs);
    const rangeMin = Math.min(...recentLows);
    const range = `${formatPrice(activeSymbol, rangeMin)} — ${formatPrice(activeSymbol, rangeMax)}`;

    // 2. Tendência (combinação de EMA200 e EMAs curtas)
    const isAboveEma200 = currentPrice > currentData.ema200;
    const isFastAboveSlow = currentData.ema9 > currentData.ema21;
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
    // Procuramos se o candle atual rompeu a máxima/mínima dos 20 candles anteriores (excluindo os 3 últimos para evitar ruído)
    const lookbackCandles = candles.slice(-25, -3);
    const prevMax = Math.max(...lookbackCandles.map(c => c.high));
    const prevMin = Math.min(...lookbackCandles.map(c => c.low));

    let bos = 'Nenhum rompimento recente confirmado';
    if (currentPrice > prevMax && isAboveEma200) {
      bos = `Bullish BOS confirmado em ${formatPrice(activeSymbol, prevMax)}`;
    } else if (currentPrice < prevMin && !isAboveEma200) {
      bos = `Bearish BOS confirmado em ${formatPrice(activeSymbol, prevMin)}`;
    }

    // 4. CHoCH (Change of Character)
    // Mudança de caráter: médias curtas cruzaram recentemente nos últimos 5 candles, contrariando a tendência macro de longo prazo
    let choch = 'Estrutura de momentum mantida';
    if (candles.length >= 7) {
      const currentCross = currentData.ema9 > currentData.ema21;
      const oldCandle = candles[candles.length - 6];
      const oldCross = (oldCandle.ema9 || 0) > (oldCandle.ema21 || 0);

      if (currentCross !== oldCross) {
        if (currentCross) {
          choch = `Bullish CHoCH (Reversão de Momentum em ${formatPrice(activeSymbol, currentPrice)})`;
        } else {
          choch = `Bearish CHoCH (Reversão de Momentum em ${formatPrice(activeSymbol, currentPrice)})`;
        }
      }
    }

    // 5. Liquidez Simples (Equal Highs / Equal Lows com tolerância de 0.08%)
    let liquidity = `Liquidez acumulada acima de ${formatPrice(activeSymbol, rangeMax)} (Stops de venda) e abaixo de ${formatPrice(activeSymbol, rangeMin)} (Stops de compra)`;
    
    // Procura por topos duplos na amostragem recente
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
      liquidity = `Equal Highs em ${formatPrice(activeSymbol, eqhVal)} (Piscina de Liquidez acima) & Equal Lows em ${formatPrice(activeSymbol, eqlVal)} (Piscina de Liquidez abaixo)`;
    } else if (foundEqh) {
      liquidity = `Buy-side Liquidity (EQH) detectada em ${formatPrice(activeSymbol, eqhVal)} (Topos Relativamente Iguais)`;
    } else if (foundEql) {
      liquidity = `Sell-side Liquidity (EQL) detectada em ${formatPrice(activeSymbol, eqlVal)} (Fundos Relativamente Iguais)`;
    }

    return { range, trend, bos, choch, liquidity };
  };

  const structures = detectMarketStructure();

  // ----------------------------------------------------
  // SEÇÃO 3: Lógica de Textos do Professor IA
  // ----------------------------------------------------
  const getProfessorContent = (lvl: Level) => {
    const isBullish = aiAnalysis?.trend === 'Bullish' || (currentData && currentData.price > currentData.ema200);
    const rsi = currentData?.rsi || 50;
    const isRsiOver = rsi > 68;
    const isRsiUnder = rsi < 32;

    if (lvl === 'iniciante') {
      return {
        what: isBullish 
          ? `O mercado do ativo ${activeSymbol} está subindo. Há mais força compradora no momento, o que faz com que o preço atual esteja sendo negociado acima do seu valor médio dos últimos tempos.`
          : `O preço do ativo ${activeSymbol} está caindo. A força vendedora está dominante neste momento, empurrando o preço abaixo das suas médias históricas de mercado.`,
        why: isRsiOver 
          ? `A alta recente foi muito rápida e forte, levando o indicador RSI acima de 70. Isso significa que o ativo está 'sobrecomprado' (ou seja, subiu rápido demais e pode precisar de uma pausa ou pequena queda logo).`
          : isRsiUnder 
          ? `A queda recente foi muito forte, empurrando o indicador RSI abaixo de 30. Isso sinaliza que o ativo está 'sobrevendido' (barato no curto prazo) e muitos investidores podem começar a comprar buscando um repique.`
          : isBullish 
          ? `As médias rápidas (as linhas de 9 e 21 períodos) estão acima da média de longo prazo (de 200 períodos), criando uma confluência saudável de tendência de alta.`
          : `O preço não consegue romper as médias móveis rápidas e permanece abaixo da média de longo prazo (200 períodos), indicando que os vendedores continuam no controle absoluto do movimento.`,
        how: `Observe a inclinação das médias móveis rápidas no seu gráfico. Quando a linha curta (EMA 9) está apontando para cima e cruzando acima da linha lenta (EMA 21), e o preço se mantém em alta, o padrão está se formando.`,
        when: `Esse comportamento de alta ou baixa simples costuma falhar quando o mercado entra em 'consolidação' (andando de lado). Nesses momentos, o preço cruza as médias para cima e para baixo toda hora, gerando sinais confusos.`,
        error: `O erro mais clássico do iniciante é comprar no desespero da alta ('FOMO') ou vender no pânico da queda. O correto é sempre esperar o preço voltar nas médias móveis (pullback) para efetuar operações mais seguras.`
      };
    } else if (lvl === 'intermediario') {
      return {
        what: isBullish
          ? `Temos uma estrutura de mercado autista ativa. O preço está estabelecendo fundos e topos ascendentes, encontrando forte suporte nas médias rápidas EMA 9 e EMA 21.`
          : `Estrutura de mercado baixista confirmada. O ativo vem trabalhando em pivôs de baixa sucessivos, com as médias de 9 e 21 atuando como fortes resistências dinâmicas.`,
        why: isRsiOver
          ? `O momentum comprador atingiu a zona de exaustão de curto prazo (RSI > 70). As compras ficam caras no topo do canal dinâmico, necessitando de uma retração técnica saudável até a região de valor médio da EMA 21.`
          : isRsiUnder
          ? `A pressão vendedora levou o RSI a níveis extremos de sobrevenda (RSI < 30). Isso costuma atrair robôs de arbitragem e traders de reversão que buscam explorar o desvio padrão de preço até a EMA 9 ou 21.`
          : `O alinhamento harmônico das EMAs (9 acima da 21, e ambas acima da 200) corrobora uma expansão de volume consistente na direção compradora, validando a sustentação do preço.`,
        how: `Mapeie os pivôs. Para confirmar uma tendência de alta saudável, espere o preço romper o topo anterior (BOS) e, no retorno do preço, busque gatilhos de rejeição (velas com pavios inferiores longos) nas EMAs 9 ou 21.`,
        when: `O padrão falha quando há divergência de oscilação entre preço e indicadores. Por exemplo, se o preço atinge uma nova máxima histórica, mas o RSI registra uma máxima mais baixa (divergência de baixa no RSI).`,
        error: `Posicionar o stop-loss colado demais à média móvel rápida. As médias servem como guias visuais de valor dinâmico, mas o mercado costuma sofrer ruídos ('violinar' ou violar temporariamente a média) antes de continuar a tendência.`
      };
    } else { // avançado
      return {
        what: isBullish
          ? `O mercado demonstra um fluxo de ordens (Order Flow) institucional predominantemente altista, caracterizado pela quebra contínua de estruturas de oferta (BOS) e mitigação contínua de blocos de ordens (Order Blocks) de demanda.`
          : `Estrutura institucional sob forte viés de distribuição. O ativo apresenta quebras sucessivas de estruturas de suporte (Bearish BOS) e rejeição persistente de liquidez na faixa de desconto das médias exponenciais.`,
        why: isRsiOver
          ? `Há um desequilíbrio estrutural (imbalance) com exaustão de compradores passivos. O RSI em nível sobrecomprado denota absorção institucional da oferta. Operações de continuação exigem retração de Fibonacci à zona de desconto (0.5 - 0.618) para capturar nova liquidez.`
          : isRsiUnder
          ? `Mitigação de stops de compra institucionais ativando liquidez de venda em sobrevenda extrema (RSI < 30). Espera-se a formação de um padrão de acumulação de Wyckoff na zona de demanda antes de qualquer reversão estrutural sustentável.`
          : `A confluência dinâmica do leque de EMAs (9/21/200) atua como zona de valor algorítmico. O momentum de alta é sustentado pela taxa de absorção de ordens na EMA 21 com desvio aceitável de volatilidade implícita.`,
        how: `Analise a quebra de estrutura interna. Aguarde a formação de um CHoCH (Change of Character) em tempos gráficos menores (ex: 5m para operações de 15m), identifique o Fair Value Gap (FVG) gerado pelo movimento impulsivo e insira ordens na retração limite.`,
        when: `Falha sob sweeps de liquidez (captura de stops acima de resistências ou abaixo de suportes sem intenção de dar continuidade ao movimento), configurando armadilhas institucionais típicas de fases de distribuição/acumulação.`,
        error: `Buscar contra-tendência sem confirmação de quebra de estrutura macro. Tentar adivinhar fundos ou topos absolutos operando puramente osciladores saturados (RSI), ignorando o fluxo de volume institucional dominante.`
      };
    }
  };

  const profContent = getProfessorContent(level);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] text-on-background relative overflow-y-auto no-scrollbar pb-24">
      {/* Background Neon Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="bg-[#0c0f16]/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg">
            <Brain className="text-primary animate-pulse" size={22} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
              🧠 AI Analyst
            </h2>
            <p className="font-label-sm text-[11px] text-on-surface-variant/70">
              Análise inteligente de mercado em tempo real
            </p>
          </div>
        </div>

        {/* Seleção de Ativos e Timeframes */}
        <div className="flex items-center gap-3 z-50">
          <div className="flex items-center gap-1.5 bg-[#0e131d]/60 border border-outline-variant/40 rounded-lg p-1">
            {symbols.map(s => (
              <button
                key={s.symbol}
                onClick={() => changeSymbol(s.symbol)}
                className={`px-2.5 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                  activeSymbol === s.symbol
                    ? 'bg-primary text-background font-bold shadow-md shadow-primary/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                }`}
              >
                {s.name.replace('/USD', '')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e131d]/60 border border-outline-variant/40 rounded-lg p-1">
            {['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => changeTimeframe(tf)}
                className={`px-2 py-1 text-[10px] min-w-[30px] rounded transition-all font-mono text-center cursor-pointer ${
                  activeTimeframe === tf
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md shadow-secondary-container/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 max-w-[1400px] w-full mx-auto relative z-10">
        
        {error && (
          <div className="p-4 bg-error/10 border border-error/30 text-error rounded-xl flex items-center gap-3">
            <Info size={20} />
            <div>
              <p className="font-bold text-sm">Ocorreu um erro no feed de dados</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* SEÇÃO 1: Ativo Atual e Métricas */}
        <div className="glass-panel backdrop-blur-md bg-[#0e131d]/40 border border-outline-variant/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Info Principal do Ativo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center font-bold text-primary font-mono text-lg">
                {activeSymbol.substring(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-xl font-bold text-on-surface">
                    {currentData?.name || 'Carregando...'}
                  </h3>
                  <span className="bg-[#0f1c1b] text-primary border border-primary/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
                    {currentData?.type === 'crypto' ? 'Cripto' : 'Forex'}
                  </span>
                  <span className="bg-[#121c2c] text-secondary-container border border-secondary-container/20 text-[9px] px-1.5 py-0.5 rounded font-mono">
                    {activeTimeframe}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="font-mono text-2xl font-black text-on-surface">
                    {currentData ? formatPrice(activeSymbol, currentData.price) : '---'}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${
                    (currentData?.changePercent ?? 0) >= 0 ? 'text-primary' : 'text-error'
                  }`}>
                    {(currentData?.changePercent ?? 0) >= 0 ? '▲' : '▼'}{' '}
                    {currentData ? Math.abs(currentData.changePercent).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de Indicadores Técnicos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-2/3">
              {/* RSI */}
              <div className="bg-[#0e131d]/60 border border-outline-variant/30 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">RSI (14)</span>
                <span className={`font-mono text-lg font-bold mt-1 ${
                  (currentData?.rsi ?? 50) > 70 ? 'text-error' : (currentData?.rsi ?? 50) < 30 ? 'text-primary' : 'text-on-surface'
                }`}>
                  {currentData?.rsi ?? '---'}
                </span>
                <span className="text-[9px] text-on-surface-variant/75 mt-0.5">
                  {(currentData?.rsi ?? 50) > 70 ? 'Sobrecomprado' : (currentData?.rsi ?? 50) < 30 ? 'Sobrevendido' : 'Zona Neutra'}
                </span>
              </div>

              {/* EMA 9 */}
              <div className="bg-[#0e131d]/60 border border-outline-variant/30 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">EMA 9</span>
                <span className="font-mono text-[15px] font-bold mt-1 text-[#38bdf8]">
                  {currentData ? formatPrice(activeSymbol, currentData.ema9) : '---'}
                </span>
                <span className="text-[9px] text-on-surface-variant/75 mt-0.5">Média Curta</span>
              </div>

              {/* EMA 21 */}
              <div className="bg-[#0e131d]/60 border border-outline-variant/30 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">EMA 21</span>
                <span className="font-mono text-[15px] font-bold mt-1 text-[#4b8eff]">
                  {currentData ? formatPrice(activeSymbol, currentData.ema21) : '---'}
                </span>
                <span className="text-[9px] text-on-surface-variant/75 mt-0.5">Média Intermediária</span>
              </div>

              {/* EMA 200 */}
              <div className="bg-[#0e131d]/60 border border-outline-variant/30 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">EMA 200</span>
                <span className="font-mono text-[15px] font-bold mt-1 text-[#e2e8f0]">
                  {currentData ? formatPrice(activeSymbol, currentData.ema200) : '---'}
                </span>
                <span className="text-[9px] text-on-surface-variant/75 mt-0.5">Suporte/Resistência Macro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Meio: Seção 2 (Análise IA) & Seção 4 (Estrutura) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SEÇÃO 2: Análise IA (55% width on large screens) */}
          <div className="lg:col-span-7 glass-panel backdrop-blur-md bg-[#0e131d]/40 border border-outline-variant/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary-container via-primary to-transparent"></div>
            
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-secondary-container animate-pulse" size={18} />
                <h4 className="font-headline-md text-sm font-bold text-on-surface uppercase tracking-wide">
                  Análise Técnica de IA
                </h4>
              </div>
              
              <button 
                onClick={runAIAnalysis}
                disabled={aiLoading}
                className="bg-[#0f172a] hover:bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Activity size={12} className={aiLoading ? 'animate-spin' : ''} />
                Recalcular IA
              </button>
            </div>

            {aiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-label-sm text-on-surface-variant animate-pulse">
                  Alinhando parâmetros e consultando o AI Engine...
                </span>
              </div>
            ) : (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                {/* Métricas Principais da IA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block mb-1">Tendência IA</span>
                    <span className={`text-[14px] font-bold flex items-center gap-1.5 ${
                      aiAnalysis?.trend === 'Bullish' ? 'text-primary' : aiAnalysis?.trend === 'Bearish' ? 'text-error' : 'text-on-surface'
                    }`}>
                      {aiAnalysis?.trend === 'Bullish' && <TrendingUp size={14} />}
                      {aiAnalysis?.trend === 'Bearish' && <TrendingDown size={14} />}
                      {aiAnalysis?.trend === 'Bullish' ? 'Alta (Bull)' : aiAnalysis?.trend === 'Bearish' ? 'Baixa (Bear)' : 'Lateral (Neutral)'}
                    </span>
                  </div>

                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block mb-1">Risco Operacional</span>
                    <span className={`text-[14px] font-bold ${
                      aiAnalysis?.risk === 'Low' ? 'text-primary' : aiAnalysis?.risk === 'High' ? 'text-error' : 'text-warning'
                    }`}>
                      {aiAnalysis?.risk === 'Low' ? 'Baixo' : aiAnalysis?.risk === 'High' ? 'Alto' : 'Moderado'}
                    </span>
                  </div>

                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block mb-1">Estrutura IA</span>
                    <span className="text-[13px] text-on-surface font-bold truncate block" title={aiAnalysis?.structure}>
                      {aiAnalysis?.structure || 'Consolidação'}
                    </span>
                  </div>

                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant block mb-1">Confiança da IA</span>
                    <span className="text-[14px] text-secondary-container font-black block">
                      {aiAnalysis?.confidence || 50}%
                    </span>
                  </div>
                </div>

                {/* Síntese Narrativa */}
                <div className="bg-[#0a0d14]/70 p-4 rounded-xl border border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant font-bold block mb-1.5 uppercase tracking-wider">
                    Síntese Contextual do Analista
                  </span>
                  <p className="text-[12px] text-on-surface/90 leading-relaxed font-sans">
                    {aiAnalysis?.explanation || 'Aguardando inicialização do motor de IA.'}
                  </p>
                </div>

                {/* Conclusão Operacional (Sem indicação direta de compra/venda) */}
                <div className="bg-secondary-container/5 border border-secondary-container/20 p-4 rounded-xl flex gap-3 items-start">
                  <Info className="text-secondary-container shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="text-[10px] text-secondary-container font-bold block mb-1 uppercase tracking-wider">
                      Parecer do Analista (Conclusão)
                    </span>
                    <p className="text-[12px] text-on-surface/90 leading-relaxed">
                      {aiAnalysis?.conclusion || 'Aguardando decisão técnica do motor de IA.'}
                    </p>
                  </div>
                </div>

                {/* Motivos Técnicos */}
                <div className="mt-2">
                  <span className="text-[10px] text-on-surface-variant font-bold block mb-2 uppercase tracking-wider">
                    Motivos Técnicos
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-on-surface/85">
                    {aiAnalysis?.reasons.map((r, i) => (
                      <li key={i} className="flex gap-2 items-start bg-[#0a0d14]/30 p-2 rounded-lg border border-outline-variant/10">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    )) || (
                      <li className="text-on-surface-variant italic">Carregando motivos técnicos...</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 4: Painel Estrutura (45% width on large screens) */}
          <div className="lg:col-span-5 glass-panel backdrop-blur-md bg-[#0e131d]/40 border border-outline-variant/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-secondary-container to-transparent"></div>
            
            <div className="flex items-center gap-2 mb-5">
              <Layers className="text-primary" size={18} />
              <h4 className="font-headline-md text-sm font-bold text-on-surface uppercase tracking-wide">
                Painel Estrutural de Mercado
              </h4>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <span className="text-label-sm text-on-surface-variant">Lendo microestrutura...</span>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Tendência Estrutural */}
                <div className="flex justify-between items-center bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Tendência</span>
                  <span className="text-[12px] font-bold text-on-surface">
                    {structures.trend}
                  </span>
                </div>

                {/* Range de Oscilação */}
                <div className="flex justify-between items-center bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Range Recente</span>
                  <span className="font-mono text-[12px] font-bold text-[#38bdf8]">
                    {structures.range}
                  </span>
                </div>

                {/* Break of Structure (BOS) */}
                <div className="flex justify-between items-center bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">BOS</span>
                  <span className={`text-[12px] font-bold ${
                    structures.bos.includes('Bullish') ? 'text-primary' : structures.bos.includes('Bearish') ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    {structures.bos}
                  </span>
                </div>

                {/* Change of Character (CHoCH) */}
                <div className="flex justify-between items-center bg-[#0a0d14] p-3 rounded-xl border border-outline-variant/20">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">CHoCH</span>
                  <span className={`text-[12px] font-bold ${
                    structures.choch.includes('Bullish') ? 'text-primary' : structures.choch.includes('Bearish') ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    {structures.choch}
                  </span>
                </div>

                {/* Liquidez Simples */}
                <div className="flex flex-col bg-[#0a0d14] p-3.5 rounded-xl border border-outline-variant/20 gap-1.5">
                  <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Liquidez Simples</span>
                  <span className="text-[11px] text-on-surface/90 leading-relaxed">
                    {structures.liquidity}
                  </span>
                </div>

                <div className="bg-[#0e131d]/20 border border-outline-variant/10 rounded-xl p-3 flex gap-2 items-center text-[10px] text-on-surface-variant">
                  <Info size={14} className="shrink-0 text-primary" />
                  <span>A estrutura é recalculada dinamicamente com base nos últimos 30 candles do gráfico.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 5: Linha do pensamento IA */}
        <div className="glass-panel backdrop-blur-md bg-[#0e131d]/40 border border-outline-variant/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-secondary-container" size={18} />
            <h4 className="font-headline-md text-sm font-bold text-on-surface uppercase tracking-wide">
              Linha de Raciocínio da IA
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Preço */}
            <div className="bg-[#0a0d14]/80 border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px] z-10 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Preço Bruto</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Coleta e ingestão de feeds de preços do ativo em tempo real.</p>
              </div>
              <div className="font-mono text-xs font-bold text-on-surface mt-3">
                {activeSymbol} @ {currentData ? formatPrice(activeSymbol, currentData.price) : '---'}
              </div>
            </div>

            {/* Setas (só em md/lg) */}
            <div className="hidden md:flex absolute top-1/2 left-[23%] translate-y-[-50%] z-20 text-primary opacity-60">
              <ArrowRight size={18} />
            </div>

            {/* Step 2: Indicadores */}
            <div className="bg-[#0a0d14]/80 border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px] z-10 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Cálculo de Indicadores</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Processamento matemático das médias exponenciais rápidas/lentas e do RSI.</p>
              </div>
              <div className="font-mono text-[11px] font-bold text-[#38bdf8] mt-3">
                RSI: {currentData?.rsi || '50'} | EMA9 vs EMA21
              </div>
            </div>

            <div className="hidden md:flex absolute top-1/2 left-[48%] translate-y-[-50%] z-20 text-primary opacity-60">
              <ArrowRight size={18} />
            </div>

            {/* Step 3: Estrutura */}
            <div className="bg-[#0a0d14]/80 border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px] z-10 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Mapeamento Estrutural</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Detecção de quebras de suporte/resistência (BOS/CHoCH) e ranges.</p>
              </div>
              <div className="text-[11px] font-bold text-secondary-container mt-3 truncate">
                {structures.trend}
              </div>
            </div>

            <div className="hidden md:flex absolute top-1/2 left-[73%] translate-y-[-50%] z-20 text-primary opacity-60">
              <ArrowRight size={18} />
            </div>

            {/* Step 4: Conclusão */}
            <div className="bg-[#0a0d14]/80 border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[100px] z-10 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-secondary-container/10 border border-secondary-container/30 text-secondary-container font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                  <span className="text-[10px] text-secondary-container font-bold uppercase tracking-wider">Síntese e Parecer</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Consolidação final no parecer descritivo do analista e do professor.</p>
              </div>
              <div className="text-[11px] font-bold text-primary mt-3 truncate">
                {aiAnalysis?.risk === 'Low' ? 'Risco Baixo' : aiAnalysis?.risk === 'High' ? 'Risco Alto' : 'Risco Moderado'} | Confiança: {aiAnalysis?.confidence}%
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: Professor IA */}
        <div className="glass-panel backdrop-blur-md bg-[#0e131d]/40 border border-outline-variant/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary-container/5 to-transparent pointer-events-none"></div>
          
          {/* Header Professor */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="text-secondary-container" size={24} />
              <div>
                <h3 className="font-headline-md text-[16px] font-bold text-on-surface">
                  Academia IA — Professor Virtual
                </h3>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  Aprenda a ler a estrutura de mercado atual como um profissional
                </p>
              </div>
            </div>

            {/* Alternância de Nível */}
            <div className="flex bg-[#0a0d14] border border-outline-variant/40 rounded-xl p-1 shrink-0">
              {(['iniciante', 'intermediario', 'avancado'] as Level[]).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-1.5 text-[11px] rounded-lg transition-all font-label-md capitalize cursor-pointer ${
                    level === lvl
                      ? 'bg-secondary-container text-on-secondary-container font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Explicações Didáticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* O que aconteceu */}
            <div className="bg-[#0a0d14]/50 border border-outline-variant/25 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant/50 transition-colors">
              <div>
                <span className="text-[10px] text-secondary-container font-bold uppercase tracking-wider block mb-2">
                  1. O que aconteceu?
                </span>
                <p className="text-[12px] text-on-surface/90 leading-relaxed">
                  {profContent.what}
                </p>
              </div>
            </div>

            {/* Por que aconteceu */}
            <div className="bg-[#0a0d14]/50 border border-outline-variant/25 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant/50 transition-colors">
              <div>
                <span className="text-[10px] text-secondary-container font-bold uppercase tracking-wider block mb-2">
                  2. Por que aconteceu?
                </span>
                <p className="text-[12px] text-on-surface/90 leading-relaxed">
                  {profContent.why}
                </p>
              </div>
            </div>

            {/* Como identificar novamente */}
            <div className="bg-[#0a0d14]/50 border border-outline-variant/25 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant/50 transition-colors">
              <div>
                <span className="text-[10px] text-secondary-container font-bold uppercase tracking-wider block mb-2">
                  3. Como identificar novamente?
                </span>
                <p className="text-[12px] text-on-surface/90 leading-relaxed">
                  {profContent.how}
                </p>
              </div>
            </div>

            {/* Quando falha */}
            <div className="bg-[#0a0d14]/50 border border-outline-variant/25 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant/50 transition-colors">
              <div>
                <span className="text-[10px] text-error font-bold uppercase tracking-wider block mb-2">
                  4. Quando falha? (Pontos de Atenção)
                </span>
                <p className="text-[12px] text-on-surface/90 leading-relaxed">
                  {profContent.when}
                </p>
              </div>
            </div>

            {/* Erro comum de iniciante */}
            <div className="bg-[#0a0d14]/50 border border-outline-variant/25 rounded-xl p-4 flex flex-col justify-between hover:border-outline-variant/50 transition-colors md:col-span-2 xl:col-span-1">
              <div>
                <span className="text-[10px] text-warning font-bold uppercase tracking-wider block mb-2">
                  5. Erro comum de iniciante
                </span>
                <p className="text-[12px] text-on-surface/90 leading-relaxed">
                  {profContent.error}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
