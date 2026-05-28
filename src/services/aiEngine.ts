import { telemetry } from './telemetry';

export interface AIAnalysisResult {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  structure: string;
  risk: 'Low' | 'Moderate' | 'High';
  confidence: number;
  explanation: string;
  conclusion: string;
  reasons: string[];
}

export interface AIAnalysisInput {
  symbol: string;
  price: number;
  rsi: number;
  ema9: number;
  ema21: number;
  ema200: number;
  volume: number;
  timeframe: string;
  highsLows: {
    maxPrice: number;
    minPrice: number;
  };
}

/**
 * Executa a análise técnica do mercado utilizando a API do Gemini.
 * Se a API Key não estiver configurada ou a chamada falhar, utiliza o motor de fallback baseado em regras técnicas.
 */
export async function analyzeMarketWithAI(input: AIAnalysisInput): Promise<AIAnalysisResult> {
  // Pega a API Key das variáveis injetadas via Vite
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || 
                 (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY as string) : '') || 
                 '';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('[AIEngine] GEMINI_API_KEY não configurada. Utilizando análise de fallback baseada em regras técnicas.');
    telemetry.trackGeminiTime(0); // 0 indica que usou o fallback local imediatamente
    return generateFallbackAnalysis(input);
  }

  const prompt = `
Você é o motor de Inteligência Artificial do HUNTER TRADE OS, um analista técnico de alta precisão.
Analise os dados técnicos em tempo real abaixo para o ativo ${input.symbol} no timeframe ${input.timeframe}:

DADOS RECEBIDOS:
- Preço Atual: ${input.price}
- Máxima do Período: ${input.highsLows.maxPrice}
- Mínima do Período: ${input.highsLows.minPrice}
- RSI (14): ${input.rsi}
- EMA 9: ${input.ema9}
- EMA 21: ${input.ema21}
- EMA 200: ${input.ema200}
- Volume Médio: ${input.volume}

Regras Técnicas de Apoio:
1. Se o Preço Atual estiver acima da EMA 200, a tendência macro é de ALTA (Bullish). Se estiver abaixo, é de BAIXA (Bearish).
2. Se o RSI estiver acima de 70, o ativo está sobrecomprado (risco de correção). Se estiver abaixo de 30, está sobrevendido (oportunidade de repique).
3. EMA 9 acima da EMA 21 indica força de curto prazo de alta.

Gere uma resposta estritamente formatada em JSON, contendo a análise com a seguinte estrutura de propriedades:
{
  "trend": "Bullish" | "Bearish" | "Neutral",
  "structure": "BOS identified" | "CHoCH identified" | "Consolidação" | "Rompimento",
  "risk": "Low" | "Moderate" | "High",
  "confidence": 75, // valor numérico inteiro de 0 a 100
  "explanation": "Uma explicação sucinta em português das condições do mercado.",
  "conclusion": "Uma conclusão operacional clara em português (ex: Aguardar pullback na região X para compra).",
  "reasons": [
    "Motivo técnico 1 em português",
    "Motivo técnico 2 em português"
  ]
}
Responda APENAS com o JSON válido. Não inclua markdown (como \`\`\`json) na resposta.
`;

  const startTime = performance.now();
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Status de erro HTTP do Gemini: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Nenhuma resposta de texto encontrada na API do Gemini');
    }

    const parsedResult = JSON.parse(responseText.trim()) as AIAnalysisResult;
    
    // Registra a duração da requisição bem sucedida
    const durationMs = performance.now() - startTime;
    telemetry.trackGeminiTime(durationMs);

    // Valida os campos do JSON para evitar crashes
    return {
      trend: parsedResult.trend || 'Neutral',
      structure: parsedResult.structure || 'BOS identified',
      risk: parsedResult.risk || 'Moderate',
      confidence: typeof parsedResult.confidence === 'number' ? parsedResult.confidence : 70,
      explanation: parsedResult.explanation || 'Mercado sob análise de indicadores de tendência.',
      conclusion: parsedResult.conclusion || 'Aguardar definição de direção técnica.',
      reasons: Array.isArray(parsedResult.reasons) ? parsedResult.reasons : ['Análise baseada em EMAs e RSI.'],
    };

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    telemetry.trackError(`Gemini: ${errorMsg}`);
    console.error('[AIEngine] Falha ao chamar a API do Gemini. Usando análise técnica de fallback.', error);
    return generateFallbackAnalysis(input);
  }
}

