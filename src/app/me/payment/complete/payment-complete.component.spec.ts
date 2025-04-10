import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCompleteComponent } from './payment-complete.component';

describe('PaymentComponent', () => {
  let component: PaymentCompleteComponent;
  let fixture: ComponentFixture<PaymentCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCompleteComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
