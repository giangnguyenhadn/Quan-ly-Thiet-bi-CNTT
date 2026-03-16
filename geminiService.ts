
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Lấy API Key từ biến môi trường Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing Gemini API Key. Please check your .env file or Vercel settings.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const getAIRecommendations = async (
  devices: Device[]
): Promise<AIRecommendation[]> => {
  if (!apiKey) return [];

  try {
    // Sử dụng gemini-1.5-flash để tốc độ xử lý nhanh hơn
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        // Khi dùng responseMimeType là application/json, 
        // Gemini sẽ trả về text là một chuỗi JSON chuẩn, không có ký tự lạ hay backticks.
        responseMimeType: "application/json"
      }
    });

    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount || 0
    }));

    const prompt = `
      Bạn là chuyên gia quản lý thiết bị CNTT trường học.
      Phân tích danh sách thiết bị sau và đưa ra đề xuất sửa chữa hoặc thanh lý.
      Dữ liệu: ${JSON.stringify(dataSummary)}

      Yêu cầu đầu ra là một mảng JSON chính xác theo cấu trúc:
      [
        {
          "deviceId": "string",
          "deviceName": "string",
          "reason": "Giải thích ngắn gọn lý do bằng tiếng Việt",
          "action": "REPAIR" hoặc "LIQUIDATE"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Xử lý an toàn: Nếu có lỗi hoặc text rỗng
    if (!text) {
      console.warn("AI returned empty response");
      return [];
    }

    try {
      // Vì đã cấu hình responseMimeType: "application/json", 
      // ta KHÔNG cần dùng .replace(/`json/g, "") nữa.
      const parsed: AIRecommendation[] = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error("Lỗi parse JSON từ Gemini:", text);
      // Fallback: Nếu vẫn dính backticks thì mới dùng regex
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    }

  } catch (error: any) {
    // Kiểm tra lỗi 403 (thường do API Key hoặc vùng địa lý)
    if (error.message?.includes("403")) {
      console.error("AI Error 403: Có thể do API Key sai hoặc vùng lãnh thổ bị hạn chế.");
    } else {
      console.error("AI Analysis Error:", error);
    }
    return [];
  }
};
