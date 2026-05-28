import React, { useState } from 'react';
import { useSimulatorEngine, PositionType } from '../hooks/useSimulatorEngine';
import { 
  Play, Pause, SkipForward, SkipBack, FastForward, 
  Settings, Target, Activity, BrainCircuit, 
  TrendingUp, TrendingDown, DollarSign, Crosshair,
  AlertOctagon, CheckCircle2, Save, Flag
} from 'lucide-react';

export function SimulatorView() {
  const engine = useSimulatorEngine();
  const {
    mode, setMode, symbol, setSymbol, timeframe, setTimeframe, speed, setSpeed,
    status, startSimulation, play, pause, nextCandleAction, prevCandleAction, reset,
    currentCandle, visibleCandles, currentStructure,
    balance, currentEquity, equityPercentChange, position, unrealizedPnL, tradeHistory,
    executeOrder, closePosition, challenge, generateReport
  } = engine;

  // Local state para o form de ordem
  const [orderSize, setOrderSize] = useState(100);
  const [orderTp, setOrderTp] = useState('');
  const [orderSl, setOrderSl] = useState('');

  const handleExecute = (type: PositionType) => {
    const tp = orderTp ? parseFloat(orderTp) : null;
    const sl = orderSl ? parseFloat(orderSl) : null;
    executeOrder(type, orderSize, sl, tp);
  };

  const saveToEvolution = () => {
    const report = generateReport();
    
    const studyMemoryRaw = localStorage.getItem('@hunter:studyMemory');
    let studyMemory = [];
    if (studyMemoryRaw) {
      try { studyMemory = JSON.parse(studyMemoryRaw); } catch(e){}
    }

    const newStudy = {
      id: `sim-${Date.now()}`,
      symbol: symbol,
      assetName: `SIMULAÇÃO (${mode.toUpperCase()}) - ${symbol}`,
      rsi: currentCandle?.rsi || 50,
      ema: `EMA9: ${currentCandle?.ema9} / EMA21: ${currentCandle?.ema21}`,
      estrutura: currentStructure?.trend || 'Desconhecida',
      conclusaoIA: `Nota ${report.score}. ROI: ${report.roi.toFixed(2)}%. Trades: ${report.trades}`,
      score: report.score,
      horario: new Date().toLocaleString('pt-BR'),
      timestamp: Date.now(),
      resultadoObservado: report.isWin ? 'Subiu' : 'Caiu', // Usado na aba de evolução para validar wins
      alertaId: `simulator-${mode}`,
      expectedDirection: report.isWin ? 'Alta' : 'Baixa'
    };

    studyMemory.unshift(newStudy);
    localStorage.setItem('@hunter:studyMemory', JSON.stringify(studyMemory));
    reset(); // Volta para tela inicial
  };

  if (status === 'setup') {
    return (
      <div className="flex-1 h-full bg-background flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="glass-panel max-w-xl w-full rounded-2xl p-8 z-10 border border-outline-variant/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
              <Crosshair className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-[24px] font-black font-headline-lg text-on-surface leading-tight">Simulator V1</h1>
              <p className="text-on-surface-variant text-[13px]">Treinamento Prático & Laboratório Operacional</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Ativo</label>
                <select 
                  value={symbol} 
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary outline-none text-[14px]"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="XRPUSDT">XRP/USDT</option>
                  <option value="EURUSD=X">EUR/USD</option>
                  <option value="GBPUSD=X">GBP/USD</option>
                  <option value="XAUUSD=X">XAU/USD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Timeframe</label>
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary outline-none text-[14px]"
                >
                  <option value="1m">1 Minuto</option>
                  <option value="5m">5 Minutos</option>
                  <option value="15m">15 Minutos</option>
                  <option value="1h">1 Hora</option>
                  <option value="4h">4 Horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Modo de Operação</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('free')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'free' ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-on-surface-variant/50'}`}
                >
                  <Activity size={24} />
                  <span className="font-bold text-[13px]">Treino Livre</span>
                </button>
                <button
                  onClick={() => setMode('challenge')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'challenge' ? 'bg-secondary-container/20 border-secondary-container text-secondary-container' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-on-surface-variant/50'}`}
                >
                  <Flag size={24} />
                  <span className="font-bold text-[13px]">Modo Desafio</span>
                </button>
              </div>
            </div>

            <button
              onClick={startSimulation}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--color-primary),0.3)] mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={18} /> Iniciar Simulador
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return <div className="flex-1 h-full bg-background flex items-center justify-center font-bold text-primary animate-pulse">Carregando Histórico de Mercado...</div>;
  }

  return (
    <div className="flex-1 h-full bg-background flex flex-col relative overflow-hidden text-on-surface">
      {/* HEADER COCKPIT */}
      <header className="h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-surface-variant text-on-surface px-3 py-1.5 rounded-lg border border-outline-variant font-mono text-[13px] flex items-center gap-2">
            <span className="text-primary font-bold">{symbol}</span>
            <span className="text-on-surface-variant">|</span>
            <span>{timeframe}</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant/50">
            <button onClick={prevCandleAction} disabled={!!position || mode === 'challenge'} className="p-1.5 text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"><SkipBack size={16} /></button>
            <button onClick={status === 'running' ? pause : play} className={`p-1.5 mx-1 transition-colors cursor-pointer ${status === 'running' ? 'text-error' : 'text-primary'}`}>
              {status === 'running' ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={nextCandleAction} className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"><SkipForward size={16} /></button>
            <div className="w-px h-5 bg-outline-variant mx-2" />
            {[1, 2, 4, 8].map(s => (
              <button 
                key={s} 
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${speed === s ? 'bg-surface-variant text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                x{s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mode === 'challenge' && challenge && (
            <div className="bg-secondary-container/10 border border-secondary-container/30 px-4 py-1.5 rounded-lg flex gap-4">
              <span className="text-[11px] text-secondary-container font-bold flex items-center gap-1"><Flag size={12}/> {challenge.candlesSurvived} / 30 Velas</span>
            </div>
          )}
          <div className="bg-surface-container border border-outline-variant px-4 py-1.5 rounded-lg text-right">
            <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Equity (Banca)</div>
            <div className={`font-mono text-[16px] font-bold ${equityPercentChange >= 0 ? 'text-primary' : 'text-error'}`}>
              ${currentEquity.toFixed(2)} <span className="text-[11px] opacity-70">({equityPercentChange > 0 ? '+' : ''}{equityPercentChange.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY COCKPIT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Lado Esquerdo: Chart Tático & Professor IA */}
        <div className="flex-1 flex flex-col border-r border-outline-variant/50 relative">
          
          {/* Main Visual Data (O Falso Gráfico / Ticker Tático) */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center relative">
            <div className="absolute inset-0 bg-surface-container-lowest/30 pointer-events-none" />
            
            <div className="z-10 text-center w-full max-w-2xl">
              <div className="mb-2 text-[13px] font-mono text-on-surface-variant bg-surface px-3 py-1 inline-block rounded-full border border-outline-variant/30">
                Data do Replay: {currentCandle?.time || 'Carregando...'}
              </div>
              
              <div className="flex justify-center items-center gap-6 mb-8">
                <div className="text-right">
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Máxima (H)</div>
                  <div className="font-mono text-[18px]">{currentCandle?.high.toFixed(4) || '0.00'}</div>
                </div>
                
                <div className={`text-[64px] font-black font-mono leading-none tracking-tighter ${currentCandle?.close >= (currentCandle?.open || 0) ? 'text-primary' : 'text-error'}`}>
                  {currentCandle?.close.toFixed(4) || '0.00'}
                </div>

                <div className="text-left">
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Mínima (L)</div>
                  <div className="font-mono text-[18px]">{currentCandle?.low.toFixed(4) || '0.00'}</div>
                </div>
              </div>

              {/* Indicadores Reais */}
              <div className="flex justify-center gap-3">
                <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex-1">
                  <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">RSI 14</div>
                  <div className={`font-mono text-[20px] font-bold ${(currentCandle?.rsi || 50) > 70 ? 'text-error' : (currentCandle?.rsi || 50) < 30 ? 'text-primary' : 'text-on-surface'}`}>
                    {(currentCandle?.rsi || 0).toFixed(1)}
                  </div>
                </div>
                <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex-1">
                  <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">EMA 9</div>
                  <div className="font-mono text-[20px] font-bold text-on-surface">
                    {(currentCandle?.ema9 || 0).toFixed(4)}
                  </div>
                </div>
                <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex-1">
                  <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">EMA 21</div>
                  <div className="font-mono text-[20px] font-bold text-on-surface">
                    {(currentCandle?.ema21 || 0).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visualizador de Trail (Histórico visual simulado minimalista) */}
            <div className="absolute bottom-6 left-6 right-6 h-24 flex items-end gap-1 opacity-50 justify-end overflow-hidden">
              {visibleCandles.slice(-40).map((c, i) => {
                const isGreen = c.close >= c.open;
                const h = Math.max(10, Math.min(100, Math.abs((c.close - c.open) / c.open) * 10000));
                return (
                  <div key={i} className={`w-3 rounded-sm ${isGreen ? 'bg-primary' : 'bg-error'}`} style={{ height: `${h}%` }} />
                );
              })}
            </div>
          </div>

          {/* Professor IA Panel (Bottom Section) */}
          <div className="h-48 bg-surface-container-high border-t border-outline-variant p-4 overflow-y-auto">
            <h3 className="font-headline-sm text-[14px] font-bold text-secondary-container flex items-center gap-2 mb-3">
              <BrainCircuit size={16} /> Professor IA (Avaliação ao Vivo)
            </h3>
            
            <div className="space-y-2">
              <div className="bg-surface-container px-3 py-2 rounded border border-outline-variant/30 text-[12px] flex items-start gap-2">
                <Target size={14} className="text-primary mt-0.5 shrink-0" />
                <div><span className="font-bold text-on-surface">Estrutura Atual:</span> <span className="text-on-surface-variant">{currentStructure?.trend || 'Lateralização'}</span></div>
              </div>
              
              {currentStructure?.bos !== 'Nenhum rompimento recente confirmado' && (
                <div className="bg-primary/10 px-3 py-2 rounded border border-primary/20 text-[12px] flex items-start gap-2">
                  <Activity size={14} className="text-primary mt-0.5 shrink-0" />
                  <div><span className="font-bold text-primary">Atenção ao Rompimento:</span> <span className="text-primary/80">{currentStructure?.bos}</span></div>
                </div>
              )}

              {currentCandle?.rsi && currentCandle.rsi > 70 && (
                <div className="bg-error/10 px-3 py-2 rounded border border-error/20 text-[12px] flex items-start gap-2">
                  <AlertOctagon size={14} className="text-error mt-0.5 shrink-0" />
                  <div><span className="font-bold text-error">Risco de Reversão:</span> <span className="text-error/80">Ativo sobrecomprado (RSI &gt; 70). Evite compras no topo sem BOS validado.</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Order Book & Posições */}
        <div className="w-80 bg-surface-container-lowest flex flex-col p-4">
          
          {!position ? (
            <div className="flex-1 flex flex-col">
              <h3 className="text-[14px] font-bold text-on-surface mb-4 uppercase tracking-wider">Nova Ordem</h3>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold">Quantidade (USDT Alocado)</label>
                  <input 
                    type="number" 
                    value={orderSize} 
                    onChange={e => setOrderSize(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-[14px] font-mono outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold flex justify-between">
                    <span>Take Profit (TP)</span> <span className="opacity-50">Opcional</span>
                  </label>
                  <input 
                    type="number" 
                    value={orderTp} 
                    onChange={e => setOrderTp(e.target.value)}
                    placeholder="Preço alvo"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-[14px] font-mono outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold flex justify-between">
                    <span>Stop Loss (SL)</span> <span className="opacity-50">Opcional</span>
                  </label>
                  <input 
                    type="number" 
                    value={orderSl} 
                    onChange={e => setOrderSl(e.target.value)}
                    placeholder="Preço limite perda"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-2 text-[14px] font-mono outline-none focus:border-error"
                  />
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => handleExecute('long')}
                  className="w-full py-4 bg-primary/20 hover:bg-primary border border-primary text-primary hover:text-on-primary font-bold text-[16px] rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)]"
                >
                  COMPRAR (LONG)
                </button>
                <button 
                  onClick={() => handleExecute('short')}
                  className="w-full py-4 bg-error/20 hover:bg-error border border-error text-error hover:text-white font-bold text-[16px] rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                >
                  VENDER (SHORT)
                </button>
                <button 
                  onClick={nextCandleAction}
                  className="w-full py-3 bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface font-bold text-[13px] rounded-xl transition-all cursor-pointer mt-2"
                >
                  ESPERAR (Skip)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <h3 className="text-[14px] font-bold text-on-surface mb-4 uppercase tracking-wider">Posição Aberta</h3>
              
              <div className={`p-4 rounded-xl border mb-4 ${position.type === 'long' ? 'bg-primary/10 border-primary/30' : 'bg-error/10 border-error/30'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold text-[16px] uppercase ${position.type === 'long' ? 'text-primary' : 'text-error'}`}>
                    {position.type}
                  </span>
                  <span className="text-[12px] text-on-surface-variant font-mono">Size: ${position.size}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-[12px]">
                  <div>
                    <div className="text-on-surface-variant font-bold uppercase mb-0.5">Entrada</div>
                    <div className="font-mono text-on-surface">{position.entryPrice.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-on-surface-variant font-bold uppercase mb-0.5">Preço Atual</div>
                    <div className="font-mono text-on-surface">{currentCandle?.close.toFixed(4)}</div>
                  </div>
                  {position.sl && (
                    <div>
                      <div className="text-error/70 font-bold uppercase mb-0.5">Stop Loss</div>
                      <div className="font-mono text-error/90">{position.sl.toFixed(4)}</div>
                    </div>
                  )}
                  {position.tp && (
                    <div>
                      <div className="text-primary/70 font-bold uppercase mb-0.5">Take Profit</div>
                      <div className="font-mono text-primary/90">{position.tp.toFixed(4)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant text-center mb-6">
                <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Lucro/Prejuízo Aberto (Unrealized)</div>
                <div className={`font-mono text-[24px] font-black ${unrealizedPnL.value >= 0 ? 'text-primary' : 'text-error'}`}>
                  {unrealizedPnL.value > 0 ? '+' : ''}{unrealizedPnL.value.toFixed(2)} USD
                </div>
                <div className={`font-mono text-[12px] font-bold ${unrealizedPnL.percent >= 0 ? 'text-primary' : 'text-error'}`}>
                  {unrealizedPnL.percent > 0 ? '+' : ''}{unrealizedPnL.percent.toFixed(2)}%
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-outline-variant/50 space-y-3">
                <button 
                  onClick={closePosition}
                  className="w-full py-4 bg-error hover:bg-error/90 text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                >
                  FECHAR POSIÇÃO A MERCARDO
                </button>
              </div>
            </div>
          )}

          {/* Histórico Recente Simplificado */}
          {tradeHistory.length > 0 && !position && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30 max-h-48 overflow-y-auto">
              <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-2">Trades Hoje</div>
              {tradeHistory.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] font-mono mb-1 bg-surface py-1 px-2 rounded">
                  <span className={t.type === 'long' ? 'text-primary' : 'text-error'}>{t.type.toUpperCase()}</span>
                  <span className={t.pnl >= 0 ? 'text-primary' : 'text-error'}>{t.pnl > 0 ? '+' : ''}{t.pnl.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Pós Operação / Fim do Simulador */}
      {status === 'finished' && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel border border-outline-variant max-w-2xl w-full p-8 rounded-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              {challenge?.status === 'lost' ? (
                <div className="w-16 h-16 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto mb-4 border border-error/50">
                  <AlertOctagon size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/50">
                  <CheckCircle2 size={32} />
                </div>
              )}
              <h2 className="text-[28px] font-black text-on-surface">Simulação Concluída</h2>
              {challenge?.status && (
                <p className={`text-[14px] mt-2 font-bold ${challenge.status === 'lost' ? 'text-error' : 'text-primary'}`}>
                  {challenge.reason}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant">
                <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Nota IA</div>
                <div className="font-headline-lg text-[32px] font-black text-secondary-container">{generateReport().score}</div>
              </div>
              <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant">
                <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Trades Realizados</div>
                <div className="font-headline-lg text-[32px] font-black text-on-surface">{tradeHistory.length}</div>
              </div>
              <div className="bg-surface-container rounded-xl p-4 text-center border border-outline-variant">
                <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">ROI Final</div>
                <div className={`font-headline-lg text-[32px] font-black ${generateReport().roi >= 0 ? 'text-primary' : 'text-error'}`}>
                  {generateReport().roi > 0 ? '+' : ''}{generateReport().roi.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 mb-8">
              <h4 className="font-bold text-[13px] text-on-surface uppercase mb-3 flex items-center gap-2">
                <BrainCircuit size={16} className="text-secondary-container" /> Avaliação do Professor IA
              </h4>
              <ul className="space-y-2 text-[13px] text-on-surface-variant list-disc list-inside">
                {generateReport().roi < 0 ? (
                  <>
                    <li className="text-error/90">Gestão de risco afetada: Prejuízo financeiro na simulação.</li>
                    <li>Sinais fortes podem ter sido ignorados, revise a estrutura antes de executar ordens pesadas.</li>
                  </>
                ) : (
                  <>
                    <li className="text-primary/90">Boa leitura de fluxo: Operações respeitaram tendências maiores.</li>
                    <li>O take profit foi adequado ao momento de volume do mercado simulado.</li>
                  </>
                )}
                {tradeHistory.length === 0 && (
                  <li>Você apenas observou o mercado sem abrir trades. O treino visual também é excelente!</li>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={reset}
                className="flex-1 py-4 bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-[14px] rounded-xl transition-all cursor-pointer border border-outline-variant"
              >
                JOGAR NOVAMENTE
              </button>
              <button 
                onClick={saveToEvolution}
                className="flex-1 py-4 bg-secondary-container text-on-secondary-container font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(var(--color-secondary-container),0.3)] flex justify-center items-center gap-2"
              >
                <Save size={18} /> SALVAR APRENDIZADO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
