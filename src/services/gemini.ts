import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface IdentificationResult {
  arabic?: string;
  english?: string;
  french?: string;
  timestamp: number;
  imageUrl: string;
}

export async function identifyImage(
  base64Image: string,
  languages: string[]
): Promise<IdentificationResult> {
  const model = "gemini-3-flash-preview";
  
  const properties: any = {};
  if (languages.includes('ar')) properties.arabic = { type: Type.STRING, description: "The object name in Arabic (Exactly one word)" };
  if (languages.includes('en')) properties.english = { type: Type.STRING, description: "The object name in English (Exactly one word)" };
  if (languages.includes('fr')) properties.french = { type: Type.STRING, description: "The object name in French (Exactly one word)" };

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: "Identify the main object in this image. Provide exactly ONE WORD per language. Return a JSON object.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties,
        required: languages.map(l => l === 'ar' ? 'arabic' : l === 'en' ? 'english' : 'french'),
      },
    },
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    timestamp: Date.now(),
    imageUrl: `data:image/jpeg;base64,${base64Image}`,
  };
}
