
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Users, 
  QrCode, 
  ClipboardCheck, 
  History, 
  Wrench,
  Maximize,
  Minimize
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'ADMIN' | 'TEACHER';
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan', roles: ['ADMIN'] },
    { id: 'devices', icon: Monitor, label: 'Thiết bị', roles: ['ADMIN'] },
    { id: 'scan', icon: QrCode, label: 'Mượn/Trả', roles: ['ADMIN', 'TEACHER'] },
    { id: 'history', icon: History, label: 'Lịch sử', roles: ['ADMIN'] },
    { id: 'inventory', icon: ClipboardCheck, label: 'Kiểm kê', roles: ['ADMIN'] },
    { id: 'staff', icon: Users, label: 'Nhân sự', roles: ['ADMIN'] },
    { id: 'ai', icon: Wrench, label: 'Bảo trì AI', roles: ['ADMIN'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(role));
  const LOGO_URL = "https://img.upanh.tv/2025/03/10/logo.png";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-50">
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-[9px] font-bold text-blue-400 uppercase leading-none mb-1">phường Hòa Xuân, đà nẵng</p>
              <h1 className="text-[10px] font-black text-blue-800 leading-tight">TRƯỜNG TH TRẦN ĐẠI NGHĨA</h1>
              <p className="text-[13px] text-red-500 font-bold mt-1">Quản lý Thiết bị CNTT</p>
            </div>
            <img 
              src={LOGO_URL} 
              alt="Logo" 
              className="w-14 h-14 object-contain ml-2"
              onError={(e) => e.currentTarget.style.display = 'none'} 
            />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Nút Fullscreen Desktop */}
        <div className="px-4 mb-2">
           <button 
            onClick={toggleFullscreen}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
           >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              <span className="text-xs font-bold uppercase tracking-widest">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
           </button>
        </div>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
              {role === 'ADMIN' ? 'AD' : 'GV'}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Chế độ</p>
              <p className="text-xs font-bold text-slate-700">{role === 'ADMIN' ? 'Quản trị viên' : 'Giáo viên'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            onError={(e) => e.currentTarget.style.display = 'none'} 
          />
          <div>
            <h1 className="text-sm font-black text-blue-800 leading-none">TRẦN ĐẠI NGHĨA</h1>
            <p className="text-[10px] font-bold text-red-500 uppercase mt-0.5">Quản lý thiết bị</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
           >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
           </button>
           <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md uppercase">
            {role}
           </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around px-2 py-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {filteredTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'fill-blue-50' : ''} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
