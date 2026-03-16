
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getAIRecommendations = async (
  devices: Device[]
): Promise<AIRecommendation[]> => {

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount
    }));

    const prompt = `
Phân tích dữ liệu thiết bị CNTT của trường học.

Dữ liệu:
${JSON.stringify(dataSummary)}

Trả về JSON dạng:

[
 {
  "deviceId": "string",
  "deviceName": "string",
  "reason": "string",
  "action": "REPAIR" | "LIQUIDATE"
 }
]
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: AIRecommendation[] = [];

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Invalid JSON from AI:", cleaned);
      return [];
    }

    return parsed;

  } catch (error) {

    console.error("AI Analysis Error:", error);
    return [];

  }
};
