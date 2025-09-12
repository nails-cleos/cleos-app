import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthComponent } from './month.component';
import { TranslateModule } from '@ngx-translate/core';
import { IMonthSummary, ISummaryTotal } from '../../../interfaces/dashboard';
import { Router } from '@angular/router';

describe('MonthComponent', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;

  const monthSummary = {
    month: 1,
    total: [
      { type: 'INCOME', gross: 60, net: 50, btw: 10 } as ISummaryTotal,
      { type: 'EXPENSE', gross: 61, net: 50, btw: 11 } as ISummaryTotal,
      { type: 'CASH', gross: 1, net: 0, btw: 1 } as ISummaryTotal,
    ],
    totalGross: 121,
    totalNet: 100,
    totalBTW: 21,
    totalWithoutGross: 100,
    totalWithoutNet: 100,
    totalWithoutBTW: 100,
  } as IMonthSummary;

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
    component.month = monthSummary;
    component.year = 2025;
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    component.ngAfterViewInit();
    fixture.detectChanges();
  });
});
