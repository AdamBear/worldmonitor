// 物流仪表板类型定义

export interface ShippingVolume {
  type: 'sea' | 'air' | 'land';
  volume: number;
  unit: string;
  change: number; // 百分比变化
  trend: 'up' | 'down' | 'stable';
}

export interface Port {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [lng, lat]
  throughput: number; // 吞吐量（TEU）
  change: number; // 百分比变化
  status: 'normal' | 'congested' | 'delayed';
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  capacity: number; // 运力百分比
  utilization: number; // 利用率百分比
  status: 'normal' | 'high' | 'critical';
  type: 'sea' | 'air';
}

export interface CostIndexPoint {
  date: string;
  seaFreight: number;
  airFreight: number;
  fuel: number;
}

export interface SupplyChainAlert {
  id: string;
  type: 'delay' | 'disruption' | 'weather' | 'congestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  coordinates: [number, number];
  description: string;
  timestamp: string;
  affectedRoutes: number;
}

export interface CargoTracking {
  id: string;
  coordinates: [number, number];
  type: 'container' | 'bulk' | 'vehicle';
  status: 'in-transit' | 'at-port' | 'delayed';
  destination: string;
}

export interface DashboardData {
  shippingVolumes: ShippingVolume[];
  ports: Port[];
  routes: Route[];
  costIndex: CostIndexPoint[];
  alerts: SupplyChainAlert[];
  cargoTracking: CargoTracking[];
  lastUpdate: string;
}
