
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing VITE_GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getAIRecommendations = async (devices: Device[]): Promise<AIRecommendation[]> => {
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
Phân tích dữ liệu thiết bị trường học.

Dữ liệu:
${JSON.stringify(dataSummary)}

Chỉ trả về JSON array đúng format sau:

[
 {
  "deviceId": "...",
  "deviceName": "...",
  "reason": "...",
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

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Lỗi AI:", error);
    return [];
  }
};
