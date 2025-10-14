import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterComponent } from './quarter.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

describe('QuarterComponent', () => {
  let component: QuarterComponent;
  let fixture: ComponentFixture<QuarterComponent>;
  let routerMock: any;

  beforeEach(async () => {
    routerMock = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [QuarterComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(QuarterComponent);
    component = fixture.componentInstance;
    component.year = 2025;
    component.measure = 'long';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return month title', () => {
    const monthName = component.getMonth(1); // enero
    expect(monthName).toBeDefined();
  });

  it('should navigate to quarter', () => {
    component.quarter = 2;
    component.goToQuarter(2);
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['en-GB', 'dashboard', 'quarter', 'summary'],
      { state: { year: 2025, quarter: 2 } },
    );
  });

  it('should navigate to month with correct step for income', () => {
    component.goToMonth(1, 'INCOME');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['en-GB', 'dashboard', 'monthly', 'summary'],
      { state: { date: '1-2025', step: 0 } },
    );
  });

  it('should navigate to month with correct step for expense', () => {
    component.goToMonth(3, 'EXPENSE');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['en-GB', 'dashboard', 'monthly', 'summary'],
      { state: { date: '3-2025', step: 1 } },
    );
  });

  it('should navigate to month with correct step for cash', () => {
    component.goToMonth(4, 'CASH');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['en-GB', 'dashboard', 'monthly', 'summary'],
      { state: { date: '4-2025', step: 2 } },
    );
  });
});
