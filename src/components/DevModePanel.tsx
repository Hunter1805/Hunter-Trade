import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Database, Wifi, AlertTriangle, Clock, X, Trash2 } from 'lucide-react';
import { telemetry, TelemetryMetrics } from '../services/telemetry';

export function DevModePanel() {
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<TelemetryMetrics>(telemetry.getMetrics());

  // Rastreamento de FPS
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);

  // Inscreve-se na telemetria
  useEffect(() => {
    const unsubscribe = telemetry.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Atalhos de teclado e eventos de ativação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Atalhos: Shift + Alt + D  OU  Ctrl + Alt + D
      const isAltShiftD = e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd');
      const isCtrlAltD = e.ctrlKey && e.altKey && (e.key === 'D' || e.key === 'd');

      if (isAltShiftD || isCtrlAltD) {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    const handleToggleEvent = () => {
      setIsActive((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-dev-mode', handleToggleEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-dev-mode', handleToggleEvent);
    };
  }, []);

  // Capturador global de erros do navegador
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const filename = event.filename ? event.filename.split('/').pop() : 'desconhecido';
      telemetry.trackError(`Runtime: ${event.message} (${filename}:${event.lineno})`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      telemetry.trackError(`Promise Rejeitada: ${message}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Monitoramento ativo (FPS e Memória) rodando apenas quando o painel está aberto
  useEffect(() => {
    if (!isActive) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Loop de cálculo de FPS
    const measureFps = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      const delta = now - lastFpsUpdateRef.current;

      if (delta >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        telemetry.updateFps(calculatedFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFps);
    };

    rafIdRef.current = requestAnimationFrame(measureFps);

    // Loop de monitoramento de memória a cada 1.5s
    const measureMemory = () => {
      const perf = window.performance as any;
      if (perf && perf.memory) {
        const usedMb = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
        telemetry.updateMemory(usedMb);
      } else {
        telemetry.updateMemory(null);
      }
    };

    measureMemory(); // Executa imediatamente
    const memInterval = setInterval(measureMemory, 1500);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      clearInterval(memInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  // Formata timestamps de eventos
  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    const pad = (num: number, size = 2) => String(num).padStart(size, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  };

  // Cores semânticas de status de conexão
  const getConnectionBadge = () => {
    switch (metrics.connectionState) {
      case 'connected':
        return <span className="bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 rounded text-[9px] font-bold">CONNECTED</span>;
      case 'connecting':
        return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold">CONNECTING</span>;
      case 'forex_polling':
        return <span className="bg-secondary-container/10 border border-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[9px] font-bold">FOREX POLLING</span>;
      case 'disconnected':
      default:
        return <span className="bg-error/10 border border-error/30 text-error px-2 py-0.5 rounded text-[9px] font-bold">DISCONNECTED</span>;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-96 max-h-[500px] flex flex-col rounded-xl shadow-2xl border border-outline-variant font-mono text-[11px] bg-surface/85 backdrop-blur-md overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-surface-container border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-bold text-primary tracking-wider text-[10px]">HUNTER TRADE OS // DIAGNOSTICS</span>
        </div>
        <button 
          onClick={() => setIsActive(false)}
          className="text-on-surface-variant hover:text-on-surface p-0.5 rounded hover:bg-surface-variant/50 transition-colors"
          title="Fechar painel (Shift+Alt+D)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Grid de Métricas */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-outline-variant bg-surface/50">
        
        {/* WS Latency */}
        <div className="bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <Wifi size={12} className="text-primary" />
            <span>Latência WS</span>
          </div>
          <span className="text-[13px] font-bold text-on-surface">
            {metrics.wsLatency !== null ? `${metrics.wsLatency}ms` : 'N/A (Forex)'}
          </span>
        </div>

        {/* Gemini Time */}
        <div className="bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <Cpu size={12} className="text-secondary" />
            <span>Tempo Gemini</span>
          </div>
          <span className="text-[13px] font-bold text-on-surface">
            {metrics.geminiTime !== null && metrics.geminiTime > 0 
              ? `${(metrics.geminiTime / 1000).toFixed(2)}s` 
              : metrics.geminiTime === 0 ? '0.00s (Fallback)' : 'N/A (Inativo)'}
          </span>
        </div>

        {/* FPS */}
        <div className="bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <Activity size={12} className={metrics.fps >= 50 ? 'text-primary' : 'text-amber-400'} />
            <span>Taxa FPS</span>
          </div>
          <span className={`text-[13px] font-bold ${metrics.fps >= 50 ? 'text-primary' : 'text-amber-400'}`}>
            {metrics.fps} FPS
          </span>
        </div>

        {/* JS Memory */}
        <div className="bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <Database size={12} className="text-on-surface-variant" />
            <span>Uso Memória</span>
          </div>
          <span className="text-[13px] font-bold text-on-surface">
            {metrics.memoryUsage !== null ? `${metrics.memoryUsage} MB` : 'N/A'}
          </span>
        </div>

        {/* Estado da Conexão */}
        <div className="col-span-2 bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex items-center justify-between">
          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
            <Wifi size={12} />
            Estado da Conexão:
          </span>
          {getConnectionBadge()}
        </div>

        {/* Última atualização do Mercado */}
        <div className="col-span-2 bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/30 flex items-center justify-between">
          <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
            <Clock size={12} />
            Último tick de mercado:
          </span>
          <span className="text-on-surface font-semibold">
            {formatTime(metrics.lastMarketUpdate)}
          </span>
        </div>
      </div>

      {/* Log de Erros */}
      <div className="flex-1 flex flex-col min-h-[140px] max-h-[220px]">
        <div className="flex justify-between items-center px-4 py-2 bg-surface-container/60 border-b border-outline-variant/50">
          <span className="font-bold text-[9px] text-on-surface-variant tracking-wider flex items-center gap-1">
            <AlertTriangle size={10} className="text-error" />
            LOG DE ERROS ({metrics.errors.length})
          </span>
          {metrics.errors.length > 0 && (
            <button
              onClick={() => telemetry.clearErrors()}
              className="text-error hover:text-error/80 flex items-center gap-1 hover:underline transition-colors px-1 py-0.5 rounded text-[9px]"
            >
              <Trash2 size={10} />
              Limpar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-surface-container-lowest/60">
          {metrics.errors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant italic text-[10px]">
              Nenhum erro registrado. Sistema estável.
            </div>
          ) : (
            metrics.errors.map((error, idx) => (
              <div key={idx} className="flex gap-2 items-start text-error text-[10px] leading-tight border-b border-outline-variant/10 pb-1.5 last:border-0 last:pb-0">
                <span className="text-on-surface-variant shrink-0 select-none">
                  [{formatTime(error.timestamp).split('.')[0]}]
                </span>
                <span className="flex-1 break-all">{error.message}</span>
                {error.count > 1 && (
                  <span className="bg-error-container/20 text-error border border-error/30 px-1 py-0.2 rounded text-[8px] font-bold shrink-0">
                    x{error.count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
