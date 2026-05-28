import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, PauseCircle, RefreshCw } from 'lucide-react';
import { scenarios, Scenario, MockCandle } from './academyScenarios';

interface LessonChartPlayerProps {
  scenarioId?: string;
  onFinish?: () => void;
}

export function LessonChartPlayer({ scenarioId, onFinish }: LessonChartPlayerProps) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  useEffect(() => {
    if (scenarioId && scenarios[scenarioId]) {
      setScenario(scenarios[scenarioId]);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [scenarioId]);

  useEffect(() => {
    if (!scenario || !isPlaying) return;
    
    if (currentIndex < scenario.candles.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 800); // 800ms per candle for educational replay
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      if (onFinish) onFinish();
    }
  }, [currentIndex, isPlaying, scenario, onFinish]);

  const handleReplay = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  if (!scenario) {
    return (
      <div className="w-full h-64 bg-surface-container rounded-2xl border border-outline-variant flex items-center justify-center">
        <p className="text-on-surface-variant font-body-md">Carregando cenário...</p>
      </div>
    );
  }

  // --- SVG Dimensions and Scaling ---
  const width = 800;
  const height = 300;
  const padding = { top: 40, bottom: 40, left: 40, right: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Calculate Min/Max of the ENTIRE scenario so scale doesn't jump
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  scenario.candles.forEach(c => {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
  });
  
  // Add some padding to price scale
  const priceRange = maxPrice - minPrice || 1;
  minPrice -= priceRange * 0.1;
  maxPrice += priceRange * 0.1;

  const getPriceY = (price: number) => {
    return padding.top + innerHeight - ((price - minPrice) / (maxPrice - minPrice)) * innerHeight;
  };

  const candleWidth = Math.min(40, innerWidth / scenario.candles.length * 0.6);
  const spacing = innerWidth / Math.max(scenario.candles.length, 5);

  const getCandleX = (index: number) => {
    return padding.left + (index + 0.5) * spacing;
  };

  const visibleCandles = scenario.candles.slice(0, currentIndex);

  return (
    <div className="w-full relative glass-panel rounded-2xl overflow-hidden bg-[#0A0E17] border border-primary/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
      {/* Premium Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-[#0A0E17] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#10B981]" />
          <span className="font-label-md text-primary font-bold uppercase tracking-wider">{scenario.title}</span>
        </div>
        <div className="flex gap-2">
          {currentIndex === scenario.candles.length && (
            <button 
              onClick={handleReplay}
              className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all border border-primary/30 flex items-center gap-2 font-label-sm"
            >
              <RefreshCw size={16} /> Replay
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto mt-4 drop-shadow-2xl">
        
        {/* Grid Lines */}
        <g className="opacity-10">
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + innerHeight * pct;
            return <line key={pct} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />;
          })}
        </g>

        {/* Price Axis Labels */}
        <g className="font-label-sm fill-on-surface-variant text-[10px]">
          {[0, 0.5, 1].map(pct => {
            const y = padding.top + innerHeight * pct;
            const price = maxPrice - (maxPrice - minPrice) * pct;
            return <text key={pct} x={width - padding.right + 10} y={y + 4}>{price.toFixed(2)}</text>;
          })}
        </g>

        {/* Overlays (Render if their startIndex is <= currentIndex) */}
        {scenario.overlays?.filter(o => currentIndex > o.startIndex).map((overlay, idx) => {
          const startX = getCandleX(overlay.startIndex);
          // If the overlay ends in the future, draw it up to the current candle
          const endIdx = Math.min(overlay.endIndex, currentIndex - 1);
          const endX = getCandleX(endIdx);
          const y = getPriceY(overlay.value);
          
          let color = '#3B82F6'; // Default blue
          if (overlay.type === 'Resistance') color = '#EF4444';
          if (overlay.type === 'Support') color = '#10B981';
          if (overlay.type === 'BOS') color = '#F59E0B';
          if (overlay.type === 'Sweep') color = '#8B5CF6';

          return (
            <g key={`overlay-${idx}`}>
              <line 
                x1={startX - candleWidth} 
                y1={y} 
                x2={endX + candleWidth} 
                y2={y} 
                stroke={color} 
                strokeWidth="2"
                strokeDasharray={overlay.type === 'BOS' ? '6 6' : '0'}
                className="drop-shadow-md"
              />
              <text x={endX + candleWidth + 5} y={y - 5} fill={color} className="font-label-sm text-[10px] font-bold">
                {overlay.label || overlay.type}
              </text>
            </g>
          );
        })}

        {/* EMA Line */}
        {scenario.showEMA200 && scenario.emaValues && (
          <path 
            d={scenario.emaValues.slice(0, currentIndex).map((val, i) => 
              `${i === 0 ? 'M' : 'L'} ${getCandleX(i)} ${getPriceY(val)}`
            ).join(' ')}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] opacity-80"
          />
        )}

        {/* Highlights */}
        {scenario.highlights?.filter(h => h.endIndex < currentIndex).map((high, idx) => {
          const x = getCandleX(high.startIndex);
          const y = padding.top - 15;
          const colorMap = {
            'green': '#10B981',
            'red': '#EF4444',
            'blue': '#3B82F6',
            'yellow': '#F59E0B'
          };
          const color = colorMap[high.color];
          return (
            <g key={`highlight-${idx}`} className="animate-in slide-in-from-top-4 fade-in duration-500">
               <rect 
                 x={getCandleX(high.startIndex) - candleWidth*1.2}
                 y={padding.top}
                 width={(getCandleX(high.endIndex) - getCandleX(high.startIndex)) + candleWidth*2.4}
                 height={innerHeight}
                 fill={color}
                 opacity="0.1"
                 rx="4"
               />
               <text x={x} y={y} fill={color} className="font-label-sm text-[12px] font-bold text-anchor-middle" textAnchor="middle">
                 {high.label}
               </text>
            </g>
          );
        })}

        {/* Candles */}
        {visibleCandles.map((candle, i) => {
          const isUp = candle.close >= candle.open;
          const color = isUp ? '#10B981' : '#EF4444'; // Neon Green or Neon Red
          const glowClass = isUp ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';
          
          const x = getCandleX(i);
          const yTop = getPriceY(candle.high);
          const yBottom = getPriceY(candle.low);
          const yBodyTop = getPriceY(Math.max(candle.open, candle.close));
          const yBodyBottom = getPriceY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(2, yBodyBottom - yBodyTop);

          return (
            <g key={i} className={`animate-in fade-in zoom-in duration-300 ${glowClass}`}>
              {/* Wick */}
              <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke={color} strokeWidth="2" />
              {/* Body */}
              <rect 
                x={x - candleWidth/2} 
                y={yBodyTop} 
                width={candleWidth} 
                height={bodyHeight} 
                fill={color} 
                rx="2"
              />
            </g>
          );
        })}

      </svg>
      
      {/* RSI Indicator Container */}
      {scenario.showRSI && scenario.rsiValues && (
        <div className="border-t border-outline-variant/30 bg-[#0A0E17]/50 h-24 relative p-2">
           <svg viewBox={`0 0 ${width} 100`} className="w-full h-full">
              {/* RSI Zones 70 and 30 */}
              <line x1={padding.left} y1="30" x2={width - padding.right} y2="30" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
              <line x1={padding.left} y1="70" x2={width - padding.right} y2="70" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
              <rect x={padding.left} y="30" width={innerWidth} height="40" fill="#3B82F6" opacity="0.05" />
              
              <text x={width - padding.right + 10} y="34" fill="#EF4444" className="font-label-sm text-[10px]">70</text>
              <text x={width - padding.right + 10} y="74" fill="#10B981" className="font-label-sm text-[10px]">30</text>

              {/* RSI Line */}
              <path 
                d={scenario.rsiValues.slice(0, currentIndex).map((val, i) => 
                  `${i === 0 ? 'M' : 'L'} ${getCandleX(i)} ${100 - val}`
                ).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"
              />
           </svg>
           <div className="absolute top-2 left-4 text-xs font-bold text-primary opacity-50">RSI 14</div>
        </div>
      )}
    </div>
  );
}
