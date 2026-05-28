import React, { useState, useEffect } from 'react';
import { analyzePerformance, PerformanceMetrics, StudyMemoryItem } from '../utils/performanceAnalyzer';
import { 
  BrainCircuit, 
  Activity, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  HeartPulse,
  Crosshair,
  ShieldAlert,
  CalendarDays
} from 'lucide-react';

export function PerformanceLabView() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('@hunter:studyMemory');
    let studies: StudyMemoryItem[] = [];
    if (raw) {
      try {
        studies = JSON.parse(raw);
      } catch(e) {}
    }
    const result = analyzePerformance(studies);
    setMetrics(result);
  }, []);

  if (!metrics) {
    return <div className="flex-1 flex items-center justify-center bg-background text-primary animate-pulse">Carregando dados psíquicos...</div>;
  }

  // Cores dinâmicas do Índice Emocional
  let emotionalColor = 'text-primary';
  let emotionalBg = 'bg-primary/20';
  let emotionalBorder = 'border-primary/50';
  let emotionalGlow = 'shadow-[0_0_20px_rgba(var(--color-primary),0.4)]';

  if (metrics.emotionalStatus === 'Crítico') {
    emotionalColor = 'text-error';
    emotionalBg = 'bg-error/20';
    emotionalBorder = 'border-error/50';
    emotionalGlow = 'shadow-[0_0_20px_rgba(255,0,0,0.4)]';
  } else if (metrics.emotionalStatus === 'Em risco') {
    emotionalColor = 'text-orange-500';
    emotionalBg = 'bg-orange-500/20';
    emotionalBorder = 'border-orange-500/50';
    emotionalGlow = 'shadow-[0_0_20px_rgba(249,115,22,0.4)]';
  } else if (metrics.emotionalStatus === 'Pressionado') {
    emotionalColor = 'text-secondary-container';
    emotionalBg = 'bg-secondary-container/20';
    emotionalBorder = 'border-secondary-container/50';
    emotionalGlow = 'shadow-[0_0_20px_rgba(var(--color-secondary-container),0.4)]';
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-container/10 via-background to-background pointer-events-none" />

      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-secondary-container/10 border border-secondary-container/30 p-1.5 rounded-lg">
            <BrainCircuit className="text-secondary-container" size={20} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
              Performance Lab
            </h2>
            <p className="font-label-sm text-[11px] text-on-surface-variant/70">
              Métricas Táticas & Psicologia Comportamental
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 pb-24 z-10">
        
        {/* HERO: Emotional Index & Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`col-span-1 lg:col-span-1 glass-panel rounded-2xl p-6 border ${emotionalBorder} ${emotionalGlow} flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500`}>
            <HeartPulse size={48} className={`${emotionalColor} opacity-20 absolute top-4 left-4`} />
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Índice Emocional</span>
            <div className={`text-[64px] font-black leading-none font-mono ${emotionalColor}`}>
              {metrics.emotionalScore}
            </div>
            <div className={`mt-2 px-4 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider ${emotionalBg} ${emotionalColor} border ${emotionalBorder}`}>
              {metrics.emotionalStatus}
            </div>
            {metrics.fatigueDetected && (
               <div className="mt-4 flex items-center gap-1.5 text-error text-[11px] font-bold bg-error/10 px-3 py-1.5 rounded-lg border border-error/20">
                 <ShieldAlert size={14} /> FADIGA OPERACIONAL DETECTADA
               </div>
            )}
          </div>

          <div className="col-span-1 lg:col-span-2 glass-panel rounded-2xl p-6 border border-outline-variant/60 flex flex-col justify-center">
            <h3 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2 mb-2">
              <Crosshair size={14} /> Seu Perfil Analítico Atual
            </h3>
            <div className="text-[32px] font-black text-on-surface text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-container mb-4">
              {metrics.traderProfile}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                 <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Total Trades</div>
                 <div className="font-mono text-[20px] font-bold text-on-surface">{metrics.totalTrades}</div>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                 <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Win Rate Geral</div>
                 <div className={`font-mono text-[20px] font-bold ${metrics.winRate >= 50 ? 'text-primary' : 'text-error'}`}>
                    {metrics.winRate.toFixed(1)}%
                 </div>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                 <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Best Win Streak</div>
                 <div className="font-mono text-[20px] font-bold text-primary">{metrics.maxWinStreak}</div>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
                 <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Worst Loss Streak</div>
                 <div className="font-mono text-[20px] font-bold text-error">{metrics.maxLossStreak}</div>
               </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK DO PROFESSOR E INSIGHTS CRUZADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Psicólogo IA */}
          <div className="glass-panel rounded-2xl p-6 border border-secondary-container/30">
            <h3 className="text-[16px] font-bold text-on-surface flex items-center gap-2 mb-4">
              <BrainCircuit size={18} className="text-secondary-container" /> Dossiê Psicológico do Professor IA
            </h3>
            
            <div className="space-y-3">
              {metrics.aiFeedbacks.length === 0 ? (
                <div className="text-on-surface-variant text-[13px] italic">Aguardando mais operações para gerar perfil psicológico...</div>
              ) : (
                metrics.aiFeedbacks.map((fb, idx) => {
                  const isWarning = fb.includes('Atenção') || fb.includes('Revenge') || fb.includes('Cansaço') || fb.includes('baixa');
                  return (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${isWarning ? 'bg-error/5 border-error/20' : 'bg-secondary-container/5 border-secondary-container/20'}`}>
                      {isWarning ? <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" /> : <Zap size={18} className="text-secondary-container shrink-0 mt-0.5" />}
                      <p className={`text-[13px] leading-relaxed ${isWarning ? 'text-error/90' : 'text-on-surface'}`}>{fb}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Sweet Spots Analíticos */}
          <div className="glass-panel rounded-2xl p-6 border border-outline-variant/60">
            <h3 className="text-[16px] font-bold text-on-surface flex items-center gap-2 mb-4">
              <Target size={18} className="text-primary" /> Sweet Spots Operacionais
            </h3>
            
            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                  <CalendarDays size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Melhor Dia & Horário Real</div>
                  <div className="text-[16px] font-bold text-on-surface">{metrics.bestDayTime}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">Janela estatística com maior probabilidade de lucros.</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Ativo de Maior Sinergia</div>
                  <div className="text-[16px] font-bold text-on-surface">{metrics.bestAsset}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">Paridade onde sua leitura de preço mais faz sentido.</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                  <Activity size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase font-bold mb-1">Setup / Estrutura Favorita</div>
                  <div className="text-[16px] font-bold text-on-surface">{metrics.bestStructure}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">Padrão institucional que você masterizou na prática.</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
