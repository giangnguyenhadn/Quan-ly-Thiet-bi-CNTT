
import { Device, AIRecommendation } from "./types";

// Lấy API Key từ biến môi trường
// Đảm bảo bạn đã thêm VITE_GEMINI_API_KEY vào Vercel Dashboard -> Settings -> Environment Variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const getAIRecommendations = async (
  devices: Device[]
): Promise<AIRecommendation[]> => {
  // 1. Kiểm tra cấu hình
  if (!apiKey) {
    console.error("LỖI: Thiếu Gemini API Key. Vui lòng cấu hình VITE_GEMINI_API_KEY trên Vercel.");
    return [];
  }

  if (!devices || devices.length === 0) {
    return [];
  }

  try {
    // Rút gọn dữ liệu để tiết kiệm băng thông và token
    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount || 0
    }));

    const prompt = `
      Bạn là chuyên gia tư vấn thiết bị giáo dục Việt Nam. 
      Phân tích danh sách thiết bị CNTT và đưa ra quyết định "Sửa chữa" (REPAIR) hoặc "Thanh lý" (LIQUIDATE).
      
      Quy tắc:
      - Ưu tiên REPAIR nếu hỏng nhẹ hoặc sửa < 3 lần.
      - Ưu tiên LIQUIDATE nếu sửa > 3 lần hoặc quá cũ.

      Dữ liệu: ${JSON.stringify(dataSummary)}

      Trả về DUY NHẤT một mảng JSON theo cấu trúc:
      [
        {
          "deviceId": "string",
          "deviceName": "string",
          "reason": "Lý do ngắn gọn bằng tiếng Việt",
          "action": "REPAIR" | "LIQUIDATE"
        }
      ]
    `;

    console.log("Dịch vụ AI: Đang gửi yêu cầu qua Fetch API (Tối ưu cho Vercel)...");

    // Sử dụng Fetch API trực tiếp thay vì SDK để tránh lỗi Hydration và giảm dung lượng Bundle
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("AI không trả về nội dung phân tích.");
    }

    // Parse kết quả
    const recommendations: AIRecommendation[] = JSON.parse(text);
    console.log("Dịch vụ AI: Phân tích hoàn tất trên Vercel.");
    return recommendations;

  } catch (error: any) {
    // Xử lý lỗi đặc thù của Gemini trên môi trường Cloud
    if (error.message?.includes("429")) {
      console.error("Lỗi 429: Quá tải lượt gọi API. Vui lòng thử lại sau vài phút.");
    } else if (error.message?.includes("403")) {
      console.error("Lỗi 403: API Key không hợp lệ hoặc bị giới hạn vùng địa lý.");
    } else {
      console.error("Lỗi AI Hệ thống:", error.message);
    }
    return [];
  }
};
