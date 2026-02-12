
import { GoogleGenAI, Type } from "@google/genai";
import { Visitor, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVisitorInsights = async (visitors: Visitor[]): Promise<AIInsight[]> => {
  if (visitors.length === 0) return [];

  const visitorSummary = visitors.slice(0, 10).map(v => ({
    name: v.name,
    place: v.place,
    days: v.noOfDays,
    amount: v.amount,
    event: v.event
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these visitor records and provide 3 brief management insights in JSON format: ${JSON.stringify(visitorSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['security', 'efficiency', 'general'] },
              action: { type: Type.STRING }
            },
            required: ["title", "description", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};
