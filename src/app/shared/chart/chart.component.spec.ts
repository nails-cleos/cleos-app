import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { NavigationService } from '@app/services/navigation.service';
import { signal } from '@angular/core';
import { IChart } from '@app/dashboard/dashboard';
import { ICurrency } from '@app/currency/currency';
import { createChart } from '@app/util/chart';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;
  let navigationServiceSpy: Pick<NavigationService, 'reload'> & {
    reload: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      reload: vi.fn().mockName('NavigationService.reload'),
    };
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [ChartComponent],
      providers: [
        provideTranslateService(),
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
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
      dataSet: [{ label: 'Revenue', data: [10, 20], type: 'bar' }],
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
      dataSet: [{ label: 'Revenue', data: [5, 15, 25], type: 'bar' }],
    };

    fixture.componentRef.setInput('chartSummary', secondSummary);
    fixture.detectChanges();

    expect(component.chart()).toEqual(
      createChart(secondSummary, currency, false, DEFAULT_LOCALE, timeZone),
    );
  });
});
