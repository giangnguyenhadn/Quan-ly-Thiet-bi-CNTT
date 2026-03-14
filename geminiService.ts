import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Sử dụng import.meta.env để đọc API Key từ Vercel/Vite
const apiKey = import.meta.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const getAIRecommendations = async (devices: Device[]): Promise<AIRecommendation[]> => {
  try {
    // Sử dụng model gemini-1.5-flash để đảm bảo tính ổn định cao nhất
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const deviceSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      entryDate: d.entryDate,
      repairCount: d.repairCount
    }));

    const prompt = `Phân tích danh sách thiết bị sau và đề xuất sửa chữa hoặc thanh lý. 
      Trả về JSON mảng: [{ "deviceId": string, "deviceName": string, "reason": string, "action": "REPAIR" | "LIQUIDATE" }]
      Dữ liệu: ${JSON.stringify(deviceSummary)}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
