export type MockCandle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ScenarioOverlay = {
  type: 'BOS' | 'CHoCH' | 'Support' | 'Resistance' | 'Trendline' | 'Liquidity' | 'Sweep';
  startIndex: number;
  endIndex: number;
  value: number; // price level
  label?: string;
  color?: string;
};

export type ScenarioHighlight = {
  startIndex: number;
  endIndex: number;
  color: 'green' | 'red' | 'blue' | 'yellow';
  label?: string;
};

export type Scenario = {
  id: string;
  title: string;
  candles: MockCandle[];
  overlays?: ScenarioOverlay[];
  highlights?: ScenarioHighlight[];
  showRSI?: boolean;
  rsiValues?: number[]; 
  showEMA200?: boolean;
  emaValues?: number[];
};

// Helper function to generate basic candles
function generateTrend(startPrice: number, steps: number, type: 'up' | 'down' | 'range', volatility: number = 2): MockCandle[] {
  let currentPrice = startPrice;
  const candles: MockCandle[] = [];
  for (let i = 0; i < steps; i++) {
    const isUp = type === 'up' ? Math.random() > 0.3 : type === 'down' ? Math.random() > 0.7 : Math.random() > 0.5;
    const bodySize = Math.random() * volatility + 1;
    const wickTop = Math.random() * (volatility / 2);
    const wickBottom = Math.random() * (volatility / 2);
    
    let open, close, high, low;
    if (isUp) {
      open = currentPrice;
      close = currentPrice + bodySize;
      high = close + wickTop;
      low = open - wickBottom;
    } else {
      open = currentPrice;
      close = currentPrice - bodySize;
      high = open + wickTop;
      low = close - wickBottom;
    }
    
    candles.push({ open, close, high, low, volume: Math.random() * 1000 + 500 });
    currentPrice = close;
  }
  return candles;
}

// Generate explicit custom candles for specific lessons
const uptrendCandles = [
  { open: 100, close: 105, high: 106, low: 99, volume: 1000 },
  { open: 105, close: 104, high: 107, low: 103, volume: 800 },
  { open: 104, close: 110, high: 112, low: 103, volume: 1500 }, // Impulsive
  { open: 110, close: 108, high: 111, low: 107, volume: 600 },
  { open: 108, close: 115, high: 116, low: 108, volume: 1200 }, // Impulsive
  { open: 115, close: 114, high: 117, low: 112, volume: 500 },
  { open: 114, close: 120, high: 122, low: 113, volume: 1600 }
];

const overboughtCandles = [
  { open: 100, close: 102, high: 103, low: 99, volume: 1000 },
  { open: 102, close: 106, high: 107, low: 101, volume: 1200 },
  { open: 106, close: 112, high: 113, low: 105, volume: 2000 },
  { open: 112, close: 120, high: 122, low: 110, volume: 3000 }, // Climax
  { open: 120, close: 115, high: 123, low: 114, volume: 2500 }, // Exhaustion
  { open: 115, close: 108, high: 116, low: 105, volume: 1800 }
];

const bosCandles = [
  { open: 100, close: 105, high: 106, low: 99, volume: 1000 },
  { open: 105, close: 103, high: 107, low: 102, volume: 800 },
  { open: 103, close: 100, high: 104, low: 99, volume: 900 }, // Pullback
  { open: 100, close: 104, high: 105, low: 98, volume: 1100 },
  { open: 104, close: 112, high: 114, low: 103, volume: 2500 }, // BOS Candle
  { open: 112, close: 115, high: 117, low: 111, volume: 1500 }
];

const fakeBreakoutCandles = [
  { open: 100, close: 105, high: 106, low: 99, volume: 1000 },
  { open: 105, close: 102, high: 106, low: 101, volume: 800 },
  { open: 102, close: 106, high: 115, low: 102, volume: 4000 }, // Huge wick up (Fakeout)
  { open: 106, close: 95, high: 107, low: 94, volume: 3000 }, // Reversal
  { open: 95, close: 90, high: 96, low: 88, volume: 2000 }
];

const liquiditySweepCandles = [
  { open: 100, close: 95, high: 101, low: 94, volume: 1000 },
  { open: 95, close: 98, high: 99, low: 93, volume: 800 },
  { open: 98, close: 95, high: 99, low: 94, volume: 900 }, // Equal Lows formed at 94/93
  { open: 95, close: 102, high: 103, low: 90, volume: 4000 }, // Sweep down to 90 then blast up
  { open: 102, close: 108, high: 110, low: 101, volume: 2000 }
];

