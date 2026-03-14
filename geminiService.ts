
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Sử dụng import.meta.env cho môi trường Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const getAIRecommendations = async (devices: Device[]): Promise<AIRecommendation[]> => {
  try {
    // Luôn dùng model gemini-1.5-flash để tránh lỗi hạn chế vùng/phiên bản
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    // Rút gọn dữ liệu gửi đi để tránh quá tải prompt
    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount
    }));

    const prompt = `Phân tích dữ liệu thiết bị trường Trần Đại Nghĩa: ${JSON.stringify(dataSummary)}. 
      Trả về JSON: [{ "deviceId": string, "deviceName": string, "reason": string, "action": "REPAIR" | "LIQUIDATE" }]`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Lỗi AI:", error);
    return [];
  }
};
