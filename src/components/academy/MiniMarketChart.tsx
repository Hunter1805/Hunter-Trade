import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';

interface MiniMarketChartProps {
  config?: {
    showEMA200?: boolean;
    highlightTrend?: 'up' | 'down' | 'lateral';
    showBOS?: boolean;
    showRSI?: boolean;
    highlightRSI?: 'overbought' | 'oversold' | 'neutral';
    highlightCandles?: 'impulsive' | 'weak';
    simulateAction?: boolean;
    drawArrows?: { xIndex: number, direction: 'up' | 'down' }[];
    paintRegion?: { startIndex: number, endIndex: number, color: 'green' | 'red' | 'blue' };
  };
}

export function MiniMarketChart({ config = {} }: MiniMarketChartProps) {
  const { marketData, activeSymbol } = useMarket();
  const data = marketData[activeSymbol];

  const candles = useMemo(() => {
    if (!data?.candles) return [];
    return data.candles.slice(-50);
  }, [data]);

  if (!data || candles.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-surface-container rounded-xl border border-outline-variant">
        <span className="text-on-surface-variant font-label-md">Carregando dados reais...</span>
      </div>
    );
  }

  const minPrice = Math.min(...candles.map(c => c.low));
  const maxPrice = Math.max(...candles.map(c => c.high));
  const padding = (maxPrice - minPrice) * 0.15;
  const chartMin = minPrice - padding;
  const chartMax = maxPrice + padding;
  const range = chartMax - chartMin;

  const width = 800;
  const height = 300;
  const candleWidth = width / candles.length;

  const getY = (val: number) => height - ((val - chartMin) / range) * height;

  return (
    <div className="w-full bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden flex flex-col relative shadow-lg">
      <div className="p-3 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container">
        <div className="flex items-center gap-3">
          <span className="font-label-md text-on-surface font-bold">{data.name}</span>
          <span className="font-label-sm px-2 py-0.5 bg-primary/10 text-primary rounded">{data.timeframe}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           <span className="font-label-md text-primary font-mono">{data.price.toFixed(5)}</span>
        </div>
      </div>

      <div className="relative w-full h-64 bg-[#0b0f19]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Paint Region Background */}
          {config.paintRegion && (
            <rect 
              x={width + (config.paintRegion.startIndex * candleWidth)} 
              y={0} 
              width={(config.paintRegion.endIndex - config.paintRegion.startIndex) * candleWidth} 
              height={height} 
              fill={config.paintRegion.color === 'blue' ? 'rgba(59,130,246,0.1)' : config.paintRegion.color === 'green' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'} 
            />
          )}

          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1={height * 0.50} x2={width} y2={height * 0.50} stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />

          {config.highlightTrend === 'up' && (
            <polygon points={`0,${height} ${width},0 ${width},${height}`} fill="rgba(16,185,129,0.05)" />
          )}

          {config.showEMA200 && (
            <polyline
              points={candles.map((c, i) => `${i * candleWidth + candleWidth/2},${getY(c.ema200)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          )}

          {candles.map((c, i) => {
            const isUp = c.close >= c.open;
            const x = i * candleWidth;
            const cx = x + candleWidth / 2;
            const topY = getY(Math.max(c.open, c.close));
            const bottomY = getY(Math.min(c.open, c.close));
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const cHeight = Math.max(1, bottomY - topY);
            
            let color = isUp ? '#10b981' : '#ef4444';
            
            const isImpulsive = config.highlightCandles === 'impulsive' && (Math.abs(c.close - c.open) / c.open) > 0.002;
            const dropShadow = isImpulsive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,1)]' : '';
            const rectFill = isImpulsive ? '#3b82f6' : (isUp ? '#10b981' : '#ef4444');
            const rectStroke = isImpulsive ? '#60a5fa' : color;

            return (
              <g key={i} className={dropShadow}>
                <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={rectStroke} strokeWidth="1.5" opacity={isImpulsive ? 1 : 0.8} />
                <rect
                  x={x + candleWidth * 0.2}
                  y={topY}
                  width={candleWidth * 0.6}
                  height={cHeight}
                  fill={rectFill}
                  stroke={rectStroke}
                  strokeWidth="1"
                  opacity={isImpulsive ? 1 : 0.9}
                />
              </g>
            );
          })}

          {config.showBOS && (
            <g>
               <line x1={0} y1={height * 0.3} x2={width} y2={height * 0.3} stroke="#eab308" strokeWidth="2" strokeDasharray="5,5" className="drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
               <rect x={10} y={height * 0.3 - 22} width={40} height={20} fill="#eab308" rx={4} />
               <text x={15} y={height * 0.3 - 8} fill="#000" className="font-bold text-xs" style={{ fontFamily: 'sans-serif' }}>BOS</text>
            </g>
          )}

          {/* Draw Arrows */}
          {config.drawArrows && config.drawArrows.map((arrow, i) => {
            const index = arrow.xIndex < 0 ? candles.length + arrow.xIndex : arrow.xIndex;
            if (index < 0 || index >= candles.length) return null;
            const x = index * candleWidth + candleWidth / 2;
            const c = candles[index];
            const y = arrow.direction === 'up' ? getY(c.low) + 20 : getY(c.high) - 20;
            return (
              <g key={`arr-${i}`} className="animate-bounce" style={{ animationDuration: '2s' }}>
                <path 
                  d={arrow.direction === 'up' 
                    ? `M${x-10},${y+15} L${x},${y} L${x+10},${y+15}` 
                    : `M${x-10},${y-15} L${x},${y} L${x+10},${y-15}`} 
                  fill="none" 
                  stroke={arrow.direction === 'up' ? '#10b981' : '#ef4444'} 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`drop-shadow-[0_0_8px_${arrow.direction === 'up' ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'}]`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {config.showRSI && (
        <div className="h-20 border-t border-outline-variant/50 relative bg-[#0b0f19]">
           <svg viewBox={`0 0 ${width} 100`} className="w-full h-full" preserveAspectRatio="none">
             <rect x={0} y={30} width={width} height={40} fill="rgba(59,130,246,0.05)" />
             <line x1={0} y1={30} x2={width} y2={30} stroke="#3f3f46" strokeDasharray="4,4" />
             <line x1={0} y1={70} x2={width} y2={70} stroke="#3f3f46" strokeDasharray="4,4" />
             
             <polyline
              points={candles.map((c, i) => `${i * candleWidth + candleWidth/2},${100 - (c.rsi || 50)}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              className={config.highlightRSI ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : ""}
            />
           </svg>
           {config.highlightRSI === 'overbought' && (
             <div className="absolute top-1 right-2 text-error text-[10px] font-bold bg-error/10 px-2 py-0.5 rounded border border-error/30">SOBRECOMPRADO (RSI &gt; 70)</div>
           )}
           {config.highlightRSI === 'oversold' && (
             <div className="absolute bottom-1 right-2 text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/30">SOBREVENDIDO (RSI &lt; 30)</div>
           )}
           <div className="absolute left-2 top-1 text-on-surface-variant text-[10px] font-bold">RSI (14)</div>
        </div>
      )}
    </div>
  );
}
