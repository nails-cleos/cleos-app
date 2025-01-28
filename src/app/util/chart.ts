import { ChartConfiguration, ChartOptions, ChartType, TooltipItem } from 'chart.js';
import { IChart } from '../interfaces/dashboard';
import { ICurrency } from '../interfaces/currency';
import { numberFormat } from './numbers';
import { newDateTimestamp, getNowTimeZone } from "./dates";

export interface IChartUtil {
  labels: any[];
  charData: ChartConfiguration['data'];
  type: ChartType;
  options: ChartOptions;
}

export const createChart = (chart: IChart, currency?: ICurrency, isDark?: boolean, locale?: string,
                            timeZone?: string): IChartUtil => {
  let colors: any[];
  switch (chart.colors) {
    case 'COLORS_ARRAY':
      colors = chartArrayColors();
      break;
    case 'COLORS':
    default:
      colors = chartColors();
  }
  let options: ChartOptions<any>;
  switch (chart.options) {
    case 'NO_LABEL':
      options = barChartNoLabelOptions(isDark);
      break;
    case 'BAR_CHART':
      options = barChartDefaultOptions(chart.sum, isDark, locale, timeZone);
      break;
    case 'LINE_CHART_CURRENCY':
      options = lineChartDefaultOptions(chart.sum, isDark, locale, timeZone, currency, chart.footer);
      break;
    case 'LINE_CHART':
      options = lineChartDefaultOptions(chart.sum, isDark, locale, timeZone);
      break;
    case 'RADAR_CHART':
      options = radarChartDefaultOptions(isDark);
      break;
    case 'PERCENTAGE_CHART':
      options = pieChartPercentageOptions();
      break;
    case 'TIME_CHART':
      options = barChartTimeOptions(isDark, timeZone);
      break;
    case 'CHART':
    default:
      options = defaultOptions();
  }

  let dataSet: any[] = [];
  if (chart.dataSet && chart.dataSet.length) {
    chart.dataSet.forEach((value, i) => {
      const color = colors[i % 10];
      dataSet = [...dataSet, {
        data: value.data,
        label: value.label,
        type: value.type,
        pointRadius: value.pointRadius || 3,
        pointHoverRadius: (value.pointRadius || 3) + 1,
        backgroundColor: color.backgroundColor,
        hoverBackgroundColor: color.hoverBackgroundColor,
        borderDash: value.borderDash,
        borderColor: color.borderColor,
        hoverBorderColor: color.hoverBorderColor,
        pointBackgroundColor: color.pointBackgroundColor,
        pointBorderColor: color.pointBorderColor,
        pointHoverBackgroundColor: color.pointHoverBackgroundColor,
        pointHoverBorderColor: color.pointHoverBorderColor,
        tension: 0.5,
        fill: false
      }];
    });
  }

  const charData: ChartConfiguration['data'] = {
    labels: chart.labels || [],
    datasets: dataSet
  };

  return {
    labels: chart.labels || [],
    type: chart.type || 'bar',
    charData,
    options
  };
};

const defaultOptions = (): ChartOptions => ({
  responsive: true
});

const radarChartDefaultOptions = (isDark?: boolean): ChartOptions<'radar'> => {
  let options: ChartOptions<'radar'>;
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        r: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          angleLines: {
            display: true,
            color: 'white'
          },
          suggestedMin: 0,
          pointLabels: {
            color: 'white'
          },
          ticks: {
            // stepSize: 1,
            display: true,
            color: 'white',
            backdropColor: '#424242'
          }
        }
      }
    };
  } else {
    options = {
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true,
            color: 'black'
          },
          suggestedMin: 0,
          ticks: {
            stepSize: 1,
            display: true
          }
        }
      }
    };
  }
  return options;
};

const barChartDefaultOptions = (sum?: boolean, isDark?: boolean, locale?: string, timeZone?: string,
                                currency?: ICurrency): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          ticks: {
            color: 'white',
            callback: (value) => numberFormat(value, currency, locale)
          },
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true,
          stacked: true
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          stacked: true
        }
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => label(tooltipItem, currency, sum, locale, timeZone),
            footer: (tooltipItems: any) => footer(tooltipItems, currency, sum, locale),
          }
        }
      }
    };
  } else {
    options = {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => numberFormat(value, currency, locale)
          },
          beginAtZero: true,
          stacked: true
        },
        x: {
          stacked: true
        }
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => label(tooltipItem, currency, sum, locale, timeZone),
            footer: (tooltipItems: any) => footer(tooltipItems, currency, sum, locale),
          }
        }
      }
    };
  }
  return options;
};

