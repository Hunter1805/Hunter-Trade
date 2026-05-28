import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, MonitorPlay, BrainCircuit, LineChart, BookOpen, Bell, ArrowRight, Zap, Target } from 'lucide-react';
import { detectMarketStructure } from '../utils/marketStructure';

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { symbols, changeSymbol, marketData, activeSymbol } = useMarket();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Actions Parser
  const actions = [
    { type: 'view', id: 'dashboard', title: 'Abrir Dashboard (Market)', icon: LineChart, keywords: ['dash', 'market', 'home'] },
    { type: 'view', id: 'ai', title: 'Abrir AI Analyst', icon: BrainCircuit, keywords: ['ai', 'analyst', 'professor'] },
    { type: 'view', id: 'simulator', title: 'Abrir Simulator', icon: MonitorPlay, keywords: ['sim', 'replay', 'treino'] },
    { type: 'view', id: 'diary', title: 'Abrir Diário (Copiloto)', icon: BookOpen, keywords: ['diary', 'diario', 'copilot', 'operar'] },
    { type: 'view', id: 'evolution', title: 'Abrir Evolução', icon: Target, keywords: ['evo', 'ranking', 'grafico'] },
    { type: 'view', id: 'performance', title: 'Abrir Performance Lab', icon: Zap, keywords: ['lab', 'psicologia', 'stats'] },
    { type: 'view', id: 'alerts', title: 'Abrir Alertas', icon: Bell, keywords: ['alert', 'sino'] },
    
    { type: 'command', id: 'snapshot', title: 'Salvar Snapshot Operacional', icon: Target, keywords: ['salvar', 'snap', 'estrutura'] },
    { type: 'command', id: 'focus', title: 'Ativar/Desativar Focus Mode', icon: MonitorPlay, keywords: ['focus', 'foco', 'hide', 'limpar'] },
  ];

  // Adicionar troca de ativos dinamicamente
  symbols.forEach(s => {
    actions.push({
      type: 'symbol',
      id: s.symbol,
      title: `Trocar ativo para ${s.symbol}`,
      icon: LineChart,
      keywords: [s.symbol.toLowerCase(), 'abrir', 'ativo', 'trocar']
    });
  });

  const filteredActions = query ? actions.filter(a => {
    const q = query.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.keywords.some(k => k.includes(q));
  }) : actions;

  const handleAction = (action: typeof actions[0]) => {
    if (action.type === 'view') {
      window.dispatchEvent(new CustomEvent('change-view', { detail: action.id }));
    } else if (action.type === 'symbol') {
      changeSymbol(action.id);
    } else if (action.type === 'command') {
      if (action.id === 'focus') {
        const isCurrentlyFocus = document.querySelector('main')?.classList.contains('ml-0');
        window.dispatchEvent(new CustomEvent('toggle-focus', { detail: !isCurrentlyFocus }));
        
        window.dispatchEvent(new CustomEvent('show-toast', { detail: {
          title: 'Modo Foco Alterado',
          type: 'success'
        }}));
      } else if (action.id === 'snapshot') {
        saveSnapshot();
      }
    }
    setIsOpen(false);
  };

  const saveSnapshot = () => {
    const activeData = marketData[activeSymbol];
    if (!activeData || activeData.candles.length < 30) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: {
        title: 'Falha no Snapshot',
        description: 'Dados estruturais insuficientes para gravar o momento.',
        type: 'error'
      }}));
      return;
    }

    const structure = detectMarketStructure(activeSymbol, activeData.candles, activeData.price, activeData.ema9, activeData.ema21, activeData.ema200);
    
    const raw = localStorage.getItem('@hunter:studyMemory');
    let studies = [];
    if (raw) {
      try { studies = JSON.parse(raw); } catch(e){}
    }

    studies.unshift({
      id: `snap-${Date.now()}`,
      symbol: activeSymbol,
      assetName: `SNAPSHOT - ${activeSymbol}`,
      rsi: activeData.rsi,
      ema: `EMA9: ${activeData.ema9} / EMA21: ${activeData.ema21}`,
      estrutura: structure.trend,
      conclusaoIA: `Salvo pelo Command Center. BOS: ${structure.bos}`,
      score: 100,
      horario: new Date().toLocaleString('pt-BR'),
      timestamp: Date.now(),
      resultadoObservado: 'Lateralizou', // placeholder
      expectedDirection: 'Neutra'
    });

    localStorage.setItem('@hunter:studyMemory', JSON.stringify(studies));

    window.dispatchEvent(new CustomEvent('show-toast', { detail: {
      title: 'Snapshot Tático Salvo',
      description: `A estrutura atual de ${activeSymbol} foi gravada na sua memória de estudos.`,
      type: 'success'
    }}));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(var(--color-primary),0.15)] flex flex-col"
      >
        <div className="flex items-center px-4 py-4 border-b border-outline-variant/50">
          <Search className="text-primary mr-3" size={24} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[18px] text-on-surface font-sans"
            placeholder="Comande o Hunter (ex: 'abrir BTC' ou 'snapshot')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <span className="bg-surface-container px-2 py-1 rounded text-[10px] font-bold text-on-surface-variant border border-outline-variant">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
          {filteredActions.length === 0 ? (
            <div className="px-6 py-8 text-center text-on-surface-variant text-[13px]">
              Nenhum comando reconhecido para "{query}".
            </div>
          ) : (
            filteredActions.map((act, i) => (
              <div 
                key={act.id + i}
                onClick={() => handleAction(act)}
                className="px-6 py-3 flex items-center justify-between hover:bg-primary/10 cursor-pointer group transition-colors border-l-2 border-transparent hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <act.icon size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  <span className="text-[14px] text-on-surface font-bold group-hover:text-primary transition-colors">
                    {act.title}
                  </span>
                </div>
                <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
}
