
import React from 'react';
import { Device, DeviceStatus } from './types';
import { Download, Printer } from 'lucide-react';
import { exportOrPrint } from './exportUtils';

interface InventoryProps {
  devices: Device[];
}

const Inventory: React.FC<InventoryProps> = ({ devices }) => {
  const activeDeviceTypes = Array.from(new Set(devices.map(d => d.type)));
  
  const summaryRows = activeDeviceTypes.map(type => {
    const typeDevices = devices.filter(d => d.type === type);
    const good = typeDevices.filter(d => d.status === DeviceStatus.GOOD || d.status === DeviceStatus.IN_USE).length;
    const broken = typeDevices.filter(d => d.status === DeviceStatus.BROKEN || d.status === DeviceStatus.REPAIRING).length;
    const unit = typeDevices[0]?.unit || 'Cái';
    const totalValue = typeDevices.reduce((sum, d) => sum + d.price, 0);
    const avgPrice = typeDevices.length > 0 ? totalValue / typeDevices.length : 0;

    return { type, unit, avgPrice, good, broken, total: typeDevices.length, totalValue, notes: '' };
  });

  const totalSchoolValue = summaryRows.reduce((a, b) => a + b.totalValue, 0);
  const totalGood = summaryRows.reduce((a, b) => a + b.good, 0);
  const totalBroken = summaryRows.reduce((a, b) => a + b.broken, 0);
  const totalCount = summaryRows.reduce((a, b) => a + b.total, 0);

  const getReportData = () => {
    const columns = ['STT', 'Cơ sở', 'Vị trí', 'Tên thiết bị', 'Loại', 'ĐVT', 'Đơn giá', 'Tình trạng', 'Ngày nhập'];
    const data = devices.map((d, i) => [
      i + 1, d.campus || 'CS1', d.room || 'Kho', d.name, d.type, d.unit, d.price, d.status, d.entryDate
    ]);
    const summaryData = summaryRows.map(s => [s.type, s.unit, s.avgPrice, s.good, s.broken, s.total, s.totalValue, s.notes]);
    summaryData.push(['TỔNG CỘNG TOÀN TRƯỜNG', '', '', totalGood, totalBroken, totalCount, totalSchoolValue, '']);
    return { columns, data, summaryData };
  };

  const handleAction = (mode: 'excel' | 'print') => {
    const { columns, data, summaryData } = getReportData();
    exportOrPrint(mode, 'Biên bản Kiểm kê Thiết bị CNTT', columns, data, summaryData);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kiểm kê & Báo cáo</h2>
          <p className="text-slate-500 font-medium">Báo cáo tình trạng tài sản năm học 2025-2026</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('print')}
            className="bg-white text-slate-700 px-6 py-3 border border-slate-200 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} />
            <span>In báo cáo</span>
          </button>
          <button 
            onClick={() => handleAction('excel')}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
          >
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b bg-slate-50/50">
          <h3 className="text-xl font-black text-center uppercase text-slate-800 tracking-widest">Bảng Tổng Hợp Tài Sản</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <thead className="bg-slate-100/50 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-slate-700 uppercase border-r tracking-widest">Loại thiết bị</th>
                <th className="px-4 py-5 text-xs font-black text-slate-700 uppercase text-center border-r tracking-widest">ĐVT</th>
                <th className="px-6 py-5 text-xs font-black text-emerald-700 uppercase text-center border-r tracking-widest">Tốt</th>
                <th className="px-6 py-5 text-xs font-black text-red-700 uppercase text-center border-r tracking-widest">Hỏng</th>
                <th className="px-6 py-5 text-xs font-black text-blue-700 uppercase text-center border-r tracking-widest">Tổng</th>
                <th className="px-6 py-5 text-xs font-black text-slate-700 uppercase text-right tracking-widest">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-sm">
              {summaryRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 border-r bg-slate-50/30 font-bold text-slate-800">{row.type}</td>
                  <td className="px-4 py-4 text-center border-r text-slate-500 font-bold">{row.unit}</td>
                  <td className="px-6 py-4 text-center border-r text-emerald-600 font-black">{row.good}</td>
                  <td className="px-6 py-4 text-center border-r text-red-600 font-black">{row.broken}</td>
                  <td className="px-6 py-4 text-center border-r font-black text-slate-900 bg-blue-50/20">{row.total}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-800">{row.totalValue.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white font-black">
                <td className="px-6 py-6 border-r uppercase tracking-[0.2em] text-sm" colSpan={2}>TỔNG CỘNG HỆ THỐNG</td>
                <td className="px-6 py-6 text-center border-r text-lg">{totalGood}</td>
                <td className="px-6 py-6 text-center border-r text-lg">{totalBroken}</td>
                <td className="px-6 py-6 text-center border-r text-lg">{totalCount}</td>
                <td className="px-6 py-6 text-right font-black text-xl text-blue-400">{totalSchoolValue.toLocaleString('vi-VN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
