
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Device, AIRecommendation } from "./types";

// Lấy API key từ Vite ENV
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Kiểm tra API key
if (!apiKey) {
  console.warn("Missing Gemini API Key");
}
}

// Khởi tạo Gemini
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

    // Tóm tắt dữ liệu để gửi cho AI
    const dataSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      repairCount: d.repairCount
    }));

    const prompt = `
Phân tích dữ liệu thiết bị CNTT của trường học.

Dữ liệu thiết bị:
${JSON.stringify(dataSummary)}

Yêu cầu:
- Chỉ trả về JSON
- Không thêm giải thích
- Không markdown

Format bắt buộc:

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

    // Làm sạch JSON nếu AI trả markdown
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed: AIRecommendation[] = JSON.parse(cleaned);

    return parsed;

  } catch (error) {

    console.error("AI Analysis Error:", error);

    return [];

  }
};
