
import { GoogleGenAI, Type } from "@google/genai";

// Helper para retentativa com espera exponencial agressiva para contornar limites de cota
async function withRetry<T>(fn: () => Promise<T>, retries = 5, baseDelay = 12000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorString = String(error).toLowerCase();
      const errorMessage = (error?.message || '').toLowerCase();
      const errorCode = error?.status || error?.code || error?.error?.code;

      // Detecta especificamente erros de limite de cota (429) e sobrecarga do servidor (503)
      const isRetryableError = 
        errorCode === 429 || 
        errorCode === 503 ||
        errorCode === 500 || 
        errorString.includes('429') || 
        errorString.includes('quota') || 
        errorString.includes('exceeded') ||
        errorString.includes('xhr error') || 
        errorString.includes('fetch failed') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('resource_exhausted');

      if (isRetryableError && i < retries - 1) {
        // Aumenta o atraso exponencialmente: 12s, 24s, 48s...
        const calculatedDelay = baseDelay * Math.pow(2, i); 
        const delay = Math.min(calculatedDelay, 60000); 
        console.warn(`⚠️ Limite de cota atingido ou servidor instável. Tentativa ${i + 1}/${retries}. Aguardando ${delay/1000}s para evitar bloqueio...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateMockup(
  base64ImageData: string,
  mimeType: string,
  category: string,
  style: string,
  placement: string,
  color: string,
  size: string,
  sceneBase64?: string | null,
  sceneMimeType?: string | null,
  variationInstruction?: string,
  mockupType: 'standard' | '3d' = 'standard',
  backgroundType: string = 'studio',
  material: string = 'matte'
): Promise<string | null> {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) throw new Error("API_KEY environment variable not set");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const designPart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const parts: any[] = [designPart];
  
  const renderKeywords = mockupType === '3d' 
      ? 'Ultra-high quality 3D Digital Mockup, PBR Materials (Physically Based Rendering), Ray-traced reflections, Octane Render style, Unreal Engine 5 cinematic lighting, 8k resolution, clean digital surfaces, perfect geometry.'
      : 'Professional Product Photography, DSLR quality, natural studio lighting, soft shadows, 8k resolution, realistic depth of field, commercial advertisement style.';

  let selectedMaterialDesc = '';
  switch(material) {
      case 'matte': selectedMaterialDesc = 'Acabamento fosco (matte) premium, sem reflexos especulares, textura suave e aveludada.'; break;
      case 'glossy': selectedMaterialDesc = 'Acabamento brilhante (glossy) vibrante, com reflexos nítidos de luz de estúdio, superfície polida.'; break;
      case 'metallic': selectedMaterialDesc = 'Acabamento metálico industrial, reflexos de metal escovado, brilho metálico característico.'; break;
      case 'fabric': selectedMaterialDesc = 'Textura têxtil realista, trama de fios visível sob zoom, fibras naturais perceptíveis.'; break;
      case 'leather': selectedMaterialDesc = 'Textura de couro autêntica, padrão de grão irregular, rugosidade tátil realista.'; break;
      case 'paper': selectedMaterialDesc = 'Textura de papel premium, celulose visível, toque poroso e orgânico.'; break;
      default: selectedMaterialDesc = 'Acabamento de material realista de alta qualidade.';
  }

  let bgInstruction = '';
  if (backgroundType === 'custom' && sceneBase64 && sceneMimeType) {
      parts.push({
          inlineData: {
              data: sceneBase64,
              mimeType: sceneMimeType,
          },
      });
      bgInstruction = `INTEGRATION: Place the product naturally into the provided custom scene. Match the lighting, shadows, and perspective of the scene.`;
  } else if (backgroundType === 'solid') {
      bgInstruction = `BACKGROUND: A pure, clean, solid flat background with the hex color matching the product's base color (${color}). No shadows on the background, minimal modern look.`;
  } else if (backgroundType === 'lifestyle') {
      bgInstruction = `BACKGROUND: A realistic and relevant lifestyle environment for a ${category}. Use depth of field to keep the focus on the product. The environment should be modern and professional.`;
  } else {
      bgInstruction = `BACKGROUND: A clean, professional isolated studio background with soft infinite floor and professional lighting.`;
  }

  const promptText = `TASK: Create a ${mockupType === '3d' ? '3D Render' : 'Photo Mockup'} of a ${category}.
- RENDER MODE: ${renderKeywords}.
- DESIGN ATTACHMENT: Apply the provided graphic onto the ${category}.
- BASE COLOR: ${color}.
- MATERIAL TEXTURE: ${selectedMaterialDesc}
- POSITIONING: ${placement}.
- VISUAL STYLE: ${style}.
- ${bgInstruction}
${variationInstruction ? `NOTE: ${variationInstruction}` : ''}
The design must follow the curves, folds, and perspective of the ${category} perfectly.`;

  parts.push({ text: promptText });

  return withRetry(async () => {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: parts },
          config: { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return part.inlineData.data;
      }
      return null;
  });
}

export async function cleanImage(
    base64ImageData: string,
    mimeType: string
): Promise<string | null> {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) throw new Error("API_KEY not set");

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const imagePart = { inlineData: { data: base64ImageData, mimeType } };

    const promptText = `TASK: Background Removal and Asset Extraction.
GOAL: Extract the logo/graphic from the image and provide it on a pure transparent background.
- Remove all shadows, backgrounds, and extra elements.
- Rectify perspective: Output the design perfectly flat and centered.
- Enhance edges: Crisp, sharp alpha channel extraction.
- OUTPUT: PNG with transparency containing ONLY the clean design asset.`;

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, { text: promptText }] },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return part.inlineData.data;
        }
        return null;
    });
}

export interface VoiceCommandResult {
  categories: string[];
  style: string | null;
  color: string | null;
  placement: string | null;
}

export async function processVoiceCommand(
    audioBase64: string, 
    mimeType: string,
    availableCategories: string[],
    availableStyles: string[],
    availableColors: string[]
): Promise<VoiceCommandResult> {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) throw new Error("API_KEY not set");

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-3-flash-preview';

    const prompt = `
    You are a Voice UI assistant for a Mockup App.
    Map the user's audio request to these options:
    - Categories: ${JSON.stringify(availableCategories)}
    - Styles: ${JSON.stringify(availableStyles)}
    - Colors: ${JSON.stringify(availableColors)}

    Return ONLY a JSON object with:
    { "categories": string[], "style": string|null, "color": string|null, "placement": string|null }
    `;

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ inlineData: { data: audioBase64, mimeType } }, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                        style: { type: Type.STRING },
                        color: { type: Type.STRING },
                        placement: { type: Type.STRING }
                    }
                }
            }
        });

        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText) as VoiceCommandResult;
    });
}
