
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './views/Dashboard';
import DeviceList from './views/DeviceList';
import ScannerView from './views/ScannerView';
import Inventory from './views/Inventory';
import AIRecommendationView from './views/AIRecommendationView';
import StaffList from './views/StaffList';
import HistoryList from './views/HistoryList';
import { Device, Staff, Transaction } from './types';
import { getDevices, getStaff, getTransactions, addTransaction } from './db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<'ADMIN' | 'TEACHER'>('ADMIN');
  const [devices, setDevices] = useState<Device[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refreshData = () => {
    setDevices(getDevices());
    setStaff(getStaff());
    setTransactions(getTransactions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleTransactionComplete = (t: Transaction) => {
    addTransaction(t);
    refreshData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard devices={devices} transactions={transactions} />;
      case 'devices':
        return <DeviceList devices={devices} refreshData={refreshData} />;
      case 'scan':
        return <ScannerView devices={devices} staff={staff} onComplete={handleTransactionComplete} />;
      case 'inventory':
        return <Inventory devices={devices} />;
      case 'ai':
        return <AIRecommendationView devices={devices} />;
      case 'staff':
        return <StaffList staff={staff} refreshData={refreshData} />;
      case 'history':
        return <HistoryList transactions={transactions} devices={devices} staff={staff} />;
      default:
        return <Dashboard devices={devices} transactions={transactions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={role}>
      <div className="flex justify-end mb-6">
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button 
            onClick={() => setRole('ADMIN')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${role === 'ADMIN' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            QUẢN TRỊ
          </button>
          <button 
            onClick={() => { setRole('TEACHER'); setActiveTab('scan'); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${role === 'TEACHER' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            GIÁO VIÊN
          </button>
        </div>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;
