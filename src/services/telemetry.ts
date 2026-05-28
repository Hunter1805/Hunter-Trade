export interface TelemetryMetrics {
  wsLatency: number | null;
  geminiTime: number | null;
  errors: Array<{ message: string; timestamp: Date; count: number }>;
  fps: number;
  memoryUsage: number | null;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'forex_polling';
  lastMarketUpdate: Date | null;
}

type TelemetryListener = (metrics: TelemetryMetrics) => void;

class TelemetryService {
  private metrics: TelemetryMetrics = {
    wsLatency: null,
    geminiTime: null,
    errors: [],
    fps: 60,
    memoryUsage: null,
    connectionState: 'disconnected',
    lastMarketUpdate: null,
  };

  private listeners = new Set<TelemetryListener>();

  getMetrics(): TelemetryMetrics {
    return {
      ...this.metrics,
      // Retorna uma cópia rasa do array de erros para evitar mutações indesejadas
      errors: [...this.metrics.errors],
    };
  }

  subscribe(listener: TelemetryListener) {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentMetrics = this.getMetrics();
    this.listeners.forEach((listener) => {
      try {
        listener(currentMetrics);
      } catch (err) {
        console.error('[TelemetryService] Erro ao notificar listener:', err);
      }
    });
  }

  trackWsLatency(latency: number) {
    this.metrics.wsLatency = latency;
    this.notify();
  }

  trackGeminiTime(durationMs: number) {
    this.metrics.geminiTime = durationMs;
    this.notify();
  }

  trackError(message: string) {
    console.warn('[DEV_MODE_ERROR_TRACKED]', message);
    const now = new Date();
    const existing = this.metrics.errors.find((e) => e.message === message);
    if (existing) {
      existing.timestamp = now;
      existing.count += 1;
    } else {
      this.metrics.errors = [
        { message, timestamp: now, count: 1 },
        ...this.metrics.errors.slice(0, 19), // Limita aos 20 erros mais recentes
      ];
    }
    this.notify();
  }

  clearErrors() {
    this.metrics.errors = [];
    this.notify();
  }

  trackConnectionState(state: TelemetryMetrics['connectionState']) {
    this.metrics.connectionState = state;
    this.notify();
  }

  trackMarketUpdate() {
    this.metrics.lastMarketUpdate = new Date();
    this.notify();
  }

  updateFps(fps: number) {
    this.metrics.fps = fps;
    this.notify();
  }

  updateMemory(memoryMb: number | null) {
    this.metrics.memoryUsage = memoryMb;
    this.notify();
  }
}

export const telemetry = new TelemetryService();
