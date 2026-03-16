
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Lấy API Key từ biến môi trường Vite
// Lưu ý: Biến này phải được khai báo trong Settings của Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("LỖI: Không tìm thấy Gemini API Key. Hãy kiểm tra biến VITE_GEMINI_API_KEY.");
}

// Khởi tạo genAI an toàn bên ngoài hàm để tránh khởi tạo lại nhiều lần
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getAIRecommendations = async (
  devices: Device[]
): Promise<AIRecommendation[]> => {
  // 1. Kiểm tra sự tồn tại của genAI và API Key
  if (!genAI || !apiKey) {
    console.error("Yêu cầu thất bại: SDK chưa được khởi tạo do thiếu API Key.");
    return [];
  }
  
  // 2. Kiểm tra dữ liệu đầu vào
  if (!devices || devices.length === 0) {
    console.warn("Danh sách thiết bị trống, không thể thực hiện phân tích.");
    return [];
  }

  try {
    // Sử dụng gemini-1.5-flash cho hiệu suất cao
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Rút gọn dữ liệu để tiết kiệm Token và tránh lỗi quá tải
    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount || 0
    }));

    const prompt = `
      Bạn là chuyên gia tư vấn thiết bị giáo dục. 
      Nhiệm vụ: Phân tích danh sách thiết bị CNTT của trường học và đưa ra quyết định "Sửa chữa" (REPAIR) hoặc "Thanh lý" (LIQUIDATE).
      
      Quy tắc:
      - Ưu tiên REPAIR nếu thiết bị hỏng nhẹ.
      - Ưu tiên LIQUIDATE nếu thiết bị đã sửa > 3 lần hoặc tình trạng quá cũ.

      Dữ liệu: ${JSON.stringify(dataSummary)}

      Yêu cầu trả về mảng JSON đúng định dạng:
      [
        {
          "deviceId": "string",
          "deviceName": "string",
          "reason": "Lý do cụ thể bằng tiếng Việt",
          "action": "REPAIR" | "LIQUIDATE"
        }
      ]
    `;

    console.log("Dịch vụ AI: Đang bắt đầu gửi dữ liệu...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    // Xử lý parse JSON an toàn
    let recommendations: AIRecommendation[] = [];
    try {
      recommendations = JSON.parse(text);
    } catch (e) {
      // Fallback: Xử lý nếu AI trả về kèm markdown ```json
      const cleanedText = text.replace(/```json|```/g, "").trim();
      recommendations = JSON.parse(cleanedText);
    }

    console.log("Dịch vụ AI: Phân tích hoàn tất.");
    return recommendations;

  } catch (error: any) {
    // Log lỗi chi tiết để debug trên Vercel/Browser
    const errorMessage = error?.message || "Lỗi không xác định";
    
    if (errorMessage.includes("403")) {
      console.error("Lỗi AI (403): API Key không có quyền truy cập hoặc bị chặn CORS.");
    } else if (errorMessage.includes("429")) {
      console.error("Lỗi AI (429): Đã hết hạn mức sử dụng miễn phí (Quota).");
    } else {
      console.error("Lỗi AI Hệ thống:", errorMessage);
    }
    
    return [];
  }
};
