import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MePaymentComponent } from './me-payment.component';

describe('MePaymentComponent', () => {
  let component: MePaymentComponent;
  let fixture: ComponentFixture<MePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MePaymentComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
