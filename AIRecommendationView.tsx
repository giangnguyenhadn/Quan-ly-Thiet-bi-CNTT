
import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, ShieldCheck, Wrench, Trash2 } from 'lucide-react';
import { Device, AIRecommendation } from './types';
import { getAIRecommendations } from './geminiService';

interface AIRecommendationViewProps {
  devices: Device[];
}

const AIRecommendationView: React.FC<AIRecommendationViewProps> = ({ devices }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await getAIRecommendations(devices);
    setRecommendations(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              <Sparkles size={14} />
              <span>Cung cấp bởi Gemini AI</span>
            </div>
            <h2 className="text-3xl font-bold">Phân tích bảo trì thông minh</h2>
            <p className="text-blue-100 text-lg">
              Hệ thống tự động phân tích tuổi thọ, tần suất sửa chữa và tình trạng thực tế để đưa ra gợi ý xử lý tối ưu nhất cho nhà trường.
            </p>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Đang phân tích dữ liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles />
                  <span>Bắt đầu phân tích AI</span>
                </>
              )}
            </button>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl text-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-1">Repair</p>
                  <p className="text-2xl font-bold">Gợi ý sửa</p>
                </div>
                <div className="bg-white p-4 rounded-2xl text-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-1">Liquidate</p>
                  <p className="text-2xl font-bold">Thanh lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-amber-600">
              <Wrench size={20} />
              <span>Đề xuất sửa chữa</span>
            </h3>
            <div className="space-y-4">
              {recommendations.filter(r => r.action === 'REPAIR').map((rec, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{rec.deviceName}</h4>
                    <span className="text-xs text-slate-400 font-mono">{rec.deviceId}</span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{rec.reason}"
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-xs font-bold text-amber-600 hover:underline">Tạo phiếu bảo trì →</button>
                  </div>
                </div>
              ))}
              {recommendations.filter(r => r.action === 'REPAIR').length === 0 && (
                <div className="bg-slate-100 text-slate-400 p-8 rounded-2xl text-center italic">Không có đề xuất sửa chữa</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-red-600">
              <Trash2 size={20} />
              <span>Đề xuất thanh lý</span>
            </h3>
            <div className="space-y-4">
              {recommendations.filter(r => r.action === 'LIQUIDATE').map((rec, idx) => (
                <div key={idx} className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-red-900">{rec.deviceName}</h4>
                    <span className="text-xs text-red-400 font-mono">{rec.deviceId}</span>
                  </div>
                  <p className="text-sm text-red-700 bg-white/50 p-3 rounded-xl border border-red-100 italic">
                    "{rec.reason}"
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-xs font-bold text-red-600 hover:underline">Bắt đầu quy trình thanh lý →</button>
                  </div>
                </div>
              ))}
              {recommendations.filter(r => r.action === 'LIQUIDATE').length === 0 && (
                <div className="bg-slate-100 text-slate-400 p-8 rounded-2xl text-center italic">Không có đề xuất thanh lý</div>
              )}
            </div>
          </div>
        </div>
      )}

      {recommendations.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-slate-50 rounded-full text-slate-300">
            <ShieldCheck size={48} />
          </div>
          <div className="max-w-xs">
            <p className="text-slate-800 font-bold text-lg">Sẵn sàng phân tích</p>
            <p className="text-slate-500 text-sm">Bấm nút ở trên để AI quét toàn bộ danh mục và đưa ra gợi ý vận hành.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationView;
