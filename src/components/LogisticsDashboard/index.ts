import { h } from '@/utils/dom-utils';
import { MapContainer } from '@/components/MapContainer';
import { createShippingStats } from './components/ShippingStats';
import { createPortRanking } from './components/PortRanking';
import { createSupplyChainAlerts } from './components/SupplyChainAlerts';
import { mockDashboardData } from './mockData';
import type { DashboardData } from './types';
import type { MapLayers } from '@/types';
import { changeLanguage } from '@/services/i18n';
import { fetchPortData, initPortDataService, getAllPorts } from '@/services/ports';

// 物流专用地图图层配置
const LOGISTICS_MAP_LAYERS: MapLayers = {
  gpsJamming: false,
  satellites: false,
  conflicts: true, // 地区冲突
  bases: true, // 军事基地
  cables: true,
  pipelines: true,
  hotspots: false,
  ais: true,
  nuclear: false,
  irradiators: false,
  sanctions: false,
  weather: true,
  economic: true,
  waterways: true,
  outages: true,
  cyberThreats: false,
  datacenters: false,
  protests: false,
  flights: false, // 禁用航空数据
  military: false,
  natural: true,
  spaceports: false,
  minerals: false,
  fires: false,
  ucdpEvents: false,
  displacement: false,
  climate: false,
  startupHubs: false,
  cloudRegions: false,
  accelerators: false,
  techHQs: false,
  techEvents: false,
  stockExchanges: false,
  financialCenters: false,
  centralBanks: false,
  commodityHubs: true,
  gulfInvestments: false,
  positiveEvents: false,
  kindness: false,
  happiness: false,
  speciesRecovery: false,
  renewableInstallations: false,
  tradeRoutes: true,
  iranAttacks: true, // 伊朗攻击
  ciiChoropleth: false,
  dayNight: false,
  miningSites: false,
  processingPlants: false,
  commodityPorts: true,
};

