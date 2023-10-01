import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPreviewComponent } from './payment-preview.component';

describe('PaymentPreviewComponent', () => {
  let component: PaymentPreviewComponent;
  let fixture: ComponentFixture<PaymentPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
