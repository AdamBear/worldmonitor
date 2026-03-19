import type { DashboardData } from './types';

// 模拟物流仪表板数据
export const mockDashboardData: DashboardData = {
  shippingVolumes: [
    {
      type: 'sea',
      volume: 12847,
      unit: 'K TEU',
      change: 5.2,
      trend: 'up'
    },
    {
      type: 'air',
      volume: 3421,
      unit: 'K Tons',
      change: -2.1,
      trend: 'down'
    },
    {
      type: 'land',
      volume: 8934,
      unit: 'K Tons',
      change: 1.8,
      trend: 'up'
    }
  ],

  ports: [
    { id: 'CNSHA', name: 'Shanghai', country: 'China', coordinates: [121.4737, 31.2304], throughput: 47030, change: 4.2, status: 'normal' },
    { id: 'SGSIN', name: 'Singapore', country: 'Singapore', coordinates: [103.8198, 1.3521], throughput: 37200, change: 2.8, status: 'normal' },
    { id: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'China', coordinates: [121.5440, 29.8683], throughput: 33350, change: 6.1, status: 'congested' },
    { id: 'CNSZX', name: 'Shenzhen', country: 'China', coordinates: [114.0579, 22.5431], throughput: 30000, change: 3.5, status: 'normal' },
    { id: 'CNGGZ', name: 'Guangzhou', country: 'China', coordinates: [113.2644, 23.1291], throughput: 24180, change: 5.7, status: 'normal' },
    { id: 'KRPUS', name: 'Busan', country: 'South Korea', coordinates: [129.0756, 35.1796], throughput: 22910, change: 1.2, status: 'normal' },
    { id: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', coordinates: [4.4777, 51.9244], throughput: 15280, change: -1.5, status: 'delayed' },
    { id: 'USNYC', name: 'New York', country: 'USA', coordinates: [-74.0060, 40.7128], throughput: 9410, change: 8.3, status: 'congested' }
  ],

  routes: [
    { id: 'r1', origin: 'Shanghai', destination: 'Los Angeles', originCoords: [121.4737, 31.2304], destCoords: [-118.2437, 34.0522], capacity: 95, utilization: 87, status: 'high', type: 'sea' },
    { id: 'r2', origin: 'Singapore', destination: 'Rotterdam', originCoords: [103.8198, 1.3521], destCoords: [4.4777, 51.9244], capacity: 88, utilization: 72, status: 'normal', type: 'sea' },
    { id: 'r3', origin: 'Hong Kong', destination: 'New York', originCoords: [114.1694, 22.3193], destCoords: [-74.0060, 40.7128], capacity: 92, utilization: 95, status: 'critical', type: 'sea' },
    { id: 'r4', origin: 'Dubai', destination: 'London', originCoords: [55.2708, 25.2048], destCoords: [-0.1278, 51.5074], capacity: 78, utilization: 65, status: 'normal', type: 'air' },
    { id: 'r5', origin: 'Tokyo', destination: 'San Francisco', originCoords: [139.6917, 35.6895], destCoords: [-122.4194, 37.7749], capacity: 85, utilization: 81, status: 'high', type: 'air' }
  ],

  costIndex: [
    { date: '2026-01', seaFreight: 2850, airFreight: 4200, fuel: 95 },
    { date: '2026-02', seaFreight: 2920, airFreight: 4350, fuel: 98 },
    { date: '2026-03', seaFreight: 3100, airFreight: 4500, fuel: 102 },
    { date: '2026-04', seaFreight: 3250, airFreight: 4680, fuel: 105 },
    { date: '2026-05', seaFreight: 3180, airFreight: 4550, fuel: 101 },
    { date: '2026-06', seaFreight: 3050, airFreight: 4420, fuel: 99 }
  ],

  alerts: [
    { id: 'a1', type: 'congestion', severity: 'high', location: 'Los Angeles Port', coordinates: [-118.2437, 34.0522], description: 'Port congestion causing 3-5 day delays', timestamp: '2026-03-16T08:30:00Z', affectedRoutes: 12 },
    { id: 'a2', type: 'weather', severity: 'medium', location: 'Pacific Ocean', coordinates: [-140.0, 20.0], description: 'Tropical storm affecting trans-Pacific routes', timestamp: '2026-03-16T06:15:00Z', affectedRoutes: 8 },
    { id: 'a3', type: 'disruption', severity: 'critical', location: 'Suez Canal', coordinates: [32.3498, 30.5852], description: 'Canal blockage - rerouting required', timestamp: '2026-03-16T04:00:00Z', affectedRoutes: 24 },
    { id: 'a4', type: 'delay', severity: 'low', location: 'Singapore Port', coordinates: [103.8198, 1.3521], description: 'Minor equipment maintenance delays', timestamp: '2026-03-16T02:45:00Z', affectedRoutes: 3 }
  ],

  cargoTracking: [
    { id: 'c1', coordinates: [130.5, 25.3], type: 'container', status: 'in-transit', destination: 'Los Angeles' },
    { id: 'c2', coordinates: [-150.2, 35.8], type: 'container', status: 'in-transit', destination: 'Shanghai' },
    { id: 'c3', coordinates: [45.5, 12.2], type: 'bulk', status: 'in-transit', destination: 'Rotterdam' },
    { id: 'c4', coordinates: [103.8198, 1.3521], type: 'container', status: 'at-port', destination: 'Singapore' },
    { id: 'c5', coordinates: [-74.0060, 40.7128], type: 'vehicle', status: 'at-port', destination: 'New York' }
  ],

  lastUpdate: new Date().toISOString()
};

// 模拟实时数据更新
export function generateRealtimeUpdate(): Partial<DashboardData> {
  return {
    shippingVolumes: mockDashboardData.shippingVolumes.map(vol => ({
      ...vol,
      volume: vol.volume + Math.floor(Math.random() * 20 - 10),
      change: vol.change + (Math.random() * 0.4 - 0.2)
    })),
    lastUpdate: new Date().toISOString()
  };
}
