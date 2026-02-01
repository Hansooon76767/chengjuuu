import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client with named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const polishProjectDescription = async (
  rawDescription: string,
  category: string,
  city: string
): Promise<string> => {
  try {
    const prompt = `
      你是一个专业的活动文案策划。请帮我润色以下“组局”活动的描述。
      
      活动类型: ${category}
      城市: ${city}
      原始描述: ${rawDescription}
      
      要求:
      1. 语言风格: 年轻、活力、简洁、吸引人，符合18+年轻人群体。
      2. 突出活动的亮点和社交氛围。
      3. 保持简短，不超过100字。
      4. 直接返回润色后的文本，不要包含任何解释或引号。
    `;

    // Use gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
    });

    // Directly access .text property
    return response.text?.trim() || rawDescription;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return rawDescription; // Fallback to original text on error
  }
};

export const generateProjectCover = async (title: string, description: string): Promise<string | null> => {
  try {
    const prompt = `A cinematic, high-quality, vibrant, photorealistic header image for a social gathering event titled "${title}". 
    The event description is: "${description}". 
    The image should be inviting, modern, and suitable for a mobile app cover. 
    Focus on the atmosphere and setting. No text overlay on the image. Aspect ratio 16:9.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      // Guidelines: DO NOT set responseMimeType for nano banana models.
      // Guidelines: Do not use generateImages for nano banana models.
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Find the image part, do not assume it is the first part.
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};