export const scenarios: Record<string, Scenario> = {
  'trend-up': {
    id: 'trend-up',
    title: 'Tendência de Alta',
    candles: uptrendCandles,
    overlays: [
      { type: 'Trendline', startIndex: 0, endIndex: 6, value: 99, label: 'LTA' }
    ],
    highlights: [
      { startIndex: 2, endIndex: 2, color: 'green', label: 'Impulso' },
      { startIndex: 4, endIndex: 4, color: 'green', label: 'Impulso' }
    ]
  },
  'rsi-overbought': {
    id: 'rsi-overbought',
    title: 'Exaustão (RSI Sobrecomprado)',
    candles: overboughtCandles,
    showRSI: true,
    rsiValues: [55, 65, 78, 92, 85, 60],
    highlights: [
      { startIndex: 3, endIndex: 3, color: 'red', label: 'Exaustão' }
    ]
  },
  'bos-up': {
    id: 'bos-up',
    title: 'BOS (Break of Structure)',
    candles: bosCandles,
    overlays: [
      { type: 'Resistance', startIndex: 0, endIndex: 4, value: 106, label: 'Resistência Antiga' },
      { type: 'BOS', startIndex: 4, endIndex: 5, value: 106, label: 'BOS Confirmado' }
    ],
    highlights: [
      { startIndex: 4, endIndex: 4, color: 'green', label: 'Rompimento com Força' }
    ]
  },
  'fakeout': {
    id: 'fakeout',
    title: 'Falso Rompimento',
    candles: fakeBreakoutCandles,
    overlays: [
      { type: 'Resistance', startIndex: 0, endIndex: 3, value: 106, label: 'Resistência' },
      { type: 'Sweep', startIndex: 2, endIndex: 2, value: 115, label: 'Armadilha' }
    ],
    highlights: [
      { startIndex: 2, endIndex: 2, color: 'yellow', label: 'Pavio Gigante' }
    ]
  },
  'liquidity': {
    id: 'liquidity',
    title: 'Captura de Liquidez',
    candles: liquiditySweepCandles,
    overlays: [
      { type: 'Support', startIndex: 0, endIndex: 3, value: 94, label: 'Equal Lows (Liquidez)' },
      { type: 'Sweep', startIndex: 3, endIndex: 3, value: 90, label: 'Sweep' }
    ],
    highlights: [
      { startIndex: 3, endIndex: 3, color: 'blue', label: 'Caça aos Stops' }
    ]
  },
  'single-candle-green': {
    id: 'single-candle-green',
    title: 'O que é um Candle de Alta',
    candles: [
      { open: 100, close: 100, high: 100, low: 100, volume: 100 }, // pad
      { open: 100, close: 115, high: 118, low: 98, volume: 1000 },
      { open: 115, close: 115, high: 115, low: 115, volume: 100 } // pad
    ],
    highlights: [
      { startIndex: 1, endIndex: 1, color: 'green', label: 'Corpo Forte' }
    ]
  },
  'single-candle-red': {
    id: 'single-candle-red',
    title: 'O que é um Candle de Baixa',
    candles: [
      { open: 115, close: 115, high: 115, low: 115, volume: 100 }, // pad
      { open: 115, close: 100, high: 118, low: 98, volume: 1000 },
      { open: 100, close: 100, high: 100, low: 100, volume: 100 } // pad
    ],
    highlights: [
      { startIndex: 1, endIndex: 1, color: 'red', label: 'Pressão Vendedora' }
    ]
  },
  'wick-rejection': {
    id: 'wick-rejection',
    title: 'Pavio de Rejeição',
    candles: [
      { open: 100, close: 105, high: 106, low: 99, volume: 800 },
      { open: 105, close: 107, high: 120, low: 104, volume: 2000 }, // Long wick up
      { open: 107, close: 95, high: 108, low: 94, volume: 1500 }
    ],
    highlights: [
      { startIndex: 1, endIndex: 1, color: 'yellow', label: 'Rejeição (Vendedores atacaram)' }
    ]
  },
  'ema-trend': {
    id: 'ema-trend',
    title: 'Navegando com a EMA 200',
    candles: uptrendCandles,
    showEMA200: true,
    emaValues: [95, 96, 97, 98, 99, 100, 101] // Below the candles
  },
  'lateral-range': {
    id: 'lateral-range',
    title: 'Mercado Lateral',
    candles: [
      { open: 100, close: 105, high: 106, low: 99, volume: 1000 },
      { open: 105, close: 100, high: 106, low: 99, volume: 900 },
      { open: 100, close: 104, high: 106, low: 99, volume: 1100 },
      { open: 104, close: 101, high: 105, low: 98, volume: 800 },
      { open: 101, close: 105, high: 106, low: 99, volume: 1200 }
    ],
    overlays: [
      { type: 'Resistance', startIndex: 0, endIndex: 4, value: 106, label: 'Teto' },
      { type: 'Support', startIndex: 0, endIndex: 4, value: 99, label: 'Chão' }
    ]
  }
};
