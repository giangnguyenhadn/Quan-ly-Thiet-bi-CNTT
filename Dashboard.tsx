
import React from 'react';
import { Device, LocationType, DeviceStatus, DeviceType } from './types';
import { 
  Monitor, 
  AlertCircle, 
  CheckCircle, 
  ArrowRightLeft, 
  DollarSign, 
  Map, 
  Layers, 
  History as HistoryIcon,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  devices: Device[];
  transactions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ devices, transactions }) => {
  // Tính toán tổng giá trị tài sản
  const totalValue = devices.reduce((sum, d) => sum + (d.price || 0), 0);
  
  // Thống kê theo trạng thái
  const brokenCount = devices.filter(d => d.status === DeviceStatus.BROKEN || d.status === DeviceStatus.REPAIRING).length;
  const goodCount = devices.filter(d => d.status === DeviceStatus.GOOD).length;
  const borrowedCount = devices.filter(d => d.location === LocationType.BORROWED).length;

  // Phân loại thiết bị động
  const deviceTypes = Array.from(new Set(devices.map(d => d.type)));
  const typeStats = deviceTypes.map(type => {
    const group = devices.filter(d => d.type === type);
    return {
      type,
      count: group.length,
      value: group.reduce((sum, d) => sum + (d.price || 0), 0),
      percentage: (group.length / devices.length) * 100
    };
  }).sort((a, b) => b.count - a.count);

  // Thống kê theo cơ sở
  const campus1 = devices.filter(d => d.campus === 'Cơ sở 1');
  const campus2 = devices.filter(d => d.campus === 'Cơ sở 2');

  const stats = [
    { 
      label: 'Tổng thiết bị', 
      value: devices.length.toLocaleString('vi-VN'), 
      icon: Monitor, 
      color: 'from-blue-600 to-blue-400',
      desc: 'Tài sản trong danh mục'
    },
    { 
      label: 'Giá trị tài sản', 
      value: `${(totalValue / 1000000).toFixed(1)}Tr`, 
      icon: DollarSign, 
      color: 'from-emerald-600 to-emerald-400',
      desc: 'Tổng nguyên giá (VNĐ)'
    },
    { 
      label: 'Đang lưu hành', 
      value: borrowedCount, 
      icon: ArrowRightLeft, 
      color: 'from-amber-500 to-amber-400',
      desc: 'Thiết bị đang cho mượn'
    },
    { 
      label: 'Cần bảo trì', 
      value: brokenCount, 
      icon: AlertCircle, 
      color: 'from-red-600 to-red-400',
      desc: 'Yêu cầu sửa chữa gấp'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tổng quan Hệ thống</h2>
          <p className="text-slate-500 font-medium">Báo cáo hợp nhất tài sản CNTT - Trường TH Trần Đại Nghĩa</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Cập nhật: Real-time</span>
        </div>
      </div>

      {/* Grid thẻ chỉ số chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-1 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <div className="bg-slate-50 text-[10px] font-black text-slate-400 px-2 py-1 rounded-lg uppercase tracking-tighter">Hệ thống</div>
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                {stat.label === 'Tổng thiết bị' && <span className="text-xs font-bold text-slate-400 uppercase">Cái</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-500" />
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột 1 & 2: Phân loại chi tiết */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Layers size={120} />
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Layers size={20} /></div>
                <h3 className="text-xl font-black text-slate-800">Phân loại Tài sản Hiện có</h3>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{deviceTypes.length} Chủng loại</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {typeStats.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-black text-slate-800 block">{item.type}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.value.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <span className="text-sm font-black text-blue-600">{item.count} <span className="text-[10px] text-slate-400">Thiết bị</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-indigo-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Báo cáo theo Cơ sở */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-xl"><Map size={20} /></div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Phân bổ Cơ sở 1</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-black">{campus1.length}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1">Tổng thiết bị CS1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        {campus1.filter(d => d.status === DeviceStatus.GOOD).length} Tốt
                      </p>
                      <p className="text-sm font-bold text-red-400">
                        {campus1.filter(d => d.status === DeviceStatus.BROKEN || d.status === DeviceStatus.REPAIRING).length} Hỏng
                      </p>
                    </div>
                  </div>
               </div>
               <div className="absolute -bottom-4 -right-4 opacity-10">
                  <Monitor size={120} />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 text-slate-800">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Map size={20} /></div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Phân bổ Cơ sở 2</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-black text-slate-900">{campus2.length}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tổng thiết bị CS2</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {campus2.filter(d => d.status === DeviceStatus.GOOD).length} Tốt
                      </p>
                      <p className="text-sm font-bold text-red-600">
                        {campus2.filter(d => d.status === DeviceStatus.BROKEN || d.status === DeviceStatus.REPAIRING).length} Hỏng
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Hoạt động & Nhật ký */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><HistoryIcon size={20} /></div>
                <h3 className="text-xl font-black text-slate-800">Hoạt động</h3>
              </div>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
            </div>
            
            <div className="flex-1 space-y-6">
              {transactions.length > 0 ? (
                transactions.slice(0, 8).map((t, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-default">
                    <div className="relative flex flex-col items-center">
                       <div className={`w-3 h-3 rounded-full z-10 ${t.type === 'BORROW' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                       {idx !== transactions.slice(0, 8).length - 1 && <div className="w-0.5 h-full bg-slate-100 absolute top-3" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                          {t.type === 'BORROW' ? 'Mượn' : 'Trả'} {devices.find(d => d.id === t.deviceId)?.name}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                          {new Date(t.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        Thực hiện bởi: {t.staffId}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-30 py-10">
                   <HistoryIcon size={48} />
                   <p className="text-sm font-bold uppercase tracking-widest">Chưa có nhật ký</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
               <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sẵn sàng</p>
                    <p className="text-lg font-black text-blue-800">{goodCount}</p>
                  </div>
                  <CheckCircle size={32} className="text-blue-200" />
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
