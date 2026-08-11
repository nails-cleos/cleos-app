import { createChart } from './chart';
import { secondsToHHMM } from './dates';
import { describe, expect, it } from 'vitest';

describe('createChart util', () => {
  it('should create default chart with datasets and labels', () => {
    const chart: any = {
      type: 'bar',
      labels: ['A', 'B'],
      colors: 'COLORS',
      options: 'CHART',
      dataSet: [
        {
          label: 'Dataset 1',
          data: [10, 20],
        },
      ],
    };

    const result = createChart(chart);

    expect(result.type).toBe('bar');
    expect(result.labels).toEqual(['A', 'B']);
    expect(result.charData.datasets.length).toBe(1);
    expect(result.charData.datasets[0].label).toBe('Dataset 1');
    expect(result.charData.datasets[0].data).toEqual([10, 20]);
  });

  it('should create bar chart options with tooltip label callback', () => {
    const chart: any = {
      type: 'bar',
      labels: ['2024-01-01'],
      colors: 'COLORS',
      options: 'BAR_CHART',
      sum: true,
      dataSet: [
        {
          label: 'Revenue',
          data: [100],
        },
      ],
    };

    const result = createChart(
      chart,
      { code: 'EUR', symbol: '€' } as any,
      false,
      'en-US',
    );

    const tooltipLabel = (result.options.plugins as any).tooltip.callbacks
      .label;

    const tooltipFooter = (result.options.plugins as any).tooltip.callbacks
      .footer;

    const label = tooltipLabel({
      raw: 100,
      dataset: result.charData.datasets[0],
      datasetIndex: 0,
      dataIndex: 0,
      chart: { data: result.charData },
      label: '2024-01-01',
    });

    const footer = tooltipFooter([
      { parsed: { y: 100 }, dataset: { borderDash: [] } },
      { parsed: { y: 50 }, dataset: { borderDash: [] } },
    ]);

    expect(label).toContain('Revenue');
    expect(footer).toContain('Total');
  });

  it('should calculate difference tooltip when sum is false', () => {
    const chart: any = {
      type: 'line',
      labels: ['2024-01-01'],
      colors: 'COLORS',
      options: 'LINE_CHART',
      sum: false,
      dataSet: [
        { label: 'Prev', data: [50] },
        { label: 'Current', data: [80] },
      ],
    };

    const result = createChart(chart, undefined, false, 'en-US');

    const tooltipLabel = (result.options.plugins as any).tooltip.callbacks
      .label;

    const label = tooltipLabel({
      raw: 80,
      parsed: { y: 80 },
      dataset: result.charData.datasets[1],
      datasetIndex: 1,
      dataIndex: 0,
      chart: { data: result.charData },
    });

    expect(label).toContain('30');
  });

  it('should create radar chart options (dark mode)', () => {
    const chart: any = {
      type: 'radar',
      colors: 'COLORS',
      options: 'RADAR_CHART',
    };

    const result = createChart(chart, undefined, true);

    expect(result.options.scales?.r?.ticks?.color).toBe('white');
  });

  it('should create pie chart percentage tooltip', () => {
    const chart: any = {
      type: 'pie',
      colors: 'COLORS_ARRAY',
      options: 'PERCENTAGE_CHART',
      dataSet: [
        {
          data: [20, 30],
        },
      ],
      labels: ['A', 'B'],
    };

    const result = createChart(chart);

    const tooltipLabel = (result.options.plugins as any).tooltip.callbacks
      .label;

    const label = tooltipLabel({
      label: 'A',
      raw: 20,
      dataset: { data: [20, 30] },
    });

    expect(label).toBe('A: 40.00%');
  });

  it('should format time values in TIME_CHART', () => {
    const chart: any = {
      type: 'bar',
      colors: 'COLORS',
      options: 'TIME_CHART',
      dataSet: [
        {
          label: 'Work',
          data: [3600],
        },
      ],
    };

    const result = createChart(chart, undefined, false);

    const tooltipLabel = (result.options.plugins as any).tooltip.callbacks
      .label;

    const label = tooltipLabel({
      dataset: { label: 'Work' },
      parsed: { y: 3600 },
    });

    expect(label).toBe(`Work: ${secondsToHHMM(3600)}`);
  });

  it('should create NO_LABEL bar chart with hidden ticks', () => {
    const chart: any = {
      type: 'bar',
      colors: 'COLORS',
      options: 'NO_LABEL',
    };

    const result = createChart(chart);

    const tickLabel = (result.options.scales as any).x.ticks.callback();

    expect(tickLabel).toBe('');
  });
});
