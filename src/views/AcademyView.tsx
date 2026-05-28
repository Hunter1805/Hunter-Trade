import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clapperboard,
  GraduationCap,
  HelpCircle,
  Library,
  Lightbulb,
  MapPin,
  SlidersHorizontal,
  Target,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

export function AcademyView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <header className="flex justify-between items-center h-20 px-8 bg-surface/80 backdrop-blur-xl border-b border-outline-variant sticky top-0 z-40 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
            <GraduationCap className="text-primary-fixed" size={32} />
            Academia IA
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Aprenda mercado na prática enquanto a IA ensina em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-6 hidden md:flex">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Iniciante
            </span>
            <span className="font-label-md text-label-md text-on-surface">XP: 230/1000</span>
          </div>
          <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant">
            <div className="h-full bg-primary-container w-[23%]"></div>
          </div>
          <div className="h-8 w-px bg-outline-variant mx-2"></div>
          <button className="text-on-surface hover:text-primary transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Live Professor */}
          <div className="lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden bg-surface-container">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-primary" size={24} />
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Detectado CHoCH em BTC
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Change of Character (CHoCH) - Uma mudança na estrutura do mercado indicando
                  possível reversão.
                </p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm text-label-sm">
                Análise em Tempo Real
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
                  <HelpCircle className="text-secondary-container" size={16} /> Por que
                  aconteceu?
                </h3>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Rompimento de um topo anterior que gerou o último fundo válido de baixa.
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
                  <MapPin className="text-secondary-container" size={16} /> Onde ocorreu?
                </h3>
                <p className="font-body-md text-on-surface-variant text-sm">
                  No suporte macro de H4, convergindo com um Order Block (OB).
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
                  <TrendingUp className="text-secondary-container" size={16} /> Como
                  identificar?
                </h3>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Observe o fechamento do candle acima do pivot point anterior.
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="text-error-container font-bold">!</span> Quando falha?
                </h3>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Se for apenas uma 'caça a liquidez' (sweep) e o preço retrair imediatamente.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="border border-secondary-container text-secondary-container font-label-md text-label-md py-2 px-6 rounded hover:bg-secondary-container/10 transition-colors flex items-center gap-2">
                <TrendingUp size={16} /> Ver no gráfico
              </button>
            </div>
          </div>

          {/* Card 2: Daily Missions */}
          <div className="lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col bg-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <Target className="text-primary" size={24} />
              Missões do Dia
            </h2>
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-md text-label-md text-on-surface-variant">Progresso</span>
              <span className="font-label-md text-label-md text-primary font-bold">3/5</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-primary w-[60%]"></div>
            </div>
            <ul className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {[
                { label: 'Encontrar suporte', done: true, xp: 25 },
                { label: 'Detectar tendência', done: true, xp: 25 },
                { label: 'Identificar liquidez', done: true, xp: 50 },
                { label: 'Analisar RSI', done: false, xp: 50 },
                { label: 'Concluir replay', done: false, xp: 100 },
              ].map((mission, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    mission.done
                      ? 'bg-surface-container-low border-primary/30 opacity-70'
                      : 'bg-surface-container-low border-outline-variant hover:border-secondary-container cursor-pointer group'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mission.done ? (
                      <CheckCircle2 className="text-primary" size={18} />
                    ) : (
                      <Circle className="text-on-surface-variant group-hover:text-secondary-fixed" size={18} />
                    )}
                    <span
                      className={`font-label-md text-label-md ${
                        mission.done ? 'text-on-surface line-through' : 'text-on-surface group-hover:text-secondary-fixed'
                      }`}
                    >
                      {mission.label}
                    </span>
                  </div>
                  <span
                    className={`font-label-sm text-label-sm ${
                      mission.done ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    +{mission.xp} XP
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Library */}
          <div className="lg:col-span-12 glass-panel rounded-xl p-6 bg-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
              <Library className="text-secondary-fixed" size={24} />
              Biblioteca de Conceitos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { t: 'Liquidez', l: 'Iniciante', c: 'text-primary' },
                { t: 'RSI', l: 'Iniciante', c: 'text-primary' },
                { t: 'MACD', l: 'Iniciante', c: 'text-primary' },
                { t: 'BOS', l: 'Intermediário', c: 'text-secondary-container' },
                { t: 'CHoCH', l: 'Intermediário', c: 'text-secondary-container' },
                { t: 'Order Block', l: 'Intermediário', c: 'text-secondary-container' },
                { t: 'Fair Value Gap', l: 'Intermediário', c: 'text-secondary-container' },
                { t: 'Volume Profile', l: 'Avançado', c: 'text-error-container' },
                { t: 'Wyckoff', l: 'Avançado', c: 'text-error-container' },
                { t: 'Elliott Waves', l: 'Avançado', c: 'text-error-container' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-surface-container-low rounded-lg border border-outline-variant hover:border-secondary-container hover:bg-surface-variant/50 transition-all cursor-pointer group"
                >
                  <h3 className="font-label-md text-label-md text-on-surface group-hover:text-secondary-fixed mb-1">
                    {item.t}
                  </h3>
                  <span className={`font-label-sm text-label-sm ${item.c}`}>
                    {item.l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Replay */}
          <div className="lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col bg-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2 flex items-center gap-2">
              <Clapperboard className="text-secondary-container" size={24} />
              Replay Interativo
            </h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Observe a ação do preço atual.
            </p>
            <div className="bg-surface-container-high rounded-lg p-6 mb-6 flex-1 border border-outline-variant flex flex-col justify-center items-center text-center pb-8">
              <span className="font-headline-md text-headline-md text-on-surface mb-4">
                O que você faria agora?
              </span>
              <div className="flex gap-4">
                <button className="bg-primary-container text-black font-label-md font-bold py-2 px-6 rounded hover:opacity-90">
                  Comprar
                </button>
                <button className="bg-error-container text-white font-label-md font-bold py-2 px-6 rounded hover:opacity-90">
                  Vender
                </button>
                <button className="bg-surface text-on-surface border border-outline font-label-md py-2 px-6 rounded hover:bg-surface-variant">
                  Esperar
                </button>
              </div>
            </div>
            <div className="bg-secondary-container/10 p-4 rounded-lg border border-secondary-container/30 relative">
              <div className="absolute -top-3 left-4 bg-surface px-2 text-xs font-bold text-secondary-container tracking-wider">
                IA PROFESSOR
              </div>
              <p className="font-body-md text-on-surface italic mt-2 text-sm">
                "Eu escolheria <span className="text-secondary-container font-semibold">esperar</span> porque o preço está comprimindo em um triângulo simétrico sob baixa liquidez."
              </p>
              <button className="mt-3 text-secondary-container font-label-sm hover:underline flex items-center gap-1">
                Ver explicação completa <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 5: Evolution */}
          <div className="lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col bg-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary-fixed" size={24} />
              Evolução do Aprendizado
            </h2>
            <div className="space-y-4 flex-1">
              {[
                { name: 'RSI & Osciladores', score: 80, color: 'bg-primary' },
                { name: 'Gerenciamento de Risco', score: 60, color: 'bg-primary' },
                { name: 'Estrutura de Mercado', score: 50, color: 'bg-secondary-container' },
                { name: 'Identificação de Liquidez', score: 40, color: 'bg-error-container' },
                { name: 'Wyckoff Avançado', score: 20, color: 'bg-error-container' },
              ].map((skill, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label-md text-on-surface">{skill.name}</span>
                    <span className="font-label-sm text-on-surface-variant">{skill.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color}`} style={{ width: `${skill.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-error-container/30 flex items-start gap-3">
              <Lightbulb className="text-error-container shrink-0" size={20} />
              <div>
                <h4 className="font-label-md text-on-surface font-bold">Foco de Melhoria Sugerido</h4>
                <p className="font-body-md text-on-surface-variant text-sm mt-1">
                  Recomendamos revisar os conceitos básicos de Liquidez Institucional antes de avançar
                  para Wyckoff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 md:left-64 right-0 flex justify-between items-center h-12 px-6 z-40">
         <span className="font-label-sm font-bold text-on-surface">© 2024 HUNTER TRADE OS</span>
      </footer>
    </div>
  );
}

function Brain({ ...props }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}
