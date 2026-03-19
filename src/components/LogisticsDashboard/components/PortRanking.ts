import { h } from '@/utils/dom-utils';
import type { Port } from '../types';

interface PortRankingProps {
  ports: Port[];
}

const STATUS_COLORS: Record<string, string> = {
  normal: '#00ff88',
  congested: '#ff6b35',
  delayed: '#ff3366'
};

const STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  congested: '拥堵',
  delayed: '延误'
};

export function createPortRanking(props: PortRankingProps): HTMLElement {
  const panel = h('div', { className: 'panel' });

  const header = h('div', { className: 'panelHeader' },
    h('h3', { className: 'panelTitle' }, 'Top Ports by Throughput')
  );

  const content = h('div', { className: 'panelContent' });
  const portsContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 0.75rem;'
  });

  props.ports.forEach((port, index) => {
    const portCard = h('div', {
      style: `
        padding: 0.875rem;
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
      `
    });

    // Add hover effects
    portCard.addEventListener('mouseenter', () => {
      portCard.style.background = 'rgba(0, 212, 255, 0.1)';
      portCard.style.borderColor = '#00d4ff';
      portCard.style.transform = 'translateX(4px)';
    });

    portCard.addEventListener('mouseleave', () => {
      portCard.style.background = 'rgba(0, 212, 255, 0.05)';
      portCard.style.borderColor = 'rgba(0, 212, 255, 0.2)';
      portCard.style.transform = 'translateX(0)';
    });

    const topRow = h('div', {
      style: 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;'
    });

    const rank = h('span', {
      style: `
        font-size: 1rem;
        font-weight: 700;
        font-family: var(--font-display);
        color: ${index < 3 ? '#00d4ff' : 'var(--text-secondary)'};
        min-width: 1.5rem;
      `
    }, String(index + 1));

    const infoContainer = h('div', { style: 'flex: 1;' });
    const portName = h('div', {
      style: `
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.125rem;
      `
    }, port.name);

    const country = h('div', {
      style: 'font-size: 0.6875rem; color: var(--text-muted);'
    }, port.country);

    infoContainer.appendChild(portName);
    infoContainer.appendChild(country);

    const statusBadge = h('div', {
      style: `
        padding: 0.25rem 0.5rem;
        background: ${STATUS_COLORS[port.status]}20;
        border: 1px solid ${STATUS_COLORS[port.status]};
        border-radius: 4px;
        font-size: 0.625rem;
        font-weight: 600;
        text-transform: uppercase;
        color: ${STATUS_COLORS[port.status]};
      `
    }, STATUS_LABELS[port.status]);

    topRow.appendChild(rank);
    topRow.appendChild(infoContainer);
    topRow.appendChild(statusBadge);

    const bottomRow = h('div', {
      style: 'display: flex; justify-content: space-between; align-items: baseline;'
    });

    const throughputContainer = h('div');
    const throughputValue = h('span', {
      style: `
        font-size: 0.9375rem;
        font-weight: 700;
        font-family: var(--font-display);
        color: #00d4ff;
      `
    }, port.throughput.toLocaleString());

    const throughputUnit = h('span', {
      style: 'font-size: 0.6875rem; color: var(--text-muted); margin-left: 0.375rem;'
    }, 'K TEU');

    throughputContainer.appendChild(throughputValue);
    throughputContainer.appendChild(throughputUnit);

    const changeIndicator = h('div', {
      style: `
        font-size: 0.75rem;
        font-weight: 600;
        color: ${port.change >= 0 ? 'var(--accent-green)' : 'var(--accent-orange)'};
      `
    }, `${port.change >= 0 ? '↑' : '↓'} ${Math.abs(port.change).toFixed(1)}%`);

    bottomRow.appendChild(throughputContainer);
    bottomRow.appendChild(changeIndicator);

    portCard.appendChild(topRow);
    portCard.appendChild(bottomRow);
    portsContainer.appendChild(portCard);
  });

  content.appendChild(portsContainer);
  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}
