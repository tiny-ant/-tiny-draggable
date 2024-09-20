import React, { DOMAttributes } from 'react';

/** 多选的时候，内部是否可以再次选中 */
let multiInsideCanSelect = false;

/**
 * 图表点选处理
 */
export default function createSelect(
  dashboard: any,
  modifier: React.MutableRefObject<string | undefined>
): DOMAttributes<HTMLDivElement> {
  dashboard.addEvent(
    'dragmove',
    async e => {
      /**
       * 这里逻辑为：
       * 1. 当鼠标松开时，判断是否可以组内选中
       * 2. 如果发生拖动，判断为拖拽，而不是组内选中
       */
      multiInsideCanSelect = false;
    },
    'select-inside'
  );

  return {
    // 鼠标按下未选中的图表立即拖拽，须让仪表盘先更新selectedCharts
    onMouseDownCapture(ev) {
      if (dashboard.isFrozen) {
        dashboard.clearSelect();
        return;
      }

      const chartId = getSelectChartId(ev);
      if (!chartId) {
        if (!(ev.target as Element).closest('[data-direction]')) {
          dashboard.clearSelect();
        }
        return;
      }
      ev.preventDefault();

      const selectedCharts = dashboard.getSelectedCharts();
      // 当前选中的这个图表是否在已选集合中
      multiInsideCanSelect =
        selectedCharts.length > 1 && selectedCharts.some(chart => chart.id === chartId);
      if (multiInsideCanSelect) return;

      if (modifier.current === 'ctrl') {
        dashboard.toggleSelectChart(chartId, {
          ignoreGroup: dashboard.isGroupSelected(chartId),
        });
      } else if (!dashboard.isSelected(chartId)) {
        dashboard.selectCharts([chartId]);
      }
      dashboard.getPluginHooks.updateResizer();
    },
    onMouseUpCapture(ev) {
      if (dashboard.isFrozen) return;

      const chartId = getSelectChartId(ev);
      const chart = dashboard.getChartById(chartId);
      if (!chart) return;

      // 图表集合内，再选中单个图表的逻辑
      if (!multiInsideCanSelect) return;
      dashboard.selectCharts([chart.id], {
        ignoreGroup: true,
      });
    },
  };
}

function getSelectChartId(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
  const chartEl = (ev.target as Element).closest('[data-layout-id]');

  if (!chartEl) return null;
  const { layoutId: chartId = '' } = (chartEl as HTMLElement).dataset;
  return chartId;
}
