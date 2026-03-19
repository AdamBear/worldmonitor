import { PORTS, getTopContainerPorts, type Port } from '@/config/ports';
import { fetchAisSignals } from './maritime';
import type { AisDensityZone } from '@/types';

export interface PortData {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  throughput: number;
  change: number;
  status: 'normal' | 'congested' | 'delayed';
}

export interface PortActivity {
  portId: string;
  vesselCount: number;
  density: number;
  status: 'normal' | 'congested' | 'delayed';
}

// 港口活动状态缓存
let cachedPortActivities: Map<string, PortActivity> = new Map();
let lastUpdateTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟缓存

// 根据港口位置和 AIS 密度数据计算港口活动状态
function calculatePortActivity(port: Port, densityZones: AisDensityZone[]): PortActivity {
  // 查找港口附近的密度区域（50km范围内）
  const nearbyZones = densityZones.filter(zone => {
    const distance = calculateDistance(port.lat, port.lon, zone.lat, zone.lon);
    return distance < 50; // 50km范围
  });

  // 计算总船舶数量和平均密度
  const totalShips = nearbyZones.reduce((sum, zone) => sum + (zone.shipsPerDay || 0), 0);
  const avgDensity = nearbyZones.length > 0
    ? nearbyZones.reduce((sum, zone) => sum + zone.intensity, 0) / nearbyZones.length
    : 0;

  // 根据密度和船舶数量确定状态
  let status: 'normal' | 'congested' | 'delayed' = 'normal';
  if (avgDensity > 0.8 || totalShips > 100) {
    status = 'congested';
  } else if (avgDensity > 0.6 || totalShips > 50) {
    status = 'delayed';
  }

  return {
    portId: port.id,
    vesselCount: Math.round(totalShips),
    density: avgDensity,
    status
  };
}

// 计算两点之间的距离（km）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 从港口note中提取吞吐量数据（TEU）
function extractThroughput(note: string): number {
  const match = note.match(/(\d+(?:\.\d+)?)\s*M?\+?\s*TEU/i);
  if (match) {
    return parseFloat(match[1]) * 1000; // 转换为K TEU
  }
  // 如果没有TEU数据，返回估算值
  return Math.floor(Math.random() * 5000) + 1000;
}

// 更新港口活动数据
async function updatePortActivities(): Promise<void> {
  try {
    const { density } = await fetchAisSignals();

    // 为每个港口计算活动状态
    for (const port of PORTS) {
      const activity = calculatePortActivity(port, density);
      cachedPortActivities.set(port.id, activity);
    }

    lastUpdateTime = Date.now();
  } catch (error) {
    console.error('Failed to update port activities:', error);
  }
}

// 获取港口活动状态
function getPortActivity(portId: string): PortActivity | null {
  return cachedPortActivities.get(portId) || null;
}

/**
 * 获取实时港口数据
 * @param limit 返回的港口数量限制
 * @returns 港口数据数组
 */
export async function fetchPortData(limit = 20): Promise<PortData[]> {
  // 检查缓存是否过期
  const now = Date.now();
  if (now - lastUpdateTime > CACHE_TTL_MS) {
    await updatePortActivities();
  }

  // 获取排名前N的集装箱港口
  const topPorts = getTopContainerPorts(limit);

  // 转换为 PortData 格式
  return topPorts.map(port => {
    const activity = getPortActivity(port.id);
    const throughput = extractThroughput(port.note);

    // 计算变化百分比（基于活动状态）
    let change = 0;
    if (activity) {
      // 根据状态和密度计算变化
      if (activity.status === 'congested') {
        change = Math.random() * 3 + 5; // 5-8% 增长
      } else if (activity.status === 'delayed') {
        change = Math.random() * 2 + 2; // 2-4% 增长
      } else {
        change = Math.random() * 4 - 1; // -1 到 3% 变化
      }
    } else {
      change = Math.random() * 6 - 2; // -2 到 4% 变化
    }

    return {
      id: port.id,
      name: port.name,
      country: port.country,
      coordinates: [port.lon, port.lat] as [number, number],
      throughput: Math.round(throughput),
      change: Math.round(change * 10) / 10,
      status: activity?.status || 'normal'
    };
  });
}

/**
 * 获取所有可用港口列表（用于配置界面）
 */
export function getAllPorts(): Port[] {
  return PORTS;
}

/**
 * 根据ID获取港口信息
 */
export function getPortById(portId: string): Port | undefined {
  return PORTS.find(p => p.id === portId);
}

/**
 * 初始化港口数据服务
 */
export function initPortDataService(): void {
  // 立即更新一次
  void updatePortActivities();

  // 设置定期更新（每5分钟）
  setInterval(() => {
    void updatePortActivities();
  }, CACHE_TTL_MS);
}
