
import React, { useState } from 'react';
/* Added AlertTriangle to the lucide-react import list */
import { QrCode, Camera, Search, User, Info, CheckCircle2, Package, MapPin, Tag, AlertTriangle } from 'lucide-react';
// Added LocationType to the imports for type-safe comparisons
import { Device, Staff, Transaction, DeviceStatus, LocationType } from './types';
import Scanner from './Scanner';

interface ScannerViewProps {
  devices: Device[];
  staff: Staff[];
  onComplete: (transaction: Transaction) => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ devices, staff, onComplete }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const activeDevice = devices.find(d => d.qrCode === scannedId);

  const handleScan = (code: string) => {
    setScannedId(code);
    setShowScanner(false);
  };

  const handleSubmit = (type: 'BORROW' | 'RETURN') => {
    if (!activeDevice || !selectedStaff) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      deviceId: activeDevice.id,
      staffId: selectedStaff,
      type,
      timestamp: new Date().toISOString(),
      condition: activeDevice.status,
      notes: ''
    };

    onComplete(transaction);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setScannedId(null);
      setSelectedStaff('');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-8 rounded-full text-emerald-600 shadow-xl shadow-emerald-100">
          <CheckCircle2 size={72} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800">Cập nhật thành công!</h2>
          <p className="text-slate-500 font-medium mt-2">Dữ liệu đã được đồng bộ lên hệ thống nhà trường.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800">Luồng Mượn/Trả Thiết Bị</h2>
        <p className="text-slate-500 font-medium mt-1">Sử dụng Camera để quét nhanh nhãn dán QR</p>
      </div>

      {!scannedId ? (
        <div className="space-y-6">
          <button 
            onClick={() => setShowScanner(true)}
            className="w-full py-20 bg-white border-2 border-dashed border-blue-200 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:border-blue-500 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-50 transition-all group relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">Mở Camera</div>
            <div className="bg-blue-100 p-6 rounded-full text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
              <Camera size={56} />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-slate-800">Nhấn để bắt đầu Quét</p>
              <p className="text-sm text-slate-400 font-medium mt-1">Laptop hoặc Điện thoại đều khả dụng</p>
            </div>
          </button>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3">Hoặc nhập mã tay</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Nhập mã định danh (VD: CS1-P1-TVLG)..."
              className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan((e.target as HTMLInputElement).value);
              }}
            />
            <button 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
              onClick={() => {
                const input = document.querySelector('input[placeholder*="Nhập mã"]') as HTMLInputElement;
                if (input.value) handleScan(input.value);
              }}
            >
              Check
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          {activeDevice ? (
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100">
              <div className="bg-slate-900 p-8 text-white relative">
                 <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <Tag size={12} />
                    <span>{activeDevice.type}</span>
                 </div>
                 <h3 className="text-2xl font-black mb-1">{activeDevice.name}</h3>
                 <p className="text-slate-400 font-mono text-sm tracking-widest">ID: {activeDevice.id}</p>
                 <div className="absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${activeDevice.qrCode}`} 
                      className="w-14 h-14" 
                      alt="QR"
                    />
                 </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Vị trí hiện tại</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                         <MapPin size={16} className="text-blue-600" />
                         <span>{activeDevice.room || activeDevice.location}</span>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Trạng thái TB</p>
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                         <Package size={16} className="text-emerald-600" />
                         <span>{activeDevice.status}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Cán bộ mượn/trả</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-800 transition-all cursor-pointer"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                    <option value="">-- Chọn giáo viên / nhân viên --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.department})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    // Fixed: used LocationType.BORROWED for type-safe comparison
                    disabled={!selectedStaff || activeDevice.location === LocationType.BORROWED}
                    onClick={() => handleSubmit('BORROW')}
                    className={`py-5 rounded-2xl font-black flex flex-col items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                      activeDevice.location === LocationType.BORROWED 
                      ? 'bg-slate-100 text-slate-300 border border-slate-200 grayscale cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                    }`}
                  >
                    <QrCode size={24} />
                    <span>MƯỢN THIẾT BỊ</span>
                  </button>
                  <button 
                    // Fixed: removed invalid string literal 'Borrowed' and used LocationType.BORROWED for type-safe comparison
                    disabled={!selectedStaff || activeDevice.location !== LocationType.BORROWED}
                    onClick={() => handleSubmit('RETURN')}
                    className={`py-5 rounded-2xl font-black flex flex-col items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                      activeDevice.location !== LocationType.BORROWED
                      ? 'bg-slate-100 text-slate-300 border border-slate-200 grayscale cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    <QrCode size={24} />
                    <span>TRẢ THIẾT BỊ</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => setScannedId(null)}
                  className="w-full text-xs font-black text-slate-400 hover:text-red-500 transition-colors py-2 uppercase tracking-widest"
                >
                  Hủy thao tác & Quét lại
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-100 p-12 rounded-[2.5rem] text-center shadow-xl shadow-red-50">
              <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 {/* AlertTriangle component is now correctly imported and available */}
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-red-900">Mã QR Không Hợp Lệ!</h3>
              <p className="text-red-600 font-medium mt-3 mb-8">Thiết bị có mã <span className="font-black">"{scannedId}"</span> chưa tồn tại trong hệ thống quản lý của trường.</p>
              <button 
                onClick={() => setScannedId(null)}
                className="bg-white text-slate-800 px-10 py-4 rounded-2xl font-black border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                Thử quét mã khác
              </button>
            </div>
          )}
        </div>
      )}

      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default ScannerView;
