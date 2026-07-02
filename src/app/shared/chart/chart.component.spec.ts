import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { IChart } from '../../dashboard/dashboard';
import { ICurrency } from '../../currency/currency';
import { createChart } from '../../util/chart';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {

    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ChartComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update chart when chartSummary input changes', () => {
    const currency: ICurrency = { code: 'EUR', icon: 'EUR' };
    const timeZone = 'Europe/Amsterdam';

    const firstSummary: IChart = {
      title: 'First chart',
      type: 'bar',
      labels: ['Jan', 'Feb'],
      options: 'CHART',
      colors: 'COLORS',
      dataSet: [
        { label: 'Revenue', data: [10, 20], type: 'bar' },
      ],
    };

    fixture.componentRef.setInput('error', undefined);
    fixture.componentRef.setInput('currency', currency);
    fixture.componentRef.setInput('locale', DEFAULT_LOCALE);
    fixture.componentRef.setInput('timeZone', timeZone);
    fixture.componentRef.setInput('chartSummary', firstSummary);
    fixture.detectChanges();

    expect(component.chart()).toEqual(
      createChart(firstSummary, currency, false, DEFAULT_LOCALE, timeZone),
    );

    const secondSummary: IChart = {
      ...firstSummary,
      title: 'Second chart',
      labels: ['Mar', 'Apr', 'May'],
      dataSet: [
        { label: 'Revenue', data: [5, 15, 25], type: 'bar' },
      ],
    };

    fixture.componentRef.setInput('chartSummary', secondSummary);
    fixture.detectChanges();

    expect(component.chart()).toEqual(
      createChart(secondSummary, currency, false, DEFAULT_LOCALE, timeZone),
    );
  });
});
