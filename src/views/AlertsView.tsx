import React, { useState } from 'react';
import { useAlerts } from '../context/AlertsContext';
import { useMarket } from '../context/MarketContext';
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  BookOpen, 
  Activity,
  Brain,
  Radar,
  ArrowRight
} from 'lucide-react';

export function AlertsView() {
  const { alerts, markAsRead, markAllAsRead, deleteAlert, saveToStudyMemory } = useAlerts();
  const { changeSymbol } = useMarket();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return a.status === 'unread';
    if (filter === 'read') return a.status === 'read';
    return true;
  });

  const handleOpenScanner = (symbol: string) => {
    changeSymbol(symbol);
    window.dispatchEvent(new CustomEvent('change-view', { detail: 'scanner' }));
  };

  const handleOpenAI = (symbol: string) => {
    changeSymbol(symbol);
    window.dispatchEvent(new CustomEvent('change-view', { detail: 'ai' }));
  };

  const handleSaveToStudy = (id: string) => {
    saveToStudyMemory(id);
    // Disparar toast ou apenas redirecionar
  };

  const getLevelColor = (level: string) => {
    if (level === 'Alta') return 'text-primary border-primary/30 bg-primary/10';
    if (level === 'Moderada') return 'text-secondary-container border-secondary-container/30 bg-secondary-container/10';
    return 'text-on-surface-variant border-outline-variant bg-surface-variant/20';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/30 p-1.5 rounded-lg">
            <Bell className="text-primary animate-pulse" size={20} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
              Central de Alertas
            </h2>
            <p className="font-label-sm text-[11px] text-on-surface-variant/70">
              Notificações e detecções do motor de inteligência
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-lowest border border-outline-variant rounded-lg p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                filter === 'all' ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-[11px] rounded transition-all font-label-md cursor-pointer ${
                filter === 'unread' ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Não Lidos
            </button>
          </div>
          <button 
            onClick={markAllAsRead}
            className="text-[11px] font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 size={14} /> Marcar tudo como lido
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center bg-surface-container/50 border border-outline-variant p-6 rounded-2xl max-w-sm">
              <Bell size={40} className="text-on-surface-variant/50 mx-auto mb-3" />
              <p className="text-on-surface font-bold mb-1">Nenhum alerta encontrado</p>
              <p className="text-on-surface-variant text-[12px]">Seu sistema está monitorando o mercado. Novos sinais aparecerão aqui.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`glass-panel rounded-xl p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:border-outline hover:translate-y-[-2px] ${
                  alert.status === 'unread' ? 'border-l-4 border-l-primary' : 'opacity-80'
                }`}
              >
                {alert.status === 'unread' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-headline-md text-[16px] font-bold text-on-surface flex items-center gap-2">
                      {alert.assetName}
                      <span className="font-mono text-[9px] bg-surface-variant/80 text-on-surface-variant px-1.5 py-0.5 rounded uppercase">
                        {alert.time}
                      </span>
                    </h3>
                  </div>
                  <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getLevelColor(alert.level)}`}>
                    Nível: {alert.level}
                  </div>
                </div>

                <div className="bg-surface-container-lowest/50 border border-outline-variant/30 rounded-lg p-3 mb-4">
                  <p className="text-[12px] text-on-surface/90 leading-relaxed">
                    {alert.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-on-surface-variant">Confiança IA:</span>
                    <span className="text-[11px] font-bold text-secondary-container">{alert.confidence}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenScanner(alert.symbol)}
                    className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/50 cursor-pointer"
                  >
                    <Radar size={12} className="text-primary" /> Scanner
                  </button>
                  <button
                    onClick={() => handleOpenAI(alert.symbol)}
                    className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/50 cursor-pointer"
                  >
                    <Brain size={12} className="text-secondary-container" /> AI Analyst
                  </button>
                  <button
                    onClick={() => handleSaveToStudy(alert.id)}
                    className="col-span-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-label-sm text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen size={12} /> Salvar para Estudo
                  </button>
                  
                  <div className="col-span-2 flex justify-between mt-2 pt-2 border-t border-outline-variant/30">
                    <button 
                      onClick={() => markAsRead(alert.id)}
                      className={`text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${alert.status === 'read' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                      disabled={alert.status === 'read'}
                    >
                      <CheckCircle2 size={12} /> {alert.status === 'read' ? 'Lido' : 'Marcar visto'}
                    </button>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="text-[10px] text-error/70 hover:text-error flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} /> Descartar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
