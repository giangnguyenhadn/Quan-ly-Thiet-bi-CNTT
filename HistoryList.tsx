
import React, { useState } from 'react';
import { Transaction, Device, Staff } from '../types';
import { Search, Download, Printer } from 'lucide-react';
import { exportOrPrint } from '../utils/exportUtils';

interface HistoryListProps {
  transactions: Transaction[];
  devices: Device[];
  staff: Staff[];
}

const HistoryList: React.FC<HistoryListProps> = ({ transactions, devices, staff }) => {
  const [search, setSearch] = useState('');

  const getDeviceInfo = (id: string) => {
    const d = devices.find(device => device.id === id);
    if (!d) return 'N/A';
    return `${d.name}${d.room ? ` - ${d.room}` : ''}`;
  };
  
  const getStaffName = (id: string) => staff.find(s => s.id === id)?.fullName || 'N/A';

  const filtered = transactions.filter(t => 
    getDeviceInfo(t.deviceId).toLowerCase().includes(search.toLowerCase()) ||
    getStaffName(t.staffId).toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (mode: 'excel' | 'print') => {
    const columns = ['STT', 'Ngày giờ', 'Loại', 'Thiết bị', 'Người thực hiện', 'Tình trạng', 'Ghi chú'];
    const data = filtered.map((t, i) => [
      i + 1,
      new Date(t.timestamp).toLocaleString('vi-VN'),
      t.type === 'BORROW' ? 'MƯỢN' : 'TRẢ',
      getDeviceInfo(t.deviceId),
      getStaffName(t.staffId),
      t.condition,
      t.notes || ''
    ]);
    exportOrPrint(mode, 'Sổ theo dõi mượn - trả thiết bị', columns, data);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Lịch sử Mượn/Trả</h2>
          <p className="text-slate-500 font-medium">Nhật ký sử dụng thiết bị toàn trường</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => handleAction('print')}
            className="bg-white text-slate-700 px-6 py-3 border border-slate-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={20} />
            <span>In sổ mượn</span>
          </button>
          <button 
            onClick={() => handleAction('excel')}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Download size={20} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Tìm theo tên thiết bị hoặc cán bộ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Hoạt động</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thiết bị</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Người thực hiện</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">{new Date(t.timestamp).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      t.type === 'BORROW' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.type === 'BORROW' ? 'MƯỢN' : 'TRẢ'}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-800">{getDeviceInfo(t.deviceId)}</td>
                  <td className="px-6 py-5 font-medium text-slate-600">{getStaffName(t.staffId)}</td>
                  <td className="px-6 py-5"><span className="text-xs font-bold text-slate-400 italic">{t.condition}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
