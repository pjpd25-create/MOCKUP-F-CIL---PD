
import { GoogleGenAI, Type } from "@google/genai";

// Improved retry helper with specific handling for 429 (Resource Exhausted)
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 10000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorString = String(error).toLowerCase();
      const status = error?.status;
      
      const isQuotaError = 
        status === 429 || 
        errorString.includes('429') || 
        errorString.includes('quota') || 
        errorString.includes('resource_exhausted') ||
        errorString.includes('limit');

      if (isQuotaError && i < retries - 1) {
        // Wait longer for quota errors: 10s, 20s, 40s...
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`⚠️ Limite de API atingido. Tentativa ${i + 1}/${retries}. Aguardando ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Temporary server errors (5xx)
      if (status >= 500 && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
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
      ? 'Ultra-high quality 3D Digital Mockup, PBR Materials, Ray-traced reflections, Octane Render, 8k, clean digital surfaces.'
      : 'Professional Product Photography, DSLR, natural studio lighting, soft shadows, 8k, realistic fotorrealistic depth of field.';

  let selectedMaterialDesc = '';
  switch(material) {
      case 'matte': selectedMaterialDesc = 'Acabamento fosco premium.'; break;
      case 'glossy': selectedMaterialDesc = 'Acabamento brilhante vibrante.'; break;
      case 'metallic': selectedMaterialDesc = 'Acabamento metálico industrial.'; break;
      case 'fabric': selectedMaterialDesc = 'Textura têxtil realista.'; break;
      case 'leather': selectedMaterialDesc = 'Textura de couro autêntica.'; break;
      case 'paper': selectedMaterialDesc = 'Textura de papel premium.'; break;
      default: selectedMaterialDesc = 'Acabamento de material realista.';
  }

  let bgInstruction = '';
  if (backgroundType === 'custom' && sceneBase64 && sceneMimeType) {
      parts.push({
          inlineData: {
              data: sceneBase64,
              mimeType: sceneMimeType,
          },
      });
      bgInstruction = `Place the product naturally into the provided scene matching lighting and shadows.`;
  } else if (backgroundType === 'solid') {
      bgInstruction = `A pure solid flat background with the color ${color}.`;
  } else if (backgroundType === 'lifestyle') {
      bgInstruction = `A realistic lifestyle environment for a ${category}.`;
  } else {
      bgInstruction = `A clean professional isolated studio background.`;
  }

  const promptText = `TASK: Create a ${mockupType === '3d' ? '3D Render' : 'Photo Mockup'} of a ${category}.
- QUALITY: ${renderKeywords}.
- DESIGN: Apply provided design onto the product perfectly.
- COLOR: ${color}.
- TEXTURE: ${selectedMaterialDesc}
- POSITION: ${placement}.
- STYLE: ${style}.
- ${bgInstruction}
${variationInstruction ? `NOTE: ${variationInstruction}` : ''}`;

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

    const promptText = `Extract logo/graphic from image, output on pure transparent PNG. Remove backgrounds and shadows.`;

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

    const prompt = `Map user request to: categories (${JSON.stringify(availableCategories)}), styles (${JSON.stringify(availableStyles)}), colors (${JSON.stringify(availableColors)}). Return JSON with string array categories, style, color, placement.`;

    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
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

        const cleanedText = response.text.trim();
        return JSON.parse(cleanedText) as VoiceCommandResult;
    }, 1, 2000);
}
