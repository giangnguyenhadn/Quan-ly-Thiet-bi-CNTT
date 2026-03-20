
import { GoogleGenAI, Type } from "@google/genai";
import { Device, AIRecommendation } from "./types";

export const getAIRecommendations = async (devices: Device[]): Promise<AIRecommendation[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    
    const deviceSummary = devices.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      entryDate: d.entryDate,
      repairCount: d.repairCount
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Phân tích danh sách thiết bị sau và đề xuất sửa chữa hoặc thanh lý. 
      Quy tắc: 
      - Thanh lý nếu: Sử dụng quá 5 năm HOẶC hư hỏng nặng HOẶC sửa chữa > 5 lần.
      - Sửa chữa nếu: Tình trạng "Cần sửa" và mới sử dụng dưới 3 năm.
      Danh sách: ${JSON.stringify(deviceSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              deviceId: { type: Type.STRING },
              deviceName: { type: Type.STRING },
              reason: { type: Type.STRING },
              action: { 
                type: Type.STRING,
                description: "Must be 'REPAIR' or 'LIQUIDATE'"
              }
            },
            required: ["deviceId", "deviceName", "reason", "action"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
