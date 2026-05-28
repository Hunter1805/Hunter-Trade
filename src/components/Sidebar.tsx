import {
  Activity,
  Bell,
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  MonitorPlay,
  Radar,
  Settings,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const isDashboard = currentView === 'dashboard';

  const logoClicksRef = React.useRef(0);
  const lastClickTimeRef = React.useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) {
      logoClicksRef.current += 1;
      if (logoClicksRef.current >= 5) {
        logoClicksRef.current = 0;
        window.dispatchEvent(new CustomEvent('toggle-dev-mode'));
      }
    } else {
      logoClicksRef.current = 1;
    }
    lastClickTimeRef.current = now;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Market', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Analyst', icon: Brain },
    { id: 'academy', label: 'Academia IA', icon: GraduationCap },
    { id: 'scanner', label: 'Scanner', icon: Radar },
    { id: 'diary', label: 'Diary', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: MonitorPlay },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'performance', label: 'Performance Lab', icon: Activity },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-surface-container-lowest border-r border-outline-variant z-50 py-6">
      {/* Brand Header */}
      <div 
        onClick={handleLogoClick}
        className="px-6 flex flex-col gap-1 mb-6 cursor-pointer select-none active:opacity-80 transition-all"
        title="Dica: clique 5 vezes para diagnósticos"
      >
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          HUNTER TRADE OS
        </h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {isDashboard ? 'AI Market Intelligence' : 'Elite Terminal'}
        </p>
      </div>

      {/* Active Study Mode Badge (Dashboard Only context visual) */}
      {isDashboard && (
        <div className="px-4 mb-4">
          <div className="bg-primary-container/10 border border-primary-container/30 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
              </span>
              <span className="font-label-md text-label-md font-bold text-primary-container">
                Modo Estudo Ativo
              </span>
            </div>
            <p className="font-label-sm text-[11px] text-on-surface-variant leading-tight">
              IA Monitorando mercado em tempo real.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 px-4 no-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface active:scale-95'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Settings pinned near bottom of list */}
        <button className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all font-label-md text-label-md">
          <Settings size={20} />
          <span>Settings</span>
        </button>

        {/* Market Status (Dashboard Only) */}
        {isDashboard && (
          <div className="px-2 py-4 border-t border-outline-variant/30 mt-4 mb-2 hidden lg:block">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
              Status do Mercado
            </h3>
            <ul className="flex flex-col gap-2 font-label-sm text-label-sm text-on-surface">
              <li className="flex justify-between items-center">
                <span>Cripto:</span> <span className="text-primary-container">Ativo</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Forex:</span> <span className="text-primary-container">Ativo</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Scanner:</span> <span className="text-secondary-container">100+ ativos</span>
              </li>
              <li className="flex justify-between items-center">
                <span>IA:</span>{' '}
                <span className="text-primary-container">Analisando estruturas</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer Profile */}
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/30 mx-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-surface-variant/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=150&h=150"
              alt="User"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              EL HUNTER
            </span>
            <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
