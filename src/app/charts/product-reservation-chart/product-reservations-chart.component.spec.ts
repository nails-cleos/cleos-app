import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReservationsChartComponent } from './product-reservations-chart.component';

describe('ProductReservationsChartComponent', () => {
  let component: ProductReservationsChartComponent;
  let fixture: ComponentFixture<ProductReservationsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductReservationsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReservationsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
