import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateCoverImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Since Gemini doesn't have native image generation, we'll create a placeholder
    // In production, you'd integrate with an image generation API like DALL-E or Midjourney
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Could not get canvas context");
    
    // Create a abstract generative pattern
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;
    
    // Generate pseudo-random art based on prompt hash
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
      hash = hash & hash;
    }
    
    const seed = Math.abs(hash) % 10000;
    for (let i = 0; i < data.length; i += 4) {
      const rand = Math.sin(seed + i) * 10000;
      data[i] = (rand - Math.floor(rand)) * 256;
      data[i + 1] = (Math.sin(seed + i + 1) * 10000 - Math.floor(Math.sin(seed + i + 1) * 10000)) * 256;
      data[i + 2] = (Math.sin(seed + i + 2) * 10000 - Math.floor(Math.sin(seed + i + 2) * 10000)) * 256;
      data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

export const generateArtPrompt = async (theme: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const response = await model.generateContent(
      `Create a vivid, abstract art prompt based on the theme: "${theme}". 
      The prompt should describe a high-quality, complex texture (good for steganography), 
      digital art style. Keep it under 30 words.`
    );
    
    return response.response.text() || `Abstract digital art, ${theme}, complex texture, 4k`;
  } catch (error) {
    console.error("Prompt Generation Error:", error);
    return `Abstract digital art, ${theme}, complex texture, intricate patterns, 4k`;
  }
};
