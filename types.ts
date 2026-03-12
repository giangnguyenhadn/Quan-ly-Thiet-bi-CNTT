
export enum DeviceStatus {
  GOOD = 'Tốt',
  IN_USE = 'Đang sử dụng',
  BROKEN = 'Hư hỏng',
  REPAIRING = 'Cần sửa'
}

export enum DeviceType {
  PROJECTOR = 'Máy chiếu',
  TV_LG = 'Tivi LG',
  TV_VTB = 'Tivi VTB',
  TV_SONY = 'Tivi Sony',
  TV_SAMSUNG = 'Tivi Samsung',
  TV_COCOCACA = 'Tivi Cococaca',
  TV_SHARP = 'Tivi Sharp',
  PC = 'Máy tính',
  LAPTOP_ACER = 'Laptop Acer',
  LAPTOP_DELL = 'Laptop Dell',
  PRINTER_CANON = 'Máy in Canon',
  PRINTER_BROTHER = 'Máy in Brother',
  PHOTOCOPY = 'Máy Photocopy',
  OTHER = 'Thiết bị khác'
}

export enum LocationType {
  WAREHOUSE = 'Kho',
  CLASSROOM = 'Phòng học',
  BORROWED = 'Đang cho mượn'
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  unit: string;
  price: number;
  config?: string;
  supplier?: string;
  entryDate: string;
  status: DeviceStatus;
  image?: string;
  location: LocationType;
  room?: string; // e.g., 'Phòng 1', 'Phòng Tin học'
  campus?: 'Cơ sở 1' | 'Cơ sở 2';
  qrCode: string;
  repairCount: number;
  notes?: string;
}

export interface Staff {
  id: string;
  fullName: string;
  position: string;
  department: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  deviceId: string;
  staffId: string;
  type: 'BORROW' | 'RETURN';
  timestamp: string;
  condition: string;
  image?: string;
  notes?: string;
}

export interface AIRecommendation {
  deviceId: string;
  deviceName: string;
  reason: string;
  action: 'REPAIR' | 'LIQUIDATE';
}
