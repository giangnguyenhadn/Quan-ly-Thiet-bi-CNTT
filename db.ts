
import { Device, Staff, Transaction, DeviceStatus, DeviceType, LocationType } from './types';

const STORAGE_KEYS = {
  DEVICES: 'tdn_devices',
  STAFF: 'tdn_staff',
  TRANSACTIONS: 'tdn_transactions'
};

// Helper to generate devices for rooms based on the provided image
const generateInitialData = (): Device[] => {
  const devices: Device[] = [];

  // --- CƠ SỞ 1 ---
  // Rooms 1-31 (Simplified mapping based on the table)
  for (let i = 1; i <= 31; i++) {
    const roomId = `Phòng ${i}`;
    
    // Most rooms have 1 Tivi LG
    if (i !== 3 && i !== 4 && i !== 7 && i !== 8 && i !== 30) {
      devices.push({
        id: `CS1-P${i}-TVLG`,
        name: `Tivi LG - ${roomId}`,
        type: DeviceType.TV_LG,
        unit: 'Cái',
        price: 15000000,
        entryDate: '2023-09-01',
        status: DeviceStatus.GOOD,
        location: LocationType.CLASSROOM,
        room: roomId,
        campus: 'Cơ sở 1',
        qrCode: `CS1-P${i}-TVLG`,
        repairCount: 0
      });
    }

    // Special cases from the table
    if (i === 3) {
      devices.push({
        id: `CS1-P3-TVVTB`, name: 'Tivi VTB - Phòng 3', type: DeviceType.TV_VTB, unit: 'Cái', price: 12000000,
        entryDate: '2025-01-01', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng 3', campus: 'Cơ sở 1', qrCode: 'CS1-P3-TVVTB', repairCount: 0, notes: 'Cấp tháng 1/2025'
      });
      devices.push({
        id: `CS1-P3-TVSAM`, name: 'Tivi Samsung - Phòng 3', type: DeviceType.TV_SAMSUNG, unit: 'Cái', price: 18000000,
        entryDate: '2022-09-01', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng 3', campus: 'Cơ sở 1', qrCode: 'CS1-P3-TVSAM', repairCount: 0
      });
    }

    if (i === 13) {
      devices.push({
        id: `CS1-P13-MC`, name: 'Máy chiếu Epson', type: DeviceType.PROJECTOR, unit: 'Cái', price: 12000000,
        entryDate: '2023-01-15', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng 13', campus: 'Cơ sở 1', qrCode: 'CS1-P13-MC', repairCount: 0
      });
      devices.push({
        id: `CS1-P13-TVSHARP`, name: 'Tivi Sharp - Phòng 13', type: DeviceType.TV_SHARP, unit: 'Cái', price: 14000000,
        entryDate: '2021-08-20', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng 13', campus: 'Cơ sở 1', qrCode: 'CS1-P13-TVSHARP', repairCount: 0
      });
    }
  }

  // Phòng Tin học Cơ sở 1
  devices.push({
    id: `CS1-PTH-TVLG`, name: 'Tivi LG - Phòng Tin học', type: DeviceType.TV_LG, unit: 'Cái', price: 15000000,
    entryDate: '2023-09-01', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng Tin học', campus: 'Cơ sở 1', qrCode: 'CS1-PTH-TVLG', repairCount: 0
  });
  for (let i = 1; i <= 41; i++) {
    devices.push({
      id: `CS1-PC-${i}`, name: `Máy tính HP - Bộ ${i}`, type: DeviceType.PC, unit: 'Bộ', price: 12000000,
      entryDate: '2022-10-15', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng Tin học', campus: 'Cơ sở 1', qrCode: `CS1-PC-${i}`, repairCount: 0
    });
  }

  // Văn phòng Cơ sở 1
  const officeRooms = ['Hiệu trưởng', 'Phó Hiệu trưởng', 'Văn thư', 'Kế toán', 'Tổng phụ trách', 'CNTT', 'Y tế', 'Thư viện'];
  officeRooms.forEach(room => {
    devices.push({
      id: `CS1-VP-${room}-PC`, name: `Máy tính - ${room}`, type: DeviceType.PC, unit: 'Bộ', price: 15000000,
      entryDate: '2022-01-01', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: `Văn phòng (${room})`, campus: 'Cơ sở 1', qrCode: `CS1-VP-${room}-PC`, repairCount: 0
    });
    devices.push({
      id: `CS1-VP-${room}-LT`, name: `Laptop Acer - ${room}`, type: DeviceType.LAPTOP_ACER, unit: 'Cái', price: 18000000,
      entryDate: '2023-05-10', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: `Văn phòng (${room})`, campus: 'Cơ sở 1', qrCode: `CS1-VP-${room}-LT`, repairCount: 0
    });
    if (room !== 'CNTT' && room !== 'Y tế' && room !== 'Thư viện') {
       devices.push({
        id: `CS1-VP-${room}-IN`, name: `Máy in Canon - ${room}`, type: DeviceType.PRINTER_CANON, unit: 'Cái', price: 5000000,
        entryDate: '2021-11-20', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: `Văn phòng (${room})`, campus: 'Cơ sở 1', qrCode: `CS1-VP-${room}-IN`, repairCount: 0
      });
    }
  });

  devices.push({
    id: 'CS1-PHOTO-01', name: 'Máy Photocopy - Văn thư', type: DeviceType.PHOTOCOPY, unit: 'Cái', price: 45000000,
    entryDate: '2020-03-15', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Văn phòng (Văn thư)', campus: 'Cơ sở 1', qrCode: 'CS1-PHOTO-01', repairCount: 0
  });

  // --- CƠ SỞ 2 ---
  // Rooms 1-5 (Tivi Sony)
  for (let i = 1; i <= 5; i++) {
    devices.push({
      id: `CS2-P${i}-TVSONY`, name: `Tivi Sony - Phòng ${i}`, type: DeviceType.TV_SONY, unit: 'Cái', price: 16000000,
      entryDate: '2021-09-01', status: i === 4 ? DeviceStatus.BROKEN : DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: `Phòng ${i}`, campus: 'Cơ sở 2', qrCode: `CS2-P${i}-TVSONY`, repairCount: 0
    });
  }
  // Rooms 6-31 (Tivi LG)
  for (let i = 6; i <= 31; i++) {
    devices.push({
      id: `CS2-P${i}-TVLG`, name: `Tivi LG - Phòng ${i}`, type: DeviceType.TV_LG, unit: 'Cái', price: 15000000,
      entryDate: '2024-10-01', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: `Phòng ${i}`, campus: 'Cơ sở 2', qrCode: `CS2-P${i}-TVLG`, repairCount: 0, notes: 'Mua tháng 10/2024'
    });
  }

  // Phòng Tin học Cơ sở 2
  for (let i = 1; i <= 43; i++) {
    devices.push({
      id: `CS2-PC-${i}`, name: `Máy tính Dell - Bộ ${i}`, type: DeviceType.PC, unit: 'Bộ', price: 14000000,
      entryDate: '2023-04-20', status: DeviceStatus.GOOD, location: LocationType.CLASSROOM, room: 'Phòng Tin học', campus: 'Cơ sở 2', qrCode: `CS2-PC-${i}`, repairCount: 0, notes: 'Nhập kho 5 bộ HP'
    });
  }

  return devices;
};

