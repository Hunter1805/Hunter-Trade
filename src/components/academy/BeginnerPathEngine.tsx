import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle2, Brain, PlayCircle } from 'lucide-react';
import { beginnerModules } from './modules';
import { MiniMarketChart } from './MiniMarketChart';

interface BeginnerPathEngineProps {
  moduleId: string;
  onExit: () => void;
  onComplete: (xp: number, moduleId: string) => void;
}

export function BeginnerPathEngine({ moduleId, onExit, onComplete }: BeginnerPathEngineProps) {
  const moduleData = beginnerModules.find(m => m.id === moduleId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!moduleData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-on-surface">Módulo não encontrado.</p>
        <button onClick={onExit} className="ml-4 text-primary">Voltar</button>
      </div>
    );
  }

  const step = moduleData.steps[currentStepIndex];
  const isLastStep = currentStepIndex === moduleData.steps.length - 1;
  const progress = ((currentStepIndex + 1) / moduleData.steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(moduleData.xpReward, moduleData.id);
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleOptionSelect = (optId: string) => {
    if (showExplanation) return; // Já respondeu
    setSelectedOption(optId);
    setShowExplanation(true);
  };

  const isOptionCorrect = (optId: string) => {
    return step.quiz?.options.find(o => o.id === optId)?.isCorrect;
  };

  const canProceed = step.type === 'dialog' || step.type === 'chart-highlight' || (step.type === 'quiz' && showExplanation) || (step.type === 'practice' && showExplanation);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
      {/* Header Duolingo Style */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 bg-surface-container-lowest">
        <button onClick={onExit} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-variant">
          <X size={24} />
        </button>
        <div className="flex-1 mx-8">
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="font-headline-sm text-primary font-bold">
          {moduleData.title}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full">
        
        {/* Gráfico Visual */}
        {(step.type === 'chart-highlight' || step.type === 'quiz' || step.type === 'practice' || step.chartConfig) && (
          <div className="mb-8">
            <MiniMarketChart config={step.chartConfig} />
          </div>
        )}

        {/* AI Professor Box */}
        {step.type !== 'quiz' && step.type !== 'practice' && (
          <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-2xl p-6 relative mt-auto mb-8 flex gap-4 items-start shadow-lg">
            <div className="absolute -top-4 left-6 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1 shadow-md">
              <Brain size={14} /> PROFESSOR IA
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary-container/40">
              <Brain size={24} className="text-secondary-container" />
            </div>
            <p className="font-body-lg text-on-surface leading-relaxed text-lg pt-2">
              {step.content}
            </p>
          </div>
        )}

        {/* Quiz Area */}
        {step.type === 'quiz' && step.quiz && (
          <div className="mt-auto mb-8 flex flex-col gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary-container/40">
                <Brain size={24} className="text-secondary-container" />
              </div>
              <h3 className="font-headline-md text-on-surface pt-2">
                {step.quiz.question}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {step.quiz.options.map((opt) => {
                let btnClass = "p-4 rounded-xl border-2 font-label-lg transition-all text-center cursor-pointer ";
                if (!showExplanation) {
                  btnClass += "border-outline-variant bg-surface-container hover:border-primary/50 hover:bg-surface-variant text-on-surface";
                } else {
                  if (opt.id === selectedOption) {
                    btnClass += opt.isCorrect 
                      ? "border-primary bg-primary/20 text-primary" 
                      : "border-error bg-error/20 text-error";
                  } else if (opt.isCorrect) {
                    btnClass += "border-primary bg-primary/10 text-primary";
                  } else {
                    btnClass += "border-outline-variant/30 bg-surface-container/50 text-on-surface-variant opacity-50";
                  }
                }

                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={showExplanation}
                    className={btnClass}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={`p-5 rounded-2xl flex gap-4 animate-in slide-in-from-bottom-4 ${isOptionCorrect(selectedOption!) ? 'bg-primary/10 border border-primary/30 text-primary-fixed' : 'bg-secondary-container/10 border border-secondary-container/30 text-on-surface'}`}>
                {isOptionCorrect(selectedOption!) ? <CheckCircle2 size={28} className="shrink-0 text-primary" /> : <Brain size={28} className="shrink-0 text-secondary-container" />}
                <p className="font-body-lg text-lg leading-relaxed">
                  {isOptionCorrect(selectedOption!) ? step.quiz.explanationCorrect : step.quiz.explanationIncorrect}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Practice Area */}
        {step.type === 'practice' && (
          <div className="mt-auto mb-8 flex flex-col gap-6">
             <div className="flex gap-4 items-start bg-surface-container-high p-6 rounded-2xl border border-outline">
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0 border border-secondary-container/40">
                <PlayCircle size={24} className="text-secondary-container" />
              </div>
              <h3 className="font-headline-md text-on-surface pt-2 whitespace-pre-wrap">
                {step.content}
              </h3>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => { setSelectedOption('buy'); setShowExplanation(true); }}
                disabled={showExplanation}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${showExplanation && selectedOption !== 'buy' ? 'opacity-50' : ''} ${selectedOption === 'buy' ? 'bg-primary text-black' : 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30'}`}
              >
                Comprar
              </button>
              <button 
                onClick={() => { setSelectedOption('wait'); setShowExplanation(true); }}
                disabled={showExplanation}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${showExplanation && selectedOption !== 'wait' ? 'opacity-50' : ''} ${selectedOption === 'wait' ? 'bg-surface-variant text-on-surface border border-outline' : 'bg-surface-container text-on-surface border border-outline hover:bg-surface-variant'}`}
              >
                Esperar
              </button>
              <button 
                onClick={() => { setSelectedOption('sell'); setShowExplanation(true); }}
                disabled={showExplanation}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${showExplanation && selectedOption !== 'sell' ? 'opacity-50' : ''} ${selectedOption === 'sell' ? 'bg-error text-white' : 'bg-error/20 text-error border border-error/50 hover:bg-error/30'}`}
              >
                Vender
              </button>
            </div>

            {showExplanation && (
               <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary-container/30 text-secondary-container flex gap-3">
                 <Brain size={24} className="shrink-0" />
                 <p className="font-body-md">
                   <strong>Avaliação do Professor:</strong> Ótima escolha. Com a tendência de alta estabelecida acima da EMA200, RSI saudável e um BOS confirmado, procurar compras é o mais seguro.
                 </p>
               </div>
            )}
          </div>
        )}

        <div className="h-40 shrink-0 w-full"></div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 border-t border-outline-variant bg-surface-container-lowest flex justify-end z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto w-full flex justify-end">
          <button 
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 py-4 px-10 rounded-full font-bold text-lg transition-all ${
              canProceed 
                ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95' 
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50'
            }`}
          >
            {isLastStep ? 'Concluir Missão' : 'Continuar'} <ChevronRight size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}
