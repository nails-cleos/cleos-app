import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChartUtil } from '../../util/chart';
import { By } from '@angular/platform-browser';
import { CardChartComponent } from './card-chart.component';
import { Chart, registerables } from 'chart.js';
import { signal } from '@angular/core';
import { AuthUserService, initialAuthUser } from '../../services/auth-user.service';

Chart.register(...registerables);
describe('CardChartComponent', () => {
  let component: CardChartComponent;
  let fixture: ComponentFixture<CardChartComponent>;

  const fakeChart: IChartUtil = {
    type: 'bar',
    charData: {
      datasets: [
        { data: [10, 20], label: 'Series A' },
        { data: [5, 15], label: 'Series B' },
      ],
    },
    labels: ['Jan', 'Feb'],
    options: { responsive: true },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardChartComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { chart: fakeChart, title: 'Test Chart' },
        },
        {
          provide: AuthUserService,
          useValue: { authUser: signal(initialAuthUser).asReadonly() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dialog data correctly', () => {
    expect(component.data.title).toBe('Test Chart');
    expect(component.data.chart.type).toBe('bar');
    expect(component.data.chart.labels).toEqual(['Jan', 'Feb']);
    expect(component.data.chart.charData.datasets.length).toBe(2);
  });

  it('should render the dialog title in the template', () => {
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleEl.textContent).toContain('Test Chart');
  });

  it('should render the close button', () => {
    fixture.detectChanges();
    const buttonEl = fixture.debugElement.query(By.css('.close-button'));
    expect(buttonEl).toBeTruthy();
  });

  it('should have datasets available in injected chart data', () => {
    expect(component.data.chart.charData.datasets.length).toBe(2);
    expect(component.data.chart.charData.datasets[0].label).toBe('Series A');
  });
});
