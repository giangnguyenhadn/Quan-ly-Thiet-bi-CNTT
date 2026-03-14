
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

/**
 * Hàm lấy đề xuất bảo trì từ Gemini AI
 * Tương thích với Vite và triển khai trên Vercel
 */
export const getAIRecommendations = async (devices: Device[]): Promise<AIRecommendation[]> => {
  try {
    // 1. Sử dụng import.meta.env thay vì process.env cho môi trường Vite/Vercel
    // Đảm bảo bạn đã thêm VITE_GEMINI_API_KEY vào Environment Variables trên Vercel
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Lỗi: Không tìm thấy API Key. Hãy kiểm tra biến VITE_GEMINI_API_KEY trên Vercel.");
      return [];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. Sử dụng model gemini-1.5-flash (tốc độ cao và ổn định)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const deviceSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      entryDate: d.entryDate,
      repairCount: d.repairCount
    }));

    const prompt = `Phân tích danh sách thiết bị sau và đề xuất sửa chữa hoặc thanh lý. 
      Quy tắc: 
      - Thanh lý (LIQUIDATE) nếu: Sử dụng quá 5 năm HOẶC hư hỏng nặng HOẶC sửa chữa > 5 lần.
      - Sửa chữa (REPAIR) nếu: Tình trạng "Cần sửa" và mới sử dụng dưới 3 năm.
      
      Trả về kết quả dưới dạng mảng JSON chứa các object có cấu trúc:
      { "deviceId": string, "deviceName": string, "reason": string, "action": "REPAIR" | "LIQUIDATE" }
      
      Danh sách thiết bị: ${JSON.stringify(deviceSummary)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Lỗi phân tích AI:", error);
    return [];
  }
};
