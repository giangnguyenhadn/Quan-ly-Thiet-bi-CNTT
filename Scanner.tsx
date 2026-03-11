
import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, X, Info, Zap, AlertTriangle } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        // @ts-ignore - Html5Qrcode comes from the script tag in index.html
        const html5QrCode = new window.Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config = { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        // Thử mở camera sau (environment) cho điện thoại, nếu không được (laptop) sẽ tự động fallback
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            onScan(decodedText);
          },
          (errorMessage: string) => {
            // Quét liên tục, không cần báo lỗi nếu không thấy code trong frame
          }
        );
        
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Camera error:", err);
        setError("Không thể truy cập Camera. Vui lòng kiểm tra quyền truy cập.");
        setIsInitializing(false);
      }
    };

    // Đợi một chút để DOM element 'reader' sẵn sàng
    const timer = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e: any) => console.error("Stop error", e));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col border border-white/20">
        
        {/* Header điều khiển */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10">
           <div className="bg-blue-600/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-lg">
              <Zap size={14} className="fill-current" />
              Máy quét QR
           </div>
           <button 
            onClick={onClose}
            className="bg-white/20 hover:bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Vùng hiển thị Camera */}
        <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
          <div id="reader" className="w-full h-full"></div>
          
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white space-y-4">
              <RefreshCcw className="text-blue-400 animate-spin" size={40} />
              <p className="text-sm font-bold animate-pulse">Đang kết nối Camera...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-8 text-center space-y-4">
              <div className="bg-red-100 text-red-600 p-4 rounded-full">
                <AlertTriangle size={40} />
              </div>
              <p className="text-red-700 font-bold">{error}</p>
              <button 
                onClick={onClose}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold"
              >
                Đóng lại
              </button>
            </div>
          )}

          {/* Scanner Overlay UI */}
          {!isInitializing && !error && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-2 border-blue-500 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                {/* Laser line effect */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer hướng dẫn */}
        <div className="p-8 bg-white border-t border-slate-100">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Info size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800">Căn chỉnh mã QR</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Đưa nhãn QR dán trên thiết bị vào giữa khung vuông. <br/>
                  Hệ thống sẽ tự động nhận diện và điền thông tin.
                </p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