const lineChartDefaultOptions = (
  sum?: boolean,
  isDark?: boolean,
  locale?: string,
  timeZone?: string,
  currency?: ICurrency,
  footerTitle?: string
): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          ticks: {
            color: 'white',
            callback: (value) => numberFormat(value, currency, locale)
          },
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => label(tooltipItem, currency, sum, locale, timeZone),
            footer: (tooltipItems: any) => footer(tooltipItems, currency, sum, locale, footerTitle)
          }
        }
      }
    };
  } else {
    options = {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => numberFormat(value, currency, locale)
          },
          beginAtZero: true,
        }
      },
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => label(tooltipItem, currency, sum, locale, timeZone),
            footer: (tooltipItems) => footer(tooltipItems, currency, sum, locale, footerTitle)
          }
        }
      }
    };
  }
  return options;
};

const footer = (tooltipItems: any, currency?: ICurrency, sum?: boolean, locale?: string, title?: string) => {
  const total = sum ? tooltipItems.reduce((a: number, b: any) => a + (b.dataset.borderDash ? 0 : b.parsed.y), 0) :
    tooltipItems[tooltipItems.length - 1].formattedValue;
  return tooltipItems.length > 1 ? createTooltip(title || 'Total', total, currency, locale) : '';
};

const label = (tooltipItem: any, currency?: ICurrency, sum?: boolean, locale?: string, timeZone?: string) => {
  if (!sum && tooltipItem.datasetIndex) {
    const previous = Number(tooltipItem.chart.data.datasets[tooltipItem.datasetIndex - 1].data[tooltipItem.dataIndex]);

    return createTooltip(tooltipItem.dataset.label, Number(tooltipItem.raw) - previous, currency, locale);
  }

  const addTooltip = !tooltipItem.dataset.borderDash || tooltipItem.dataset.borderDash &&
    (newDateTimestamp(tooltipItem.label, timeZone) > getNowTimeZone(timeZone));

  return addTooltip ? createTooltip(tooltipItem.dataset.label, tooltipItem.raw, currency, locale) : '';
};

const createTooltip = (title: string, value: string | number, currency?: ICurrency, locale?: string) =>
  `${ title } ${ numberFormat(value, currency, locale) }`;

const barChartNoLabelOptions = (isDark?: boolean): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true
        },
        x: {
          ticks: {
            color: 'white',
            callback: () => ''
          },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: externalTooltipHandler
        }
      }
    };
  } else {
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          ticks: {
            callback: () => ''
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: externalTooltipHandler
        }
      }
    };
  }

  return options;
};

const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = 'auto';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: any) => b.lines);

    const tableHead = document.createElement('thead');

    const ul = document.createElement('ul');
    ul.style.columns = titleLines.length <= 10 ? '1' : '4';
    titleLines.forEach((title: any) => {
      ul.style.borderWidth = '0';

      const li = document.createElement('li');
      li.style.borderWidth = '0';
      const text = document.createTextNode(title);

      li.appendChild(text);
      ul.appendChild(li);
      tableHead.appendChild(ul);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body: any, i: any) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';

      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = '0';

      const td = document.createElement('td');
      td.style.borderWidth = '0';

      const text = document.createTextNode(body);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

const barChartTimeOptions = (isDark?: boolean, timeZone?: string): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true,
          ticks: {
            callback: (v: any) => formatSecsAsHourMin(v, timeZone),
            stepSize: 1800,
            color: 'white'
          }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem: any) => barChatTimeLabel(tooltipItem, timeZone)
          }
        }
      }
    };
  } else {
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v: any) => formatSecsAsHourMin(v, timeZone),
            stepSize: 1800
          }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem: any) => barChatTimeLabel(tooltipItem, timeZone)
          }
        }
      }
    };
  }

  return options;
};

const pieChartPercentageOptions = (): ChartOptions<'pie'> => ({
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => pieChatPercentageLabel(tooltipItem)
      }
    }
  }
});

const pieChatPercentageLabel = (tooltipItem: TooltipItem<'pie'>): string => {
  const total = tooltipItem.dataset.data.reduce((a, b) => Number(a) + Number(b));
  return `${ tooltipItem.label }: ${ (Number(tooltipItem.raw) * 100 / total).toFixed(2) }%`;
};

const formatSecsAsHourMin = (d: any, timeZone?: string): string => newDateTimestamp(d, timeZone).toISOString()
  .substring(11, 16);

const barChatTimeLabel = (tooltipItem: any, timeZone?: string): string => {
  let label = tooltipItem.dataset.label || '';
  if (label) {
    label += ': ';
  }
  if (tooltipItem.parsed.y !== null) {
    label += formatSecsAsHourMin(tooltipItem.parsed.y, timeZone);
  }
  return label;
};

