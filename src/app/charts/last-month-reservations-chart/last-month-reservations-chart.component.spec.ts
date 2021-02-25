import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastMonthReservationsChartComponent } from './last-month-reservations-chart.component';

describe('LastMonthReservationsChartComponent', () => {
  let component: LastMonthReservationsChartComponent;
  let fixture: ComponentFixture<LastMonthReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastMonthReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastMonthReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
