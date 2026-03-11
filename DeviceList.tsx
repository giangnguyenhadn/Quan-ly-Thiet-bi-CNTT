
import React, { useState } from 'react';
import { Device, DeviceStatus, DeviceType, LocationType } from '../types';
import { 
  Search, Plus, QrCode, Edit2, Trash2, X, Printer, 
  Download, CheckSquare, Square, Loader2, Tag, Box, DollarSign, Calendar, Cpu, FileText
} from 'lucide-react';
import { addDevice, updateDevice, deleteDevice } from '../db';
import { exportOrPrint, printQRLabelCards } from '../utils/exportUtils';

interface DeviceListProps {
  devices: Device[];
  refreshData: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, refreshData }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<Partial<Device>>({});

  const filtered = devices.filter(d => 
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === 'all' || d.type === filterType)
  );

  const handleExportExcel = () => {
    const columns = ['STT', 'Mã TB', 'Tên thiết bị', 'Loại', 'ĐVT', 'Đơn giá', 'Ngày cấp', 'Tình trạng', 'Vị trí', 'Cấu hình'];
    const data = filtered.map((d, i) => [
      i + 1, d.id, d.name, d.type, d.unit, d.price, d.entryDate, d.status, d.room || d.location, d.config || ''
    ]);
    exportOrPrint('excel', 'DANH MỤC THIẾT BỊ CÔNG NGHỆ THÔNG TIN', columns, data);
  };

  const handleInNgay = () => {
    setIsConnecting(true);
    const devicesToPrint = devices.filter(d => selectedIds.has(d.id));
    const dataToPrint = devicesToPrint.map(dev => ({
      qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${dev.qrCode}`,
      name: dev.name,
      location: dev.room || dev.location,
      code: dev.id
    }));

    setTimeout(() => {
      printQRLabelCards("In nhãn thiết bị", dataToPrint);
      setIsConnecting(false);
      setIsQRModalOpen(false);
    }, 500);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(d => d.id)));
  };

  const openEditModal = (device: Device | null) => {
    setSelectedDevice(device);
    setFormData(device || {
      id: `DEV${Math.floor(Math.random() * 900) + 100}`,
      name: '',
      type: DeviceType.OTHER,
      unit: 'Cái',
      price: 0,
      entryDate: new Date().toISOString().split('T')[0],
      status: DeviceStatus.GOOD,
      location: LocationType.WAREHOUSE,
      qrCode: '',
      repairCount: 0,
      config: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.id) {
      alert('Vui lòng nhập Mã và Tên thiết bị');
      return;
    }
    const finalData = { ...formData, qrCode: formData.id } as Device;
    if (selectedDevice) updateDevice(selectedDevice.id, finalData);
    else addDevice(finalData);
    setIsModalOpen(false);
    refreshData();
  };

  const devicesToPrint = devices.filter(d => selectedIds.has(d.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cập nhật & Quản lý Thiết bị</h2>
          <p className="text-slate-500 font-medium">Quản lý cấu hình, tài chính và in ấn mã định danh</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <button 
              onClick={() => setIsQRModalOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg"
            >
              <Printer size={18} />
              <span>In nhãn QR ({selectedIds.size})</span>
            </button>
          )}
          <button onClick={handleExportExcel} className="bg-white text-slate-700 px-4 py-2.5 border border-slate-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
          <button onClick={() => openEditModal(null)} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus size={18} />
            <span>Thêm thiết bị</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo mã ID hoặc tên thiết bị..." 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả chủng loại</option>
          {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                  </button>
                </th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thiết bị</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cấu hình & Giá</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tình trạng</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((device) => (
                <tr key={device.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(device.id) ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => toggleSelect(device.id)} className="text-slate-300">
                      {selectedIds.has(device.id) ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-lg">{device.name}</div>
                    <div className="text-[11px] font-black text-blue-500 font-mono mt-0.5 tracking-wider">MÃ: {device.id}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-slate-600 truncate max-w-[200px] italic">{device.config || 'Chưa có cấu hình'}</div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {device.price.toLocaleString('vi-VN')} đ / {device.unit}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      device.status === DeviceStatus.GOOD ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {device.status}
                    </span>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{device.room || device.location}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedIds(new Set([device.id])); setIsQRModalOpen(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all"><QrCode size={18} /></button>
                      <button onClick={() => openEditModal(device)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => deleteDevice(device.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between bg-slate-50/50 items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">{selectedDevice ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest">HỒ SƠ TÀI SẢN CHI TIẾT</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><QrCode size={14} /> Mã Thiết bị</label>
                     <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold font-mono outline-none" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box size={14} /> Tên Thiết bị</label>
                     <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Tag size={14} /> Đơn vị tính</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Giá nhập</label>
                       <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu size={14} /> Cấu hình</label>
                     <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-32" value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Ngày cấp</label>
                       <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as DeviceType})}>
                          {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as DeviceStatus})}>
                          {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                     {/* Added missing FileText icon import and using it here */}
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Ghi chú</label>
                     <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-44" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl">Hủy</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">Lưu hồ sơ</button>
            </div>
          </div>
        </div>
      )}

      {isQRModalOpen && devicesToPrint.length > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] flex flex-col h-[90vh] shadow-2xl overflow-hidden border border-white/20">
             <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl"><Printer size={24} /></div>
                  <div><h3 className="text-xl font-black text-slate-800">In nhãn QR</h3><p className="text-xs text-slate-400 font-bold">KHỔ GIẤY A4 DECAL</p></div>
                </div>
                <button onClick={() => setIsQRModalOpen(false)} className="bg-white border text-slate-400 hover:text-red-500 p-2 rounded-full"><X size={24} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-white p-12 rounded-[2rem]">
                   {devicesToPrint.map(device => (
                      <div key={device.id} className="border-2 border-slate-100 p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
                         <div className="text-[10px] font-black uppercase text-blue-900">TRƯỜNG TH TRẦN ĐẠI NGHĨA</div>
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${device.qrCode}`} className="w-32 h-32" alt="QR" />
                         <div className="text-center w-full">
                            <p className="text-[13px] font-black text-slate-800 uppercase truncate">{device.name}</p>
                            <p className="text-[11px] font-black text-blue-600 font-mono mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block">ID: {device.id}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             <div className="p-8 border-t bg-white flex justify-end gap-3">
                <button onClick={handleInNgay} disabled={isConnecting} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl hover:bg-blue-700 transition-all">
                  {isConnecting ? <Loader2 className="animate-spin" /> : <><Printer size={22} /> IN NGAY</>}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;
