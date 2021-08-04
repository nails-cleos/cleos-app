import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyReservationsChartComponent } from './monthly-reservations-chart.component';

describe('MonthlyReservationsChartComponent', () => {
  let component: MonthlyReservationsChartComponent;
  let fixture: ComponentFixture<MonthlyReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
