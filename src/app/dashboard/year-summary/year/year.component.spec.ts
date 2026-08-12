import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearComponent } from './year.component';
import { IQuarterSummary } from '../../dashboard';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('YearComponent', () => {
  let component: YearComponent;
  let fixture: ComponentFixture<YearComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };

    await TestBed.configureTestingModule({
      imports: [YearComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('year', 2025);
    fixture.componentRef.setInput('measure', 'long');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the input values', () => {
    expect(component.year()).toBe(2025);
    expect(component.measure()).toBe('long');
  });

  it('should build quarter rows from summaries', () => {
    const quarterSummaries: IQuarterSummary[] = [
      {
        quarter: 2,
        monthSummaries: [
          {
            month: 5,
            total: [],
            totalGross: 0,
            totalNet: 0,
            totalBTW: 0,
            totalWithoutGross: 0,
            totalWithoutNet: 0,
            totalWithoutBTW: 0,
          },
        ],
      },
    ];

    fixture.componentRef.setInput('quarterSummaries', quarterSummaries);
    fixture.detectChanges();

    expect(component.quarterRows()[0].quarter).toBe(2);
    expect(component.quarterRows()[0].months[0].month).toBe(5);
    expect(component.quarterRows()[0].months[0].label).toBeTruthy();
  });

  it('should navigate to quarter summary', () => {
    component.goToQuarter(3);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'quarter', 'summary'],
      {
        state: { year: 2025, quarter: 3 },
      },
    );
  });

  it('should navigate to month summary', () => {
    component.goToMonth(11);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'monthly', 'summary'],
      {
        state: { date: '11-2025' },
      },
    );
  });
});
