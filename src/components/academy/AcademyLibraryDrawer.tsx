import React, { useMemo } from 'react';
import { X, CheckCircle2, Circle, PlayCircle, Library } from 'lucide-react';
import { beginnerModules, Module } from './modules';

interface AcademyLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  completedMissions: string[];
  currentModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
}

export function AcademyLibraryDrawer({
  isOpen,
  onClose,
  completedMissions,
  currentModuleId,
  onSelectModule,
}: AcademyLibraryDrawerProps) {
  // Agrupar módulos por trilha
  const tracks = useMemo(() => {
    const grouped: Record<string, Module[]> = {};
    beginnerModules.forEach((mod) => {
      if (!grouped[mod.track]) {
        grouped[mod.track] = [];
      }
      grouped[mod.track].push(mod);
    });
    return grouped;
  }, []);

  if (!isOpen) return null;

  let foundFirstIncomplete = false;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface/95 backdrop-blur-xl border-l border-outline-variant/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Library className="text-primary-fixed" size={24} />
            <h2 className="font-headline-md text-on-surface">Biblioteca da Trilha</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 no-scrollbar">
          {Object.entries(tracks).map(([trackName, modules]) => (
            <div key={trackName} className="space-y-4">
              <h3 className="font-label-lg text-primary uppercase tracking-widest border-b border-primary/20 pb-2">
                {trackName}
              </h3>
              <div className="space-y-2">
                {modules.map((mod) => {
                  const isCompleted = completedMissions.includes(mod.id);
                  const isCurrent = currentModuleId === mod.id;
                  
                  let isNext = false;
                  if (!isCompleted && !foundFirstIncomplete) {
                    isNext = true;
                    foundFirstIncomplete = true;
                  }

                  let Icon = Circle;
                  let iconColor = 'text-on-surface-variant/50';
                  let bgClass = 'hover:bg-surface-container-high border-transparent hover:border-outline-variant';

                  if (isCompleted) {
                    Icon = CheckCircle2;
                    iconColor = 'text-primary';
                  } else if (isNext) {
                    Icon = PlayCircle;
                    iconColor = 'text-secondary-container';
                  }

                  if (isCurrent) {
                    bgClass = 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    if (!isCompleted) {
                       Icon = PlayCircle;
                       iconColor = 'text-primary';
                    }
                  }

                  return (
                    <div
                      key={mod.id}
                      onClick={() => onSelectModule(mod.id)}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group ${bgClass}`}
                    >
                      <div className={`shrink-0 transition-colors group-hover:scale-110 duration-300 ${iconColor}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-label-md transition-colors ${isCompleted ? 'text-on-surface/80' : 'text-on-surface'} ${isCurrent ? 'font-bold text-primary' : ''}`}>
                          {mod.title}
                        </div>
                        <div className="text-xs font-body-sm text-on-surface-variant line-clamp-1">
                          {mod.description}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs font-bold text-primary/50 group-hover:text-primary transition-colors">
                        +{mod.xpReward} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
