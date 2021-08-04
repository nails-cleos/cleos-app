import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityProductReservationsChartComponent } from './quantity-product-reservations-chart.component';

describe('QuantityProductReservationsChartComponent', () => {
  let component: QuantityProductReservationsChartComponent;
  let fixture: ComponentFixture<QuantityProductReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantityProductReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuantityProductReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
