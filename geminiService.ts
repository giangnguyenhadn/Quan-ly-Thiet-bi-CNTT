
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Lấy API Key từ biến môi trường Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("LỖI: Không tìm thấy Gemini API Key trong biến môi trường (VITE_GEMINI_API_KEY).");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const getAIRecommendations = async (
  devices: Device[]
): Promise<AIRecommendation[]> => {
  // Kiểm tra nếu không có key hoặc danh sách thiết bị rỗng
  if (!apiKey) {
    console.warn("Yêu cầu bị hủy: Thiếu API Key.");
    return [];
  }
  
  if (devices.length === 0) {
    console.warn("Yêu cầu bị hủy: Danh sách thiết bị gửi đi đang trống.");
    return [];
  }

  try {
    // Sử dụng gemini-1.5-flash
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
      repairCount: d.repairCount || 0
    }));

    const prompt = `
      Bạn là một chuyên gia quản lý thiết bị CNTT trường học tại Việt Nam.
      Dựa trên danh sách thiết bị sau, hãy phân tích tình trạng và đưa ra quyết định:
      1. Nếu thiết bị hư hỏng nặng hoặc đã sửa chữa quá nhiều lần (>3 lần), hãy đề xuất "LIQUIDATE" (Thanh lý).
      2. Nếu thiết bị còn tốt hoặc hỏng nhẹ, hãy đề xuất "REPAIR" (Sửa chữa).

      Dữ liệu thiết bị: ${JSON.stringify(dataSummary)}

      Trả về một mảng JSON chính xác theo cấu trúc này:
      [
        {
          "deviceId": "string",
          "deviceName": "string",
          "reason": "Giải thích lý do cụ thể bằng tiếng Việt",
          "action": "REPAIR" | "LIQUIDATE"
        }
      ]
    `;

    console.log("Đang gửi yêu cầu phân tích tới Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("AI trả về phản hồi rỗng.");
    }

    try {
      const parsed: AIRecommendation[] = JSON.parse(text);
      console.log("Phân tích AI thành công:", parsed);
      return parsed;
    } catch (parseError) {
      // Xử lý trường hợp AI tự thêm markdown block ```json
      const cleaned = text.replace(/```json|```/g, "").trim();
      const fallbackParsed = JSON.parse(cleaned);
      console.log("Phân tích AI thành công (sau khi dọn dẹp):", fallbackParsed);
      return fallbackParsed;
    }

  } catch (error: any) {
    // Xử lý các lỗi phổ biến
    if (error.message?.includes("403")) {
      console.error("Lỗi 403: API Key không hợp lệ hoặc bị chặn địa lý/CORS.");
    } else if (error.message?.includes("429")) {
      console.error("Lỗi 429: Bạn đã vượt quá giới hạn lượt gọi API (Quota).");
    } else {
      console.error("Lỗi phân tích AI:", error.message || error);
    }
    return [];
  }
};