/**
 * Gera análise técnica baseada em regras determinísticas caso a chamada do Gemini falhe.
 * Garante inteligência e robustez mesmo em modo offline ou sem chaves configuradas.
 */
function generateFallbackAnalysis(input: AIAnalysisInput): AIAnalysisResult {
  const isAboveEma200 = input.price > input.ema200;
  const isFastAboveSlow = input.ema9 > input.ema21;
  const isOverbought = input.rsi > 68;
  const isOversold = input.rsi < 32;

  let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  let structure = 'Consolidação';
  let risk: 'Low' | 'Moderate' | 'High' = 'Moderate';
  let confidence = 70;
  let explanation = '';
  let conclusion = '';
  const reasons: string[] = [];

  // Define tendência macro
  if (isAboveEma200) {
    trend = 'Bullish';
    structure = isFastAboveSlow ? 'BOS identified' : 'Pullback macro';
    reasons.push(`Preço acima da EMA 200 indicando tendência macro de alta.`);
  } else {
    trend = 'Bearish';
    structure = !isFastAboveSlow ? 'CHoCH bearish' : 'Retração na queda';
    reasons.push(`Preço abaixo da EMA 200 indicando tendência macro de baixa.`);
  }

  // Avalia RSI
  if (isOverbought) {
    risk = 'High';
    confidence = 80;
    reasons.push(`RSI em ${input.rsi} indica região de sobrecompra extrema.`);
    explanation = `${input.symbol} demonstra forte momentum comprador, porém o indicador RSI sinaliza cansaço no topo de curto prazo, sugerindo exaustão iminente.`;
    conclusion = `Evitar compras imediatas. Aguardar pullback na região da EMA 21 ou consolidação antes de novas entradas.`;
  } else if (isOversold) {
    risk = 'Moderate';
    confidence = 82;
    reasons.push(`RSI em ${input.rsi} indica região de sobrevenda (possível repique).`);
    explanation = `O ativo encontra-se severamente desvalorizado no curto prazo com RSI sobrevendido. Um repique técnico em direção às médias móveis rápidas é provável.`;
    conclusion = `Procurar gatilhos de compra de curto prazo com stop posicionado abaixo da mínima recente de ${input.highsLows.minPrice.toFixed(2)}.`;
  } else {
    // RSI neutro
    if (trend === 'Bullish') {
      risk = isFastAboveSlow ? 'Low' : 'Moderate';
      confidence = 75;
      reasons.push(`Médias móveis rápidas (EMA 9/21) alinhadas favoravelmente.`);
      explanation = `Tendência de alta saudável confirmada pelo alinhamento das médias móveis rápidas e RSI estável em ${input.rsi}.`;
      conclusion = `Operação a favor da tendência. Buscar compras próximo à região das médias de ${input.ema21.toFixed(2)}.`;
    } else {
      risk = 'Moderate';
      confidence = 72;
      reasons.push(`EMA 9 e 21 servindo como resistências dinâmicas no gráfico.`);
      explanation = `Pressão de venda prevalece. As médias rápidas continuam atuando como barreiras de preço para qualquer tentativa de alta.`;
      conclusion = `Evitar compras. Procurar posições vendedoras caso o preço falhe em romper a EMA 9 em ${input.ema9.toFixed(2)}.`;
    }
  }

  return {
    trend,
    structure,
    risk,
    confidence,
    explanation,
    conclusion,
    reasons,
  };
}
