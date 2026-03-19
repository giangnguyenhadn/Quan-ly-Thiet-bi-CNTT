
import { Device, AIRecommendation } from "./types";

// Lấy API Key từ biến môi trường
// Lưu ý: Trên Vercel, bạn phải thêm biến VITE_GEMINI_API_KEY trong phần Settings -> Environment Variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
export const getAIRecommendations = async (
  devices: Device []
): Promise<AIRecommendation[]> => {
  // 1. Kiểm tra cấu hình và Log trạng thái để Debug
  if (!apiKey) {
    console.error("LỖI: Không tìm thấy VITE_GEMINI_API_KEY. Hãy kiểm tra cấu hình trên Vercel Dashboard.");
    return [];
  }

  if (!devices || devices.length === 0) {
    console.warn("Dịch vụ AI: Danh sách thiết bị đầu vào trống.");
    return [];
  }

  try {
    // Rút gọn dữ liệu tối đa để tránh lỗi 429 (Too Many Requests) hoặc vượt quá giới hạn Token
    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      rep: d.repairCount || 0
    }));

    const prompt = `
      Bạn là chuyên gia tư vấn thiết bị giáo dục Việt Nam. 
      Phân tích danh sách thiết bị CNTT và đưa ra quyết định "Sửa chữa" (REPAIR) hoặc "Thanh lý" (LIQUIDATE).
      
      Quy tắc:
      - REPAIR: Nếu hỏng nhẹ hoặc số lần sửa < 3.
      - LIQUIDATE: Nếu số lần sửa >= 3 hoặc tình trạng quá cũ/hỏng nặng.

      Dữ liệu: ${JSON.stringify(dataSummary)}

      Trả về mảng JSON chính xác theo cấu trúc (không kèm văn bản giải thích):
      [
        {
          "deviceId": "string",
          "deviceName": "string",
          "reason": "Lý do ngắn gọn tiếng Việt",
          "action": "REPAIR" | "LIQUIDATE"
        }
      ]
    `;

    console.log("Dịch vụ AI: Đang kết nối tới Gemini API...");

    // Sử dụng Fetch API để tối ưu hóa cho môi trường Vercel (Edge Runtime tương thích tốt hơn)
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
            temperature: 0.2, // Giảm độ sáng tạo để kết quả JSON ổn định hơn
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const status = response.status;
      
      if (status === 429) {
        throw new Error("Tần suất yêu cầu quá nhanh (429). Vui lòng đợi 60 giây và thử lại.");
      } else if (status === 403) {
        throw new Error("Lỗi quyền truy cập (403): API Key không hợp lệ hoặc vùng địa lý bị chặn.");
      } else {
        throw new Error(errorData.error?.message || `Lỗi HTTP! Trạng thái: ${status}`);
      }
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("AI trả về phản hồi trống.");
    }

    // Parse kết quả và log ra console để kiểm tra dữ liệu thực tế
    const recommendations: AIRecommendation[] = JSON.parse(text);
    console.log("Dịch vụ AI: Phân tích thành công.", recommendations);
    return recommendations;

  } catch (error: any) {
    // Hiển thị lỗi chi tiết ra console của trình duyệt để người dùng biết lý do không chạy
    console.error("Dịch vụ AI - Lỗi hệ thống:", error.message || error);
    
    // Bạn có thể hiển thị thông báo lỗi này lên UI thông qua một state nếu cần
    return [];
  }
};
