import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerReservationsChartComponent } from './customer-reservations-chart.component';

describe('ClientReservationsChartComponent', () => {
  let component: CustomerReservationsChartComponent;
  let fixture: ComponentFixture<CustomerReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