const chartArrayColors = (): any[] => ([{
  hoverBackgroundColor: ['rgba(254, 205, 190, 0.6)', 'rgba(152, 109, 142, 0.6)', 'rgba(95, 147, 154, 0.6)',
    'rgba(161, 202, 226, 0.6)', 'rgba(242, 213, 239, 0.6)', 'rgba(203, 239, 227, 0.6)', 'rgba(194, 213, 167, 0.6)',
    'rgba(176, 171, 202, 0.6)', 'rgba(226, 169, 190, 0.6)', 'rgba(163, 214, 212, 0.6)'],
  borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
  backgroundColor: ['rgba(254, 205, 190, 0.8)', 'rgba(152, 109, 142, 0.8)', 'rgba(95, 147, 154, 0.8)',
    'rgba(161, 202, 226, 0.8)', 'rgba(242, 213, 239, 0.8)', 'rgba(203, 239, 227, 0.8)', 'rgba(194, 213, 167, 0.8)',
    'rgba(176, 171, 202, 0.8)', 'rgba(226, 169, 190, 0.8)', 'rgba(163, 214, 212, 0.8)'],
  hoverBorderColor: ['rgb(254, 205, 190)', 'rgb(152, 109, 142)', 'rgb(95, 147, 154)',
    'rgb(161, 202, 226)', 'rgb(242, 213, 239)', 'rgb(203, 239, 227)', 'rgb(194, 213, 167)',
    'rgb(176, 171, 202)', 'rgb(226, 169, 190)', 'rgb(163, 214, 212)']
},
  {
    hoverBackgroundColor: ['rgba(254, 205, 190, 0.2)', 'rgba(152, 109, 142, 0.2)', 'rgba(95, 147, 154, 0.2)',
      'rgba(161, 202, 226, 0.2)', 'rgba(242, 213, 239, 0.2)', 'rgba(203, 239, 227, 0.2)', 'rgba(194, 213, 167, 0.2)',
      'rgba(176, 171, 202, 0.2)', 'rgba(226, 169, 190, 0.2)', 'rgba(163, 214, 212, 0.2)'],
    borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    backgroundColor: ['rgba(254, 205, 190, 0.4)', 'rgba(152, 109, 142, 0.4)', 'rgba(95, 147, 154, 0.4)',
      'rgba(161, 202, 226, 0.4)', 'rgba(242, 213, 239, 0.4)', 'rgba(203, 239, 227, 0.4)', 'rgba(194, 213, 167, 0.4)',
      'rgba(176, 171, 202, 0.4)', 'rgba(226, 169, 190, 0.4)', 'rgba(163, 214, 212, 0.4)'],
    hoverBorderColor: ['rgba(254, 205, 190, 0.6)', 'rgba(152, 109, 142, 0.6)', 'rgba(95, 147, 154, 0.6)',
      'rgba(161, 202, 226, 0.6)', 'rgba(242, 213, 239, 0.6)', 'rgba(203, 239, 227, 0.6)', 'rgba(194, 213, 167, 0.6)',
      'rgba(176, 171, 202, 0.6)', 'rgba(226, 169, 190, 0.6)', 'rgba(163, 214, 212, 0.6)']
  }]);

const chartColors = (): any[] => ([{
  backgroundColor: 'rgba(254, 205, 190, 0.6)',
  borderColor: 'rgba(254, 205, 190, 1)',
  pointBackgroundColor: 'rgba(254, 205, 190, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(254, 205, 190, 0.8)',
  hoverBackgroundColor: 'rgba(254, 205, 190, 0.8)',
  hoverBorderColor: 'rgba(254, 205, 190, 1)'
}, {
  backgroundColor: 'rgba(152, 109, 142, 0.6)',
  borderColor: 'rgba(152, 109, 142, 1)',
  pointBackgroundColor: 'rgba(152, 109, 142, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(152, 109, 142, 0.8)',
  hoverBackgroundColor: 'rgba(152, 109, 142, 0.8)',
  hoverBorderColor: 'rgba(152, 109, 142, 1)'
}, {
  backgroundColor: 'rgba(95, 147, 154, 0.6)',
  borderColor: 'rgba(95, 147, 154, 1)',
  pointBackgroundColor: 'rgba(95, 147, 154, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(95, 147, 154, 0.8)',
  hoverBackgroundColor: 'rgba(95, 147, 154, 0.8)',
  hoverBorderColor: 'rgba(95, 147, 154, 1)'
}, {
  backgroundColor: 'rgba(161, 202, 226, 0.6)',
  borderColor: 'rgba(161, 202, 226, 1)',
  pointBackgroundColor: 'rgba(161, 202, 226, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(161, 202, 226, 0.8)',
  hoverBackgroundColor: 'rgba(161, 202, 226, 0.8)',
  hoverBorderColor: 'rgba(161, 202, 226, 1)'
}]);
