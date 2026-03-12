
import React, { useState, useRef } from 'react';
import { Staff } from '../types';
import { Search, Download, Users, Plus, Edit2, Trash2, X, Upload, CheckSquare, Square, FileSpreadsheet, AlertTriangle, Loader2, FileDown } from 'lucide-react';
// Corrected import from exportToExcel to exportOrPrint
import { exportOrPrint } from '../utils/exportUtils';
import { addStaff, updateStaff, deleteStaff, saveStaff } from '../db';
import * as XLSX from 'xlsx';

interface StaffListProps {
  staff: Staff[];
  refreshData: () => void;
}

const StaffList: React.FC<StaffListProps> = ({ staff, refreshData }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<string | 'BULK' | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = staff.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const columns = ['Mã nhân sự', 'Họ và tên', 'Chức vụ', 'Phòng/Môn', 'Ghi chú'];
    const data = filtered.map((s) => [
      s.id,
      s.fullName,
      s.position,
      s.department,
      s.notes || ''
    ]);
    // Updated call to use exportOrPrint with 'excel' mode
    exportOrPrint('excel', 'Danh sách Cán bộ Giáo viên Nhân viên', columns, data);
  };

  const downloadSampleExcel = () => {
    const data = [
      ['Họ và tên', 'Chức vụ', 'Phòng/Môn', 'Ghi chú'],
      ['Nguyễn Văn A', 'Giáo viên', 'Toán', 'Lớp 1/1'],
      ['Trần Thị B', 'Nhân viên', 'Văn phòng', 'Kế toán']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MauNhanSu");
    
    // Tự động căn chỉnh độ rộng cột cơ bản
    const wscols = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 30 }];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "Mau-Danh-Sach-Nhan-Su.xlsx");
  };

  const openEditModal = (s: Staff | null) => {
    setSelectedStaff(s);
    setFormData(s || {
      id: `ST${Math.floor(Math.random() * 9000) + 1000}`,
      fullName: '',
      position: '',
      department: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.fullName || !formData.id) {
      alert('Vui lòng nhập đầy đủ Họ tên và Mã nhân sự');
      return;
    }
    if (selectedStaff) {
      updateStaff(selectedStaff.id, formData);
    } else {
      addStaff(formData as Staff);
    }
    setIsModalOpen(false);
    refreshData();
  };

  const confirmDelete = (id: string | 'BULK') => {
    setStaffToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!staffToDelete) return;

    if (staffToDelete === 'BULK') {
      const remainingStaff = staff.filter(s => !selectedIds.has(s.id));
      saveStaff(remainingStaff);
      setSelectedIds(new Set());
    } else {
      deleteStaff(staffToDelete);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(staffToDelete);
        return next;
      });
    }

    setIsDeleteModalOpen(false);
    setStaffToDelete(null);
    refreshData();
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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển sheet sang JSON (mảng của mảng)
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length <= 1) {
          alert('File không có dữ liệu hoặc sai định dạng mẫu.');
          setIsImporting(false);
          return;
        }

        const newItems: Staff[] = [];
        // Bỏ qua dòng tiêu đề (i=0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          // Yêu cầu ít nhất có Họ tên (row[0])
          if (!row || row.length === 0 || !row[0]) continue;
          
          newItems.push({
            id: `ST${Math.floor(Math.random() * 90000) + 10000}`,
            fullName: String(row[0] || '').trim(),
            position: String(row[1] || '').trim(),
            department: String(row[2] || '').trim(),
            notes: String(row[3] || '').trim()
          });
        }

        if (newItems.length > 0) {
          const updatedStaff = [...staff, ...newItems];
          saveStaff(updatedStaff);
          refreshData();
          alert(`Đã nhập thành công ${newItems.length} nhân sự mới.`);
        } else {
          alert('Không tìm thấy dữ liệu nhân sự hợp lệ để nhập.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Có lỗi xảy ra khi đọc file. Vui lòng kiểm tra lại định dạng file.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý CBGVNV</h2>
          <p className="text-slate-500 font-medium">Hồ sơ nhân sự và quyền truy cập mượn thiết bị</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <button 
              onClick={() => confirmDelete('BULK')}
              className="bg-red-50 text-red-600 px-5 py-2.5 border border-red-200 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-50 animate-in zoom-in"
            >
              <Trash2 size={18} />
              <span>Xóa ({selectedIds.size})</span>
            </button>
          )}
          
          <button 
            onClick={downloadSampleExcel}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 transition-all"
            title="Tải tệp Excel mẫu để nhập liệu"
          >
            <FileDown size={18} />
            <span>Tải file mẫu</span>
          </button>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-white text-blue-600 px-5 py-2.5 border border-blue-200 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>Tải lên Excel</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="bg-white text-slate-700 px-5 py-2.5 border border-slate-200 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} />
            <span>Xuất báo cáo</span>
          </button>
          <button 
            onClick={() => openEditModal(null)}
            className="bg-emerald-600 text-white px-8 py-2.5 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
          >
            <Plus size={18} />
            <span>Thêm nhân sự</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Tìm theo tên, mã NV hoặc tổ chuyên môn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium transition-all"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-5 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                  </button>
                </th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Mã nhân sự</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Họ và tên</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Chức vụ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Phòng/Môn</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-50 group transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => toggleSelect(s.id)} className="text-slate-300 hover:text-blue-500 transition-colors">
                      {selectedIds.has(s.id) ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-blue-500 font-black font-mono text-sm tracking-widest">{s.id}</td>
                  <td className="px-6 py-5 font-bold text-slate-800 text-lg">{s.fullName}</td>
                  <td className="px-6 py-5 text-slate-600">{s.position}</td>
                  <td className="px-6 py-5">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight">{s.department}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(s)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(s.id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                    Không tìm thấy kết quả phù hợp trong danh mục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM/SỬA NHÂN SỰ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  {selectedStaff ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hồ sơ quản lý nhà trường</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white border text-slate-400 hover:text-red-500 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã nhân sự</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black font-mono tracking-widest focus:ring-4 focus:ring-blue-500/10 outline-none" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  disabled={!!selectedStaff}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="VD: Nguyễn Văn A..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chức vụ</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    placeholder="VD: Giáo viên"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phòng/Môn</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="VD: Tin học"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none h-24 resize-none" 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Thông tin thêm..."
                ></textarea>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave} 
                className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA CHUYÊN NGHIỆP */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200 border-t-8 border-red-500 text-center">
              <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Xác nhận xóa?</h3>
              <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                {staffToDelete === 'BULK' 
                  ? `Bạn đang chuẩn bị xóa ${selectedIds.size} nhân sự đã chọn khỏi hệ thống. Hành động này không thể hoàn tác.`
                  : "Hồ sơ nhân sự này sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách quản lý của nhà trường."
                }
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                 >
                    HỦY BỎ
                 </button>
                 <button 
                    onClick={executeDelete}
                    className="py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                 >
                    XÓA NGAY
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
