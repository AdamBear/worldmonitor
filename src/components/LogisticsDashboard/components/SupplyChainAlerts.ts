import { h } from '@/utils/dom-utils';
import type { SupplyChainAlert } from '../types';

interface SupplyChainAlertsProps {
  alerts: SupplyChainAlert[];
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#00ff88',
  medium: '#ffd700',
  high: '#ff6b35',
  critical: '#ff3366'
};

const TYPE_ICONS: Record<string, string> = {
  delay: '⏱️',
  disruption: '⚠️',
  weather: '🌪️',
  congestion: '🚧'
};

const TYPE_LABELS: Record<string, string> = {
  delay: '延误',
  disruption: '中断',
  weather: '天气',
  congestion: '拥堵'
};

const SEVERITY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重'
};

export function createSupplyChainAlerts(props: SupplyChainAlertsProps): HTMLElement {
  const panel = h('div', { className: 'panel' });

  const header = h('div', { className: 'panelHeader' });
  const title = h('h3', { className: 'panelTitle' }, 'Supply Chain Alerts');
  const badge = h('span', {
    style: `
      padding: 0.25rem 0.5rem;
      background: rgba(255, 51, 102, 0.2);
      border: 1px solid #ff3366;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #ff3366;
    `
  }, `${props.alerts.length} Active`);

  header.appendChild(title);
  header.appendChild(badge);

  const content = h('div', { className: 'panelContent' });
  const alertsContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.75rem;'
  });

  const sortedAlerts = [...props.alerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity] ?? 999) - (severityOrder[b.severity] ?? 999);
  });

  sortedAlerts.forEach((alert) => {
    const alertCard = h('div', {
      style: `
        padding: 0.875rem;
        background: ${SEVERITY_COLORS[alert.severity]}10;
        border: 1px solid ${SEVERITY_COLORS[alert.severity]};
        border-left: 4px solid ${SEVERITY_COLORS[alert.severity]};
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
      `
    });

    alertCard.addEventListener('mouseenter', () => {
      alertCard.style.background = `${SEVERITY_COLORS[alert.severity]}20`;
      alertCard.style.boxShadow = `0 0 20px ${SEVERITY_COLORS[alert.severity]}40`;
    });

    alertCard.addEventListener('mouseleave', () => {
      alertCard.style.background = `${SEVERITY_COLORS[alert.severity]}10`;
      alertCard.style.boxShadow = 'none';
    });

    const contentRow = h('div', {
      style: 'display: flex; align-items: flex-start; gap: 0.75rem;'
    });

    const icon = h('span', { style: 'font-size: 1.25rem;' }, TYPE_ICONS[alert.type]);

    const infoContainer = h('div', { style: 'flex: 1;' });

    const headerRow = h('div', {
      style: 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.375rem;'
    });

    const typeLabel = h('span', {
      style: `
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        color: ${SEVERITY_COLORS[alert.severity]};
      `
    }, TYPE_LABELS[alert.type]);

    const severityBadge = h('span', {
      style: `
        padding: 0.125rem 0.375rem;
        background: ${SEVERITY_COLORS[alert.severity]};
        border-radius: 3px;
        font-size: 0.5625rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #0a0e1a;
      `
    }, SEVERITY_LABELS[alert.severity]);

    headerRow.appendChild(typeLabel);
    headerRow.appendChild(severityBadge);

    const location = h('div', {
      style: `
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      `
    }, alert.location);

    const description = h('div', {
      style: `
        font-size: 0.7rem;
        color: var(--text-secondary);
        line-height: 1.4;
        margin-bottom: 0.5rem;
      `
    }, alert.description);

    const footerRow = h('div', {
      style: 'display: flex; justify-content: space-between; align-items: center;'
    });

    const timestamp = h('span', {
      style: 'font-size: 0.625rem; color: var(--text-muted);'
    }, new Date(alert.timestamp).toLocaleString());

    const affectedRoutes = h('span', {
      style: `
        font-size: 0.6875rem;
        font-weight: 600;
        color: ${SEVERITY_COLORS[alert.severity]};
      `
    }, `${alert.affectedRoutes} 条航线受影响`);

    footerRow.appendChild(timestamp);
    footerRow.appendChild(affectedRoutes);

    infoContainer.appendChild(headerRow);
    infoContainer.appendChild(location);
    infoContainer.appendChild(description);
    infoContainer.appendChild(footerRow);

    contentRow.appendChild(icon);
    contentRow.appendChild(infoContainer);

    alertCard.appendChild(contentRow);
    alertsContainer.appendChild(alertCard);
  });

  content.appendChild(alertsContainer);
  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}