export function createLogisticsDashboard(): HTMLElement {
  // 强制设置语言为中文
  const currentLang = localStorage.getItem('i18nextLng');
  if (currentLang !== 'zh') {
    localStorage.setItem('i18nextLng', 'zh');
    window.location.reload();
    return document.createElement('div'); // 返回空元素，页面即将重新加载
  }

  // 初始化港口数据服务
  initPortDataService();

  // 先使用 mockData 初始化，然后异步加载真实数据
  let data: DashboardData = mockDashboardData;

  // 添加 CSS 修复地图容器高度问题和隐藏版权信息
  const style = document.createElement('style');
  style.textContent = `
    .maplibregl-canvas-container {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    /* 隐藏地图底部的版权信息 */
    .maplibregl-ctrl-bottom-right,
    .maplibregl-ctrl-bottom-left {
      display: none !important;
    }
    /* 隐藏图层选择器底部的版权文字 */
    .map-author-badge {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // 创建主容器
  const container = h('div', {
    style: 'width: 100%; height: 100vh; display: flex; flex-direction: column; background: var(--bg-primary);'
  });

  // 创建顶部标题栏
  const header = h('div', {
    style: `
      padding: 1rem 2rem;
      background: rgba(15, 20, 25, 0.95);
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    `
  });

  const title = h('h1', {
    style: `
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00d4ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `
  }, '在舱全球物流监控预警中心');

  // 创建3D视图切换按钮
  const toggle3DButton = h('button', {
    style: `
      position: absolute;
      right: 2rem;
      padding: 0.5rem 1rem;
      background: rgba(0, 212, 255, 0.2);
      border: 1px solid #00d4ff;
      border-radius: 4px;
      color: #00d4ff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    `
  }, '切换2D视图');

  toggle3DButton.addEventListener('mouseenter', () => {
    toggle3DButton.style.background = 'rgba(0, 212, 255, 0.3)';
  });

  toggle3DButton.addEventListener('mouseleave', () => {
    toggle3DButton.style.background = 'rgba(0, 212, 255, 0.2)';
  });

  toggle3DButton.addEventListener('click', () => {
    const mapContainer = (mapWrapper as any)._mapContainer;
    if (mapContainer) {
      if (mapContainer.isGlobeMode && mapContainer.isGlobeMode()) {
        mapContainer.switchToFlat();
        toggle3DButton.textContent = '切换3D视图';
      } else {
        mapContainer.switchToGlobe();
        toggle3DButton.textContent = '切换2D视图';
      }
    }
  });

  // 创建配置按钮
  const configButton = h('button', {
    style: `
      position: absolute;
      right: 10rem;
      padding: 0.5rem 1rem;
      background: rgba(0, 212, 255, 0.2);
      border: 1px solid #00d4ff;
      border-radius: 4px;
      color: #00d4ff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    `
  }, '⚙️ 配置监控');

  configButton.addEventListener('mouseenter', () => {
    configButton.style.background = 'rgba(0, 212, 255, 0.3)';
  });

  configButton.addEventListener('mouseleave', () => {
    configButton.style.background = 'rgba(0, 212, 255, 0.2)';
  });

  const headerTop = h('div', {
    style: 'position: relative; display: flex; align-items: center; justify-content: center; width: 100%;'
  });

  headerTop.appendChild(title);
  headerTop.appendChild(configButton);
  headerTop.appendChild(toggle3DButton);

  const kpiContainer = h('div', {
    style: 'display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;'
  });

  // 保存KPI值元素的引用，以便后续更新
  const kpiValueElements: { [key: string]: HTMLElement } = {};

  // 获取当前配置的监控港口数量
  const getMonitoredPortsCount = (): number => {
    const savedConfig = localStorage.getItem('logistics-monitor-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      return config.monitoredPorts?.length || 0;
    }
    return 5; // 默认5个
  };

  // 计算 KPI
  const calculateKPIs = () => {
    const totalVolume = data.shippingVolumes.reduce((sum, vol) => sum + vol.volume, 0);
    const criticalAlerts = data.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const monitoredPortsCount = getMonitoredPortsCount();

    return [
      { key: 'volume', label: '总货运量', value: `${totalVolume.toLocaleString()}K` },
      { key: 'routes', label: '活跃航线', value: data.routes.length.toString() },
      { key: 'ports', label: '主要港口', value: monitoredPortsCount.toString() },
      { key: 'alerts', label: '关键警报', value: criticalAlerts.toString() }
    ];
  };

  // 更新KPI显示
  const updateKPIs = () => {
    const kpis = calculateKPIs();
    kpis.forEach(kpi => {
      if (kpiValueElements[kpi.key]) {
        kpiValueElements[kpi.key].textContent = kpi.value;
      }
    });
  };

  // 初始化KPI显示
  const kpis = calculateKPIs();
  kpis.forEach(kpi => {
    const kpiEl = h('div', {
      style: 'display: flex; flex-direction: column; align-items: center;'
    });
    const label = h('div', {
      style: 'font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;'
    }, kpi.label);
    const value = h('div', {
      style: 'font-size: 1.25rem; font-weight: 700; color: #00d4ff;'
    }, kpi.value);
    kpiValueElements[kpi.key] = value; // 保存引用
    kpiEl.appendChild(label);
    kpiEl.appendChild(value);
    kpiContainer.appendChild(kpiEl);
  });

  header.appendChild(headerTop);
  header.appendChild(kpiContainer);

  // 创建内容区域
  const content = h('div', {
    style: 'flex: 1; display: flex; gap: 1rem; padding: 1rem; overflow: hidden;'
  });

  // 创建地图容器（左侧，占据大部分空间）
  const mapWrapper = h('div', {
    style: 'flex: 1; min-width: 0; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);'
  });

  // 延迟初始化地图，确保 DOM 元素已经有正确的尺寸
  let mapContainer: MapContainer | null = null;
  requestAnimationFrame(() => {
    setTimeout(() => {
      mapContainer = new MapContainer(mapWrapper, {
        zoom: 2,
        pan: { x: 0, y: 0 },
        view: 'global',
        layers: LOGISTICS_MAP_LAYERS,
        timeRange: '24h'
      }, true); // 默认使用3D地球模式
      // 保存引用防止垃圾回收
      (mapWrapper as any)._mapContainer = mapContainer;

      // 强制调整地图大小以确保正确渲染
      setTimeout(() => {
        if (mapContainer) {
          mapContainer.resize();
        }
      }, 100);

      // 修复地图控件中的 undefined 文本和图层标签
      setTimeout(() => {
        const fixUndefinedLabels = () => {
          // 修复按钮标签
          const buttons = mapWrapper.querySelectorAll('button');
          buttons.forEach(btn => {
            if (btn.textContent === 'undefined' || btn.getAttribute('aria-label') === 'undefined') {
              const text = btn.textContent?.trim();
              if (text === '+') btn.setAttribute('aria-label', '放大');
              else if (text === '-') btn.setAttribute('aria-label', '缩小');
              else if (text === '⌂') btn.setAttribute('aria-label', '重置视图');
              else if (text === '?') btn.setAttribute('aria-label', '帮助');
              else if (text === 'undefined') btn.style.display = 'none';
            }
          });

          // 隐藏显示 "UNDEFINED" 或 "undefined" 的文本节点
          const walker = document.createTreeWalker(
            mapWrapper,
            NodeFilter.SHOW_TEXT,
            null
          );
          const nodesToHide: Node[] = [];
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent?.trim() === 'UNDEFINED' || node.textContent?.trim() === 'undefined') {
              nodesToHide.push(node);
            }
          }
          nodesToHide.forEach(n => {
            if (n.parentElement) {
              n.parentElement.style.display = 'none';
            }
          });

          // 修复输入框占位符
          const inputs = mapWrapper.querySelectorAll('input, textarea');
          inputs.forEach(input => {
            if (input.getAttribute('placeholder') === 'undefined') {
              input.setAttribute('placeholder', '搜索...');
            }
          });

          // 替换图层标签为中文 - 直接查找 .toggle-label 元素
          const layerLabels: Record<string, string> = {
            'IRAN ATTACKS': '伊朗攻击',
            'INTEL HOTSPOTS': '情报热点',
            'CONFLICT ZONES': '地区冲突',
            'MILITARY BASES': '军事基地',
            'NUCLEAR SITES': '核设施',
            'GAMMA IRRADIATORS': '伽马辐照器',
            'SPACEPORTS': '航天发射场',
            'UNDERSEA CABLES': '海底电缆',
            'PIPELINES': '管道',
            'AI DATA CENTERS': 'AI数据中心',
            'MILITARY ACTIVITY': '军事活动',
            'SHIP TRAFFIC': '船舶交通',
            'TRADE ROUTES': '贸易航线',
            'AVIATION': '航空',
            'PROTESTS': '抗议活动',
            'ARMED CONFLICT EVENTS': '武装冲突事件',
            'DISPLACEMENT FLOWS': '流离失所流向',
            'CLIMATE ANOMALIES': '气候异常',
            'WEATHER ALERTS': '天气预警',
            'INTERNET OUTAGES': '互联网中断',
            'CYBER THREATS': '网络威胁',
            'NATURAL EVENTS': '自然事件',
            'FIRES': '火灾',
            'STRATEGIC WATERWAYS': '战略水道',
            'ECONOMIC CENTERS': '经济中心',
            'CRITICAL MINERALS': '关键矿产',
            'GPS JAMMING': 'GPS干扰',
            'ORBITAL SURVEILLANCE': '轨道监视',
            'CII INSTABILITY': '不稳定指数',
            'DAY/NIGHT': '昼夜'
          };

          // 直接查找并替换图层标签元素
          const toggleLabels = mapWrapper.querySelectorAll('.toggle-label');
          toggleLabels.forEach(label => {
            const text = label.textContent?.trim();
            if (text) {
              // 移除可能的锁定图标和PRO标记
              const cleanText = text.replace(/\s*🔒\s*$/, '').replace(/<span[^>]*>PRO<\/span>/, '').trim();
              if (layerLabels[cleanText]) {
                // 保留原有的锁定图标和PRO标记
                const hasLock = text.includes('🔒');
                const hasPro = text.includes('PRO');
                let newText = layerLabels[cleanText];
                if (hasLock) newText += ' 🔒';
                if (hasPro) newText += ' <span class="layer-pro-badge">PRO</span>';
                label.innerHTML = newText;
              }
            }
          });
        };

        fixUndefinedLabels();
        // 多次执行以确保所有元素都被修复（图层选择器可能延迟渲染）
        setTimeout(fixUndefinedLabels, 500);
        setTimeout(fixUndefinedLabels, 1000);
        setTimeout(fixUndefinedLabels, 1500);
        setTimeout(fixUndefinedLabels, 2000);
        setTimeout(fixUndefinedLabels, 3000);
      }, 200);
    }, 100);
  });

  // 创建右侧滚动容器（外层）
  const scrollWrapper = h('div', {
    style: `
      width: 400px;
      height: calc(100vh - 180px);
      overflow-y: scroll;
      flex-shrink: 0;
      padding-right: 0.5rem;
    `
  });

  // 创建右侧面板容器（内层）
  const panelsContainer = h('div', {
    style: `
      display: flex;
      flex-direction: column;
      gap: 1rem;
    `
  });

  // 获取配置的监控港口（按配置顺序）
  const getMonitoredPorts = () => {
    const savedConfig = localStorage.getItem('logistics-monitor-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      const monitoredPortIds = config.monitoredPorts || [];
      // 去重：确保没有重复的港口ID
      const uniquePortIds = Array.from(new Set(monitoredPortIds));
      // 按照配置中的顺序返回港口
      return uniquePortIds
        .map(id => data.ports.find(p => p.id === id))
        .filter(p => p !== undefined);
    }
    // 默认返回前5个港口
    return data.ports.slice(0, 5);
  };

  // 创建港口排名面板的函数
  let currentPortRanking: HTMLElement;
  const createAndUpdatePortRanking = () => {
    const monitoredPorts = getMonitoredPorts();
    const newPortRanking = createPortRanking({ ports: monitoredPorts });
    updatePanelTitle(newPortRanking, '主要港口吞吐量');

    if (currentPortRanking && currentPortRanking.parentNode) {
      panelsContainer.replaceChild(newPortRanking, currentPortRanking);
    } else {
      panelsContainer.appendChild(newPortRanking);
    }
    currentPortRanking = newPortRanking;
  };

  // 创建面板
  const shippingStats = createShippingStats({ volumes: data.shippingVolumes });
  currentPortRanking = createPortRanking({ ports: getMonitoredPorts() });
  const supplyChainAlerts = createSupplyChainAlerts({ alerts: data.alerts });

  // 修改面板标题为中文
  updatePanelTitle(shippingStats, '全球货运量');
  updatePanelTitle(currentPortRanking, '主要港口吞吐量');
  updatePanelTitle(supplyChainAlerts, '供应链预警');

  panelsContainer.appendChild(shippingStats);
  panelsContainer.appendChild(currentPortRanking);
  panelsContainer.appendChild(supplyChainAlerts);

  // 异步加载真实港口数据并更新面板
  fetchPortData(20).then(realPortData => {
    // 更新 data 对象
    data.ports = realPortData.map(port => ({
      id: port.id,
      name: port.name,
      country: port.country,
      coordinates: port.coordinates,
      throughput: port.throughput,
      change: port.change,
      status: port.status
    }));

    // 更新KPI显示
    updateKPIs();

    // 重新创建港口排名面板（根据配置）
    createAndUpdatePortRanking();
  }).catch(error => {
    console.error('Failed to load real port data:', error);
  });

  scrollWrapper.appendChild(panelsContainer);

  content.appendChild(mapWrapper);
  content.appendChild(scrollWrapper);

  container.appendChild(header);
  container.appendChild(content);

  // 创建配置模态框
  const configModal = h('div', {
    style: `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `
  });

  const modalContent = h('div', {
    style: `
      background: var(--bg-secondary);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `
  });

  const modalTitle = h('h2', {
    style: `
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #00d4ff;
    `
  }, '港口和航线监控配置');

  // 从 localStorage 加载配置
  const savedConfig = localStorage.getItem('logistics-monitor-config');
  const config = savedConfig ? JSON.parse(savedConfig) : {
    monitoredPorts: ['qingdao', 'tianjin', 'ningbo', 'shanghai', 'singapore'],
    monitoredRoutes: data.routes.map(r => r.id)
  };

  // 港口配置区域
  const portsSection = h('div', {
    style: 'margin-bottom: 1.5rem;'
  });

  const portsTitle = h('h3', {
    style: `
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    `
  }, '监控港口');

  // 已选港口容器（可拖拽排序）
  const selectedPortsContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(0, 212, 255, 0.05); border-radius: 4px; border: 1px solid rgba(0, 212, 255, 0.2);'
  });

  const selectedPortsTitle = h('div', {
    style: 'font-size: 0.875rem; color: rgba(0, 212, 255, 0.8); margin-bottom: 0.5rem; font-weight: 600;'
  }, '已选港口（拖动调整顺序）');

  const selectedPortsList = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.25rem;'
  });

  selectedPortsContainer.appendChild(selectedPortsTitle);
  selectedPortsContainer.appendChild(selectedPortsList);

  // 可选港口容器
  const availablePortsContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.5rem;'
  });

  const availablePortsTitle = h('div', {
    style: 'font-size: 0.875rem; color: rgba(255, 255, 255, 0.6); margin-bottom: 0.5rem; font-weight: 600;'
  }, '可选港口');

  const availablePortsList = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.25rem; max-height: 200px; overflow-y: auto;'
  });

  availablePortsContainer.appendChild(availablePortsTitle);
  availablePortsContainer.appendChild(availablePortsList);

  const portsContainer = h('div', {
    style: 'display: flex; flex-direction: column;'
  });

  portsContainer.appendChild(selectedPortsContainer);
  portsContainer.appendChild(availablePortsContainer);

  // 拖拽状态
  let draggedElement: HTMLElement | null = null;
  let draggedPortId: string | null = null;

  // 渲染锁，防止并发渲染
  let isRendering = false;
  let renderTimeout: number | null = null;

  // 获取当前所有选中的港口ID（从所有复选框读取）
  const getSelectedPortIds = (): string[] => {
    const checkboxes = portsContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIds: string[] = [];
    checkboxes.forEach(cb => {
      const portId = (cb as HTMLInputElement).getAttribute('data-port-id');
      if (portId) {
        selectedIds.push(portId);
      }
    });
    return selectedIds;
  };

  // 创建港口项的函数（不添加change事件监听器）
  const createPortItem = (port: any, isSelected: boolean) => {
    const portItem = h('div', {
      draggable: isSelected ? 'true' : 'false',
      'data-port-id': port.id,
      style: `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 4px;
        transition: all 0.2s;
        background: ${isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
        border: 1px solid ${isSelected ? 'rgba(0, 212, 255, 0.3)' : 'transparent'};
        cursor: ${isSelected ? 'move' : 'default'};
      `
    });

    // 拖拽手柄（仅已选港口显示）
    if (isSelected) {
      const dragHandle = h('span', {
        style: 'color: rgba(0, 212, 255, 0.6); font-size: 1rem; cursor: move;'
      }, '⋮⋮');
      portItem.appendChild(dragHandle);
    }

    const checkbox = h('input', {
      type: 'checkbox',
      checked: isSelected,
      style: 'cursor: pointer;',
      'data-port-id': port.id
    }) as HTMLInputElement;

    const label = h('span', {
      style: 'color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; flex: 1;'
    }, `${port.name} (${port.country})`);

    portItem.appendChild(checkbox);
    portItem.appendChild(label);

    // 拖拽事件（仅已选港口）
    if (isSelected) {
      portItem.addEventListener('dragstart', (e) => {
        draggedElement = portItem;
        draggedPortId = port.id;
        portItem.style.opacity = '0.5';
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      portItem.addEventListener('dragend', () => {
        portItem.style.opacity = '1';
        draggedElement = null;
        draggedPortId = null;
        // 移除所有拖拽指示器
        selectedPortsList.querySelectorAll('[data-port-id]').forEach(el => {
          (el as HTMLElement).style.borderTop = '';
          (el as HTMLElement).style.borderBottom = '';
        });
      });

      portItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== portItem) {
          const rect = portItem.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          if (e.clientY < midpoint) {
            portItem.style.borderTop = '2px solid #00d4ff';
            portItem.style.borderBottom = '';
          } else {
            portItem.style.borderTop = '';
            portItem.style.borderBottom = '2px solid #00d4ff';
          }
        }
      });

      portItem.addEventListener('dragleave', () => {
        portItem.style.borderTop = '';
        portItem.style.borderBottom = '';
      });

      portItem.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== portItem) {
          const rect = portItem.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          if (e.clientY < midpoint) {
            selectedPortsList.insertBefore(draggedElement, portItem);
          } else {
            selectedPortsList.insertBefore(draggedElement, portItem.nextSibling);
          }
        }
        portItem.style.borderTop = '';
        portItem.style.borderBottom = '';
      });
    }

    // 悬停效果
    portItem.addEventListener('mouseenter', () => {
      if (!isSelected) {
        portItem.style.background = 'rgba(0, 212, 255, 0.05)';
      }
    });

    portItem.addEventListener('mouseleave', () => {
      if (!isSelected) {
        portItem.style.background = 'transparent';
      }
    });

    return portItem;
  };

  // 渲染港口列表（带防抖和并发保护）
  const renderPortLists = (initialSelectedIds?: string[]) => {
    // 防止并发渲染
    if (isRendering) {
      return;
    }

    // 清除之前的防抖定时器
    if (renderTimeout !== null) {
      clearTimeout(renderTimeout);
      renderTimeout = null;
    }

    // 设置渲染锁
    isRendering = true;

    try {
      // 获取当前选中的港口ID（保持顺序）
      let selectedIds: string[];

      if (initialSelectedIds) {
        // 使用传入的初始选中ID
        selectedIds = initialSelectedIds;
      } else {
        // 先保存当前已选区域的顺序
        const currentOrder = Array.from(selectedPortsList.querySelectorAll('[data-port-id]'))
          .map(item => (item as HTMLElement).getAttribute('data-port-id'))
          .filter(Boolean) as string[];

        // 从所有复选框读取当前选中的港口ID
        const checkedIds = getSelectedPortIds();

        // 合并：先保持已选区域的顺序，再添加新选中的
        selectedIds = [...currentOrder.filter(id => checkedIds.includes(id))];
        checkedIds.forEach(id => {
          if (!selectedIds.includes(id)) {
            selectedIds.push(id);
          }
        });
      }

      // 去重：确保selectedIds中没有重复的港口ID
      selectedIds = Array.from(new Set(selectedIds));

      // 获取所有港口
      const allPorts = getAllPorts();

      // 分离已选和未选港口
      const selectedPorts = selectedIds
        .map(id => allPorts.find(p => p.id === id))
        .filter(p => p !== undefined);

      const availablePorts = allPorts.filter(p => !selectedIds.includes(p.id));

      // 清空容器
      selectedPortsList.innerHTML = '';
      availablePortsList.innerHTML = '';

      // 渲染已选港口
      if (selectedPorts.length === 0) {
        const emptyMessage = h('div', {
          style: 'color: rgba(255, 255, 255, 0.4); font-size: 0.875rem; padding: 0.5rem; text-align: center;'
        }, '请从下方选择港口');
        selectedPortsList.appendChild(emptyMessage);
      } else {
        selectedPorts.forEach(port => {
          selectedPortsList.appendChild(createPortItem(port, true));
        });
      }

      // 渲染可选港口
      availablePorts.forEach(port => {
        availablePortsList.appendChild(createPortItem(port, false));
      });
    } finally {
      // 释放渲染锁
      isRendering = false;
    }
  };

  // 初始化港口列表（使用配置中的监控港口）
  renderPortLists(config.monitoredPorts);

  // 使用事件委托处理所有复选框变化（防止重复事件监听器）
  portsContainer.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      renderPortLists();
      updateRoutesDisplay();
    }
  });

  portsSection.appendChild(portsTitle);
  portsSection.appendChild(portsContainer);

  // 航线配置区域
  const routesSection = h('div', {
    style: 'margin-bottom: 1.5rem;'
  });

  const routesTitle = h('h3', {
    style: `
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    `
  }, '监控航线');

  const routesContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.5rem;'
  });

  // 动态更新航线显示的函数
  const updateRoutesDisplay = () => {
    // 获取当前选中的港口
    const selectedPorts = Array.from(portsContainer.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => (cb as HTMLInputElement).getAttribute('data-port-id'))
      .filter(Boolean);

    // 获取选中港口的名称
    const selectedPortNames = data.ports
      .filter(p => selectedPorts.includes(p.id))
      .map(p => p.name);

    // 清空航线容器
    routesContainer.innerHTML = '';

    // 过滤并显示相关航线
    const relevantRoutes = data.routes.filter(route =>
      selectedPortNames.includes(route.origin) || selectedPortNames.includes(route.destination)
    );

    if (relevantRoutes.length === 0) {
      const emptyMessage = h('div', {
        style: 'color: rgba(255, 255, 255, 0.5); font-size: 0.875rem; padding: 1rem; text-align: center;'
      }, '请先选择港口以查看相关航线');
      routesContainer.appendChild(emptyMessage);
      return;
    }

    relevantRoutes.forEach(route => {
      const routeCheckbox = h('label', {
        style: `
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        `
      });

      const checkbox = h('input', {
        type: 'checkbox',
        checked: config.monitoredRoutes.includes(route.id),
        style: 'cursor: pointer;',
        'data-route-id': route.id
      }) as HTMLInputElement;

      const routeLabel = `${route.origin} → ${route.destination} (${route.type === 'sea' ? '海运' : '空运'})`;
      const label = h('span', {
        style: 'color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;'
      }, routeLabel);

      routeCheckbox.appendChild(checkbox);
      routeCheckbox.appendChild(label);
      routesContainer.appendChild(routeCheckbox);

      routeCheckbox.addEventListener('mouseenter', () => {
        routeCheckbox.style.background = 'rgba(0, 212, 255, 0.1)';
      });

      routeCheckbox.addEventListener('mouseleave', () => {
        routeCheckbox.style.background = 'transparent';
      });
    });
  };

  // 初始化航线显示
  updateRoutesDisplay();

  routesSection.appendChild(routesTitle);
  routesSection.appendChild(routesContainer);

  // 按钮区域
  const buttonsContainer = h('div', {
    style: 'display: flex; gap: 1rem; justify-content: flex-end;'
  });

  const cancelButton = h('button', {
    style: `
      padding: 0.5rem 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    `
  }, '取消');

  const saveButton = h('button', {
    style: `
      padding: 0.5rem 1.5rem;
      background: rgba(0, 212, 255, 0.2);
      border: 1px solid #00d4ff;
      border-radius: 4px;
      color: #00d4ff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    `
  }, '保存');

  cancelButton.addEventListener('mouseenter', () => {
    cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
  });

  cancelButton.addEventListener('mouseleave', () => {
    cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
  });

  saveButton.addEventListener('mouseenter', () => {
    saveButton.style.background = 'rgba(0, 212, 255, 0.3)';
  });

  saveButton.addEventListener('mouseleave', () => {
    saveButton.style.background = 'rgba(0, 212, 255, 0.2)';
  });

  // 关闭模态框
  const closeModal = () => {
    configModal.style.display = 'none';
  };

  // 保存配置
  const saveConfig = () => {
    // 从已选港口列表中按顺序获取港口ID（保持拖拽后的顺序）
    const selectedPortItems = selectedPortsList.querySelectorAll('[data-port-id]');
    const monitoredPorts: string[] = [];

    selectedPortItems.forEach((item) => {
      const portId = (item as HTMLElement).getAttribute('data-port-id');
      if (portId) {
        monitoredPorts.push(portId);
      }
    });

    // 获取选中的航线
    const routeCheckboxes = routesContainer.querySelectorAll('input[type="checkbox"]:checked');
    const monitoredRoutes: string[] = [];

    routeCheckboxes.forEach((checkbox) => {
      const routeId = (checkbox as HTMLInputElement).getAttribute('data-route-id');
      if (routeId) {
        monitoredRoutes.push(routeId);
      }
    });

    const newConfig = { monitoredPorts, monitoredRoutes };
    localStorage.setItem('logistics-monitor-config', JSON.stringify(newConfig));

    // 更新KPI显示（主要港口数量）
    updateKPIs();

    // 更新港口排名面板
    createAndUpdatePortRanking();

    closeModal();
  };

  cancelButton.addEventListener('click', closeModal);
  saveButton.addEventListener('click', saveConfig);

  // 点击背景关闭模态框
  configModal.addEventListener('click', (e) => {
    if (e.target === configModal) {
      closeModal();
    }
  });

  // 配置按钮点击事件
  configButton.addEventListener('click', () => {
    configModal.style.display = 'flex';
  });

  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(saveButton);

  modalContent.appendChild(modalTitle);
  modalContent.appendChild(portsSection);
  modalContent.appendChild(routesSection);
  modalContent.appendChild(buttonsContainer);

  configModal.appendChild(modalContent);
  container.appendChild(configModal);

  return container;
}

function updatePanelTitle(panel: HTMLElement, newTitle: string): void {
  const titleEl = panel.querySelector('.panelTitle');
  if (titleEl) {
    titleEl.textContent = newTitle;
  }
}
