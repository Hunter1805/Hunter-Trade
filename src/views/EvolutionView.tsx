import React from 'react';
import { useAlerts } from '../context/AlertsContext';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award,
  BarChart2,
  Trash2,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';

export function EvolutionView() {
  const { studyMemory, updateStudyResult, clearStudyMemory } = useAlerts();

  // Calcula Estatísticas de Aprendizado Pessoal
  const totalStudied = studyMemory.length;
  
  // Taxa de Acerto (Wins / (Wins + Losses))
  let wins = 0;
  let losses = 0;
  studyMemory.forEach(study => {
    if (!study.resultadoObservado) return;
    
    // Se era esperado alta e subiu, ou esperado baixa e caiu = Win
    if (
      (study.expectedDirection === 'Alta' && study.resultadoObservado === 'Subiu') ||
      (study.expectedDirection === 'Baixa' && study.resultadoObservado === 'Caiu')
    ) {
      wins++;
    } 
    // Se foi na direção contrária = Loss
    else if (
      (study.expectedDirection === 'Alta' && study.resultadoObservado === 'Caiu') ||
      (study.expectedDirection === 'Baixa' && study.resultadoObservado === 'Subiu')
    ) {
      losses++;
    }
    // Lateralizou não afeta acerto/erro direto
  });

  const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  // Padrões mais vistos (analisando o tipo de alerta se estiver no ID ou nome, 
  // aqui vamos extrair do alertaId ou estrutura)
  const patternCounts: Record<string, number> = {};
  const structureCounts: Record<string, number> = {};

  studyMemory.forEach(study => {
    // Conta estruturas
    const est = study.estrutura || 'Consolidação';
    structureCounts[est] = (structureCounts[est] || 0) + 1;

    // Conta Padrões baseados no alerta
    let pattern = 'Sinal Técnico Genérico';
    if (study.alertaId) {
      if (study.alertaId.includes('rsi')) pattern = 'RSI Extremo';
      else if (study.alertaId.includes('ema')) pattern = 'Cruzamento de Médias';
      else if (study.alertaId.includes('breakout')) pattern = 'Breakout';
      else if (study.alertaId.includes('bos')) pattern = 'BOS (Break of Structure)';
      else if (study.alertaId.includes('choch')) pattern = 'CHoCH (Change of Character)';
      else if (study.alertaId.includes('volume')) pattern = 'Volume Spike';
      else if (study.alertaId.includes('score')) pattern = 'Opportunity Score Alto';
    }
    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
  });

  const topPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';
  const topStructure = Object.entries(structureCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-6 z-40 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/30 p-1.5 rounded-lg">
            <TrendingUp className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface flex items-center gap-2">
              Aprendizado Pessoal & Evolução
            </h2>
            <p className="font-label-sm text-[11px] text-on-surface-variant/70">
              Memória de estudo e estatísticas do usuário
            </p>
          </div>
        </div>

        <div>
          <button 
            onClick={clearStudyMemory}
            className="text-[11px] font-label-md text-error/80 hover:text-error transition-colors flex items-center gap-1 cursor-pointer bg-error/10 px-3 py-1.5 rounded-lg border border-error/20"
          >
            <Trash2 size={14} /> Limpar Memória
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6">
        
        {/* MÓDULO 3: PAINEL DE APRENDIZADO PESSOAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container/60 border border-outline-variant rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BookOpen size={48} className="text-secondary-container" />
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Oportunidades Estudadas</span>
            <span className="font-headline-lg text-[28px] font-black text-on-surface">{totalStudied}</span>
            <span className="text-[10px] text-on-surface-variant mt-2">Salvas da Central de Alertas</span>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={48} className="text-primary" />
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Taxa de Acerto Pessoal</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-headline-lg text-[28px] font-black ${winRate >= 60 ? 'text-primary' : winRate >= 40 ? 'text-secondary-container' : 'text-error'}`}>
                {winRate}%
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-2">{wins} acertos de {wins + losses} mapeados válidos</span>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart2 size={48} className="text-[#38bdf8]" />
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Padrão Mais Visto</span>
            <span className="font-headline-md text-[18px] font-bold text-[#38bdf8] mt-1">{topPattern}</span>
            <span className="text-[10px] text-on-surface-variant mt-2">Sinal mais recorrente nos estudos</span>
          </div>

          <div className="bg-surface-container/60 border border-outline-variant rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award size={48} className="text-[#a78bfa]" />
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Estrutura Frequente</span>
            <span className="font-headline-md text-[18px] font-bold text-[#a78bfa] mt-1 truncate" title={topStructure}>{topStructure}</span>
            <span className="text-[10px] text-on-surface-variant mt-2">Contexto estrutural dominante</span>
          </div>
        </div>

        {/* MÓDULO 2: MEMÓRIA DE ESTUDO (LISTAGEM) */}
        <div className="mt-8">
          <h3 className="font-headline-md text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Histórico da Memória de Estudos
          </h3>

          {studyMemory.length === 0 ? (
            <div className="text-center bg-surface-container-lowest border border-outline-variant/50 p-8 rounded-xl">
              <p className="text-on-surface-variant text-[13px]">Sua memória de estudos está vazia. Salve oportunidades na Central de Alertas para começar a registrar e aprender com os seus padrões operacionais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyMemory.map(study => (
                <div key={study.id} className="glass-panel border border-outline-variant/60 rounded-xl p-4 flex flex-col">
                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-[15px] text-on-surface flex items-center gap-2">
                        {study.assetName}
                        {study.alertaId?.includes('simulator') && (
                           <span className="bg-secondary-container/20 text-secondary-container text-[9px] px-1.5 py-0.5 rounded border border-secondary-container/30 uppercase font-bold">Simulação</span>
                        )}
                        <span className="text-[9px] font-mono bg-surface-variant/80 px-1.5 py-0.5 rounded text-on-surface-variant">{study.horario}</span>
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        <span className="font-bold">Score IA:</span> <span className="text-secondary-container">{study.score}</span> • 
                        <span className="font-bold ml-2">Viés:</span> <span className={study.expectedDirection === 'Alta' ? 'text-primary' : study.expectedDirection === 'Baixa' ? 'text-error' : 'text-on-surface-variant'}>{study.expectedDirection}</span>
                      </p>
                    </div>
                    {/* Status Result Badge */}
                    {study.resultadoObservado && (
                      <div className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 border
                        ${study.resultadoObservado === 'Subiu' ? 'bg-primary/10 text-primary border-primary/30' : 
                          study.resultadoObservado === 'Caiu' ? 'bg-error/10 text-error border-error/30' : 
                          'bg-surface-variant text-on-surface border-outline-variant/50'
                        }`}
                      >
                        {study.resultadoObservado === 'Subiu' && <CheckCircle size={10} />}
                        {study.resultadoObservado === 'Caiu' && <XCircle size={10} />}
                        {study.resultadoObservado === 'Lateralizou' && <MinusCircle size={10} />}
                        Resultado: {study.resultadoObservado}
                      </div>
                    )}
                  </div>

                  {/* Dados Técnicos Salvos */}
                  <div className="bg-surface-container-lowest rounded-lg p-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] border border-outline-variant/30 mb-4 flex-1">
                    <div>
                      <span className="text-on-surface-variant font-bold block mb-0.5">RSI:</span>
                      <span className="text-on-surface">{study.rsi}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-bold block mb-0.5">EMA:</span>
                      <span className="text-on-surface">{study.ema}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-on-surface-variant font-bold block mb-0.5">Estrutura de Mercado:</span>
                      <span className="text-on-surface">{study.estrutura}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-on-surface-variant font-bold block mb-0.5">Conclusão IA (Snapshot):</span>
                      <span className="text-on-surface/80 italic">"{study.conclusaoIA}"</span>
                    </div>
                  </div>

                  {/* Ações de Resultado */}
                  <div className="border-t border-outline-variant/40 pt-3">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase block mb-2 text-center">
                      Qual foi o resultado observado?
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateStudyResult(study.id, 'Subiu')}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                          study.resultadoObservado === 'Subiu' 
                            ? 'bg-primary/20 text-primary border-primary/50' 
                            : 'bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary border-outline-variant/50'
                        }`}
                      >
                        Subiu
                      </button>
                      <button
                        onClick={() => updateStudyResult(study.id, 'Lateralizou')}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                          study.resultadoObservado === 'Lateralizou' 
                            ? 'bg-surface-variant text-on-surface border-outline-variant' 
                            : 'bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface border-outline-variant/50'
                        }`}
                      >
                        Lateralizou
                      </button>
                      <button
                        onClick={() => updateStudyResult(study.id, 'Caiu')}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors border cursor-pointer ${
                          study.resultadoObservado === 'Caiu' 
                            ? 'bg-error/20 text-error border-error/50' 
                            : 'bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error border-outline-variant/50'
                        }`}
                      >
                        Caiu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
