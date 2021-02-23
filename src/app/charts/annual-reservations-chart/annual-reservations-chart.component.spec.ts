import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualReservationsChartComponent } from './annual-reservations-chart.component';

describe('AnnualReservationsChartComponent', () => {
  let component: AnnualReservationsChartComponent;
  let fixture: ComponentFixture<AnnualReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnualReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