const INITIAL_DEVICES = generateInitialData();

const INITIAL_STAFF: Staff[] = [
  { id: 'ST001', fullName: 'Ngô Thị Bích Đào', position: 'Hiệu trưởng', department: 'Ban giám hiệu' },
  { id: 'ST002', fullName: 'Nguyễn Thị Thanh Hương', position: 'Nhân viên thư viện', department: 'Thư viện' },
  { id: 'ST003', fullName: 'Lê Thị Thu Hoa', position: 'Giáo viên', department: 'Tin học' },
  { id: 'ST004', fullName: 'Phạm Thị Huyền Mi', position: 'Giáo viên', department: 'Văn hóa' }
  ];

export const getDevices = (): Device[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(INITIAL_DEVICES));
    return INITIAL_DEVICES;
  }
  return JSON.parse(data);
};

export const saveDevices = (devices: Device[]) => {
  localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
};

export const addDevice = (device: Device) => {
  const devices = getDevices();
  devices.push(device);
  saveDevices(devices);
};

export const updateDevice = (id: string, updatedData: Partial<Device>) => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === id);
  if (index > -1) {
    devices[index] = { ...devices[index], ...updatedData };
    saveDevices(devices);
  }
};

export const deleteDevice = (id: string) => {
  const devices = getDevices();
  const filtered = devices.filter(d => d.id !== id);
  saveDevices(filtered);
};

export const getStaff = (): Staff[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STAFF);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  }
  return JSON.parse(data);
};

export const saveStaff = (staff: Staff[]) => {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
};

export const addStaff = (s: Staff) => {
  const staff = getStaff();
  staff.push(s);
  saveStaff(staff);
};

export const updateStaff = (id: string, updatedData: Partial<Staff>) => {
  const staff = getStaff();
  const index = staff.findIndex(s => s.id === id);
  if (index > -1) {
    staff[index] = { ...staff[index], ...updatedData };
    saveStaff(staff);
  }
};

export const deleteStaff = (id: string) => {
  const staff = getStaff();
  const filtered = staff.filter(s => s.id !== id);
  saveStaff(filtered);
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const addTransaction = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  const devices = getDevices();
  const deviceIndex = devices.findIndex(d => d.id === transaction.deviceId);
  if (deviceIndex > -1) {
    devices[deviceIndex].location = transaction.type === 'BORROW' ? LocationType.BORROWED : LocationType.WAREHOUSE;
    devices[deviceIndex].status = transaction.condition as DeviceStatus;
    saveDevices(devices);
  }
};
