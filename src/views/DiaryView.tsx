import React, { useState } from 'react';
import { useCopilotEngine, MoodType, ObjectiveType, ChecklistStatus } from '../hooks/useCopilotEngine';
import { 
  BrainCircuit, Activity, Crosshair, Zap, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight, ShieldAlert,
  ThumbsUp, ThumbsDown, BookOpen
} from 'lucide-react';

export function DiaryView() {
  const engine = useCopilotEngine();
  const {
    status, symbol, mood, objective, checklist, tradeResult,
    score, feedbacks, startSession, updateChecklist, endTrade, finalizeAndSave,
    generatePostSessionReport
  } = engine;

  // Local temp states for setup
  const [setupSymbol, setSetupSymbol] = useState('BTCUSDT');
  const [setupMood, setSetupMood] = useState<MoodType>('🙂 normal');
  const [setupObjective, setSetupObjective] = useState<ObjectiveType>('operar real');

  if (status === 'closed') {
    return (
      <div className="flex-1 h-full bg-background flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        
        <div className="glass-panel max-w-xl w-full rounded-2xl p-8 z-10 border border-outline-variant/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/30">
              <ShieldAlert className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-[24px] font-black font-headline-lg text-on-surface leading-tight">Copiloto de Blindagem</h1>
              <p className="text-on-surface-variant text-[13px]">Seu companheiro diário para operar sob supervisão da IA.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Ativo Alvo</label>
              <select 
                value={setupSymbol} 
                onChange={(e) => setSetupSymbol(e.target.value)}
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
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Seu Humor Atual</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['😴 cansado', '🙂 normal', '🔥 focado', '🤯 ansioso'] as MoodType[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setSetupMood(m)}
                    className={`py-3 rounded-xl border text-[13px] font-bold capitalize transition-colors cursor-pointer ${setupMood === m ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-on-surface-variant'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Objetivo da Sessão</label>
              <div className="grid grid-cols-3 gap-2">
                {(['estudar', 'simular', 'operar real'] as ObjectiveType[]).map(o => (
                  <button
                    key={o}
                    onClick={() => setSetupObjective(o)}
                    className={`py-3 rounded-xl border text-[12px] font-bold capitalize transition-colors cursor-pointer ${setupObjective === o ? 'bg-secondary-container/20 border-secondary-container text-secondary-container' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-on-surface-variant'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startSession(setupSymbol, setupMood, setupObjective)}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--color-primary),0.3)] mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity size={18} /> INICIAR SESSÃO DE TRADING
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'active') {
    const isReady = checklist.ema && checklist.rsi && checklist.bos && checklist.volume && checklist.liquidez && checklist.tendenciaMacro;

    return (
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto">
        <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-headline-md text-[16px] font-bold text-primary">
                Sessão Ativa: {symbol}
              </span>
            </div>
            <div className="px-3 py-1 bg-surface-container rounded-lg border border-outline-variant text-[11px] font-mono text-on-surface-variant">
              Humor: <span className="font-bold text-on-surface capitalize">{mood}</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
          
          {/* Checklist Humano */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-outline-variant">
            <h2 className="text-[18px] font-bold text-on-surface flex items-center gap-2 mb-6">
              <Crosshair className="text-secondary-container" /> Checklist Pré-Operação (Sua Leitura)
            </h2>

            <div className="space-y-4">
              {[
                { id: 'tendenciaMacro', label: 'Tendência Macro clara?' },
                { id: 'ema', label: 'EMA Alinhada e testada?' },
                { id: 'rsi', label: 'RSI em zona propícia (não está extremo contra)?' },
                { id: 'bos', label: 'BOS Confirmado no tempo gráfico menor?' },
                { id: 'volume', label: 'Tem injeção ou pico de Volume?' },
                { id: 'liquidez', label: 'Capturou liquidez antes de reverter?' },
              ].map(item => (
                <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-[14px] font-bold text-on-surface">{item.label}</span>
                  <div className="flex bg-surface-container border border-outline-variant rounded-lg overflow-hidden shrink-0">
                    {(['sim', 'não', 'ignorei'] as ChecklistStatus[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateChecklist(item.id as keyof typeof checklist, opt)}
                        className={`px-4 py-2 text-[12px] font-bold capitalize transition-colors cursor-pointer border-r border-outline-variant last:border-0 ${
                          checklist[item.id as keyof typeof checklist] === opt 
                            ? opt === 'sim' ? 'bg-primary/20 text-primary' 
                            : opt === 'não' ? 'bg-error/20 text-error' 
                            : 'bg-orange-500/20 text-orange-500'
                            : 'text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-surface-container rounded-2xl border border-outline-variant flex flex-col items-center justify-center text-center">
              {isReady ? (
                <>
                  <div className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Finalização do Trade Real</div>
                  <p className="text-[13px] text-on-surface-variant mb-4">Após apertar o botão na sua corretora real e o trade acabar, registre aqui o resultado para gerar o diário.</p>
                  <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                    <button onClick={() => endTrade('Gain')} className="py-3 bg-primary/20 text-primary border border-primary/50 font-bold rounded-xl cursor-pointer flex justify-center items-center gap-2 hover:bg-primary/30"><ThumbsUp size={16}/> GAIN</button>
                    <button onClick={() => endTrade('Empate')} className="py-3 bg-surface-variant text-on-surface border border-outline-variant font-bold rounded-xl cursor-pointer flex justify-center items-center gap-2 hover:bg-surface-variant/80">EMPATE</button>
                    <button onClick={() => endTrade('Loss')} className="py-3 bg-error/20 text-error border border-error/50 font-bold rounded-xl cursor-pointer flex justify-center items-center gap-2 hover:bg-error/30"><ThumbsDown size={16}/> LOSS</button>
                  </div>
                </>
              ) : (
                <div className="text-on-surface-variant text-[14px]">Preencha todo o checklist humano para habilitar a finalização da sessão.</div>
              )}
            </div>
          </div>

          {/* Professor IA Ao Vivo (Cross-check) */}
          <div className="glass-panel rounded-2xl p-6 border border-secondary-container/50 shadow-[0_0_20px_rgba(var(--color-secondary-container),0.1)] h-max sticky top-24">
            <h2 className="text-[16px] font-bold text-on-surface flex items-center gap-2 mb-6">
              <BrainCircuit className="text-secondary-container" /> Score Estrutural (Anti-Viés)
            </h2>

            <div className="flex flex-col items-center text-center mb-6">
               <div className={`text-[64px] font-black font-mono leading-none ${score >= 80 ? 'text-primary' : score >= 50 ? 'text-orange-500' : 'text-error'}`}>
                 {score}
               </div>
               <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">Grau de Racionalidade</span>
            </div>

            <div className="space-y-3">
              {feedbacks.map((fb, i) => {
                const isWarn = fb.includes('PERIGO') || fb.includes('Aja com lotes') || fb.includes('Alucinação') || fb.includes('reduz sua eficácia');
                return (
                  <div key={i} className={`p-3 rounded-xl border text-[12px] flex items-start gap-2 ${isWarn ? 'bg-error/10 border-error/30 text-error/90' : 'bg-secondary-container/10 border-secondary-container/30 text-on-surface'}`}>
                    {isWarn ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <Zap size={14} className="text-secondary-container shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{fb}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW (Pós Sessão)
  if (status === 'review') {
    const report = generatePostSessionReport();
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="glass-panel max-w-2xl w-full p-8 rounded-2xl animate-in zoom-in duration-300 border border-outline-variant/60">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-primary" size={28} />
            <h2 className="text-[24px] font-black text-on-surface">Pós-Sessão & Diário IA</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30">
              <h3 className="text-[11px] font-bold text-on-surface-variant uppercase mb-2 text-primary">O que você fez bem</h3>
              <p className="text-[13px] text-on-surface leading-relaxed">{report.oQueFezBem}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30">
              <h3 className="text-[11px] font-bold text-on-surface-variant uppercase mb-2 text-error">Onde e por que errou (Análise IA)</h3>
              <p className="text-[13px] text-on-surface leading-relaxed">{report.ondeErrou}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30">
              <h3 className="text-[11px] font-bold text-on-surface-variant uppercase mb-2 text-orange-500">Risco Detectado</h3>
              <p className="text-[13px] text-on-surface leading-relaxed">{report.riscoDetectado}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30">
              <h3 className="text-[11px] font-bold text-on-surface-variant uppercase mb-2 text-secondary-container">Recomendação Final</h3>
              <p className="text-[13px] text-on-surface leading-relaxed">{report.recomendacao}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={finalizeAndSave}
              className="py-3 px-6 bg-primary hover:bg-primary/90 text-on-primary font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(var(--color-primary),0.3)] flex items-center gap-2"
            >
              <CheckCircle2 size={18} /> GRAVAR NO DIÁRIO (MANDAR PARA PERFORMANCE)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
