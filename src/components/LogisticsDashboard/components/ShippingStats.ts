import { h } from '@/utils/dom-utils';
import type { ShippingVolume } from '../types';

interface ShippingStatsProps {
  volumes: ShippingVolume[];
}

const ICONS: Record<string, string> = {
  sea: '🚢',
  air: '✈️',
  land: '🚛'
};

const COLORS: Record<string, string> = {
  sea: '#00d4ff',
  air: '#00ff88',
  land: '#a855f7'
};

const LABELS: Record<string, string> = {
  sea: '海运',
  air: '空运',
  land: '陆运'
};

export function createShippingStats(props: ShippingStatsProps): HTMLElement {
  const panel = h('div', { className: 'panel' });

  const header = h('div', { className: 'panelHeader' },
    h('h3', { className: 'panelTitle' }, 'Global Shipping Volume')
  );

  const content = h('div', { className: 'panelContent' });
  const volumesContainer = h('div', {
    style: 'display: flex; flex-direction: column; gap: 1rem;'
  });

  props.volumes.forEach((vol) => {
    const volumeCard = h('div', {
      style: `
        padding: 1rem;
        background: linear-gradient(135deg, ${COLORS[vol.type]}15, transparent);
        border: 1px solid ${COLORS[vol.type]}40;
        border-radius: 8px;
        transition: all 0.3s ease;
      `
    });

    const iconRow = h('div', {
      style: 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;'
    },
      h('span', { style: 'font-size: 1.25rem;' }, ICONS[vol.type]),
      h('span', {
        style: `
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: ${COLORS[vol.type]};
        `
      }, LABELS[vol.type])
    );

    const dataRow = h('div', {
      style: 'display: flex; justify-content: space-between; align-items: baseline;'
    });

    const valueContainer = h('div');
    const value = h('span', {
      style: `
        font-size: 1.5rem;
        font-weight: 700;
        font-family: var(--font-display);
        color: ${COLORS[vol.type]};
      `
    }, vol.volume.toLocaleString());

    const unit = h('span', {
      style: 'font-size: 0.7rem; color: var(--text-muted); margin-left: 0.5rem;'
    }, vol.unit);

    valueContainer.appendChild(value);
    valueContainer.appendChild(unit);

    const changeContainer = h('div', {
      style: `
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: ${vol.trend === 'up' ? 'var(--accent-green)' : 'var(--accent-orange)'};
      `
    },
      h('span', null, vol.trend === 'up' ? '↑' : '↓'),
      h('span', null, `${Math.abs(vol.change).toFixed(1)}%`)
    );

    dataRow.appendChild(valueContainer);
    dataRow.appendChild(changeContainer);

    volumeCard.appendChild(iconRow);
    volumeCard.appendChild(dataRow);
    volumesContainer.appendChild(volumeCard);
  });

  content.appendChild(volumesContainer);
  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}
