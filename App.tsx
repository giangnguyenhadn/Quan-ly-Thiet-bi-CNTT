import React, { useState, useEffect } from "react";

import Layout from "./Layout";
import Dashboard from "./Dashboard";
import DeviceList from "./DeviceList";
import ScannerView from "./ScannerView";
import Inventory from "./Inventory";
import AIRecommendationView from "./AIRecommendationView";
import StaffList from "./StaffList";
import HistoryList from "./HistoryList";

import { Device, Staff, Transaction } from "./types";
import { getDevices, getStaff, getTransactions, addTransaction } from "./db";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const handleTransactionComplete = (transaction: Transaction) => {
    addTransaction(transaction);
    refreshData();
  };

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard devices={devices} transactions={transactions} />;
      case "devices":
        return <DeviceList devices={devices} refreshData={refreshData} />;
      case "scanner":
        return (
          <ScannerView
            devices={devices}
            staff={staff}
            onComplete={handleTransactionComplete}
          />
        );
      case "inventory":
        return <Inventory devices={devices} />;
      case "ai":
        return <AIRecommendationView devices={devices} />;
      case "staff":
        return <StaffList staff={staff} refreshData={refreshData} />;
      case "history":
        return <HistoryList transactions={transactions} devices={devices} staff={staff} />;
      default:
        return <Dashboard devices={devices} transactions={transactions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </Layout>
  );
};

export default App;
