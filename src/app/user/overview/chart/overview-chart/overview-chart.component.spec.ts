import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewChartComponent } from './overview-chart.component';
import { IChart } from '../../../../interfaces/dashboard';
import { ICurrency } from '../../../../interfaces/currency';

describe('OverviewChartComponent (with real createChart)', () => {
  let component: OverviewChartComponent;
  let fixture: ComponentFixture<OverviewChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a chart object when chartSummary is provided', () => {
    // Minimal working chart config for createChart()
    const chartSummary: IChart = {
      type: 'bar',
      colors: 'COLORS',
      options: 'BAR_CHART',
      labels: ['Jan', 'Feb'],
      sum: 100,
      dataSet: [
        {
          label: 'Sales',
          data: [10, 20],
          type: 'bar',
        },
      ],
    } as any;

    const currency: ICurrency = { code: 'EUR', symbol: '€' } as any;

    component.chartSummary = chartSummary;
    component.currency = currency;
    component.isDark = false;

    component.ngOnChanges({
      chartSummary: {
        currentValue: chartSummary,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    // ✅ Verify chart was created
    expect(component.chart).toBeDefined();
    expect(component.chart?.type).toBe('bar');
    expect(component.chart?.labels).toEqual(['Jan', 'Feb']);
    expect(component.chart?.charData?.datasets?.length).toBe(1);
  });

  it('should not create chart when chartSummary is undefined', () => {
    component.chartSummary = undefined;

    component.ngOnChanges({});

    expect(component.chart).toBeUndefined();
  });
});
