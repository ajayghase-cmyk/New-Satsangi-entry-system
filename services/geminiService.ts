
import { GoogleGenAI, Type } from "@google/genai";
import { Visitor, AIInsight } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVisitorPatterns = async (visitors: Visitor[]): Promise<AIInsight[]> => {
  // Fixed mapping to use existing properties: event, checkInTimestamp, and place
  const visitorDataStr = JSON.stringify(visitors.map(v => ({
    event: v.event,
    time: v.checkInTimestamp,
    place: v.place
  })));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these visitor logs and provide 3-4 actionable security or operational insights. Data: ${visitorDataStr}`,
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

    // response.text is a property, not a function
    return JSON.parse(response.text?.trim() || '[]');
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return [{
      title: "Analysis Unavailable",
      description: "Could not connect to AI service for visitor pattern analysis.",
      type: "general"
    }];
  }
};

export const generateVisitorSummary = async (visitors: Visitor[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a brief, professional summary of today's visitor activity based on this data: ${JSON.stringify(visitors)}`,
    });
    // response.text is a property
    return response.text || "No summary available.";
  } catch (error) {
    return "Error generating summary.";
  }
};
