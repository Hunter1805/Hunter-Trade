import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AcademyView } from './views/AcademyView';
import { DashboardView } from './views/DashboardView';
import { DiaryView } from './views/DiaryView';
import { ScannerView } from './views/ScannerView';
import { AIAnalystView } from './views/AIAnalystView';
import { AlertsView } from './views/AlertsView';
import { EvolutionView } from './views/EvolutionView';
import { SimulatorView } from './views/SimulatorView';
import { PerformanceLabView } from './views/PerformanceLabView';
import { MarketProvider } from './context/MarketContext';
import { AlertsProvider } from './context/AlertsContext';
import { DevModePanel } from './components/DevModePanel';
import { ToastProvider } from './components/ToastProvider';
import { CommandCenter } from './components/CommandCenter';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('@hunter:currentView') || 'dashboard';
  });
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('@hunter:currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    const handleViewChange = (e: CustomEvent<string>) => {
      if (e.detail) {
        setCurrentView(e.detail);
      }
    };
    const handleFocusMode = (e: CustomEvent<boolean>) => {
      setIsFocusMode(e.detail);
    };
    
    window.addEventListener('change-view', handleViewChange as EventListener);
    window.addEventListener('toggle-focus', handleFocusMode as EventListener);
    return () => {
      window.removeEventListener('change-view', handleViewChange as EventListener);
      window.removeEventListener('toggle-focus', handleFocusMode as EventListener);
    };
  }, []);

  return (
    <MarketProvider>
      <AlertsProvider>
        <ToastProvider />
        <CommandCenter />
        <div className="flex h-screen w-full font-sans bg-background text-on-background overflow-hidden selection:bg-secondary-container/30">
          {!isFocusMode && <Sidebar currentView={currentView} onViewChange={setCurrentView} />}
          
          <main className={`${isFocusMode ? 'w-full ml-0' : 'ml-64 w-[calc(100%-16rem)]'} flex-1 h-screen flex flex-col relative transition-all duration-300`}>
             {currentView === 'dashboard' && <DashboardView />}
             {currentView === 'academy' && <AcademyView />}
             {currentView === 'diary' && <DiaryView />}
             {currentView === 'scanner' && <ScannerView />}
             {currentView === 'ai' && <AIAnalystView />}
             {currentView === 'alerts' && <AlertsView />}
             {currentView === 'evolution' && <EvolutionView />}
             {currentView === 'simulator' && <SimulatorView />}
             {currentView === 'performance' && <PerformanceLabView />}
             
             {/* Simple fallback for other nav items */}
             {[''].includes(currentView) && (
                <div className="flex-1 flex items-center justify-center bg-background border-outline-variant">
                  <div className="text-center">
                     <h2 className="text-headline-lg font-bold text-on-surface mb-2 capitalize">{currentView} Module</h2>
                     <p className="text-on-surface-variant">This module is currently in development.</p>
                  </div>
                </div>
             )}
          </main>

          <DevModePanel />
        </div>
      </AlertsProvider>
    </MarketProvider>
  );
}

