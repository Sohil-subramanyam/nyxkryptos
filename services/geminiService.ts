import { GoogleGenAI } from "@google/genai";

// We create a new instance when needed to ensure latest API key if dynamic
// But per instructions, key is in process.env.API_KEY
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCoverImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  // Using gemini-2.5-flash-image for image generation as per guidelines
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
    });

    // Iterate to find image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const generateArtPrompt = async (theme: string): Promise<string> => {
  // Use gemini-3-flash-preview for text tasks as per guidelines (Basic Text Tasks)
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a vivid, abstract art prompt based on the theme: "${theme}". 
    The prompt should describe a high-quality, complex texture (good for steganography), 
    digital art style. Keep it under 30 words.`,
  });
  return response.text || `Abstract digital art, ${theme}, complex texture, 4k`;
};