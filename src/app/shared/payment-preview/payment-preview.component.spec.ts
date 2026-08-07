import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentPreviewComponent } from './payment-preview.component';
import { By } from '@angular/platform-browser';
import { IPaymentOption } from '@app/interfaces/payment';
import { MatIconRegistry } from '@angular/material/icon';
import { matIconRegistryStub } from '@app/util/app-material-registry-stub';
import { provideTranslateService } from '@ngx-translate/core';

describe('PaymentPreviewComponent', () => {
  let component: PaymentPreviewComponent;
  let fixture: ComponentFixture<PaymentPreviewComponent>;

  const mockType: IPaymentOption = {
    label: 'Credit Card',
    type: 'IDEAL',
    enabled: true,
    enabledCustomer: true,
    default: false,
    filter: true,
    defaultFilter: false,
    show: true,
    icon: 'credit_card',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPreviewComponent],
      providers: [
        provideTranslateService(),
        { provide: MatIconRegistry, useValue: matIconRegistryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render type info when type is provided', () => {
    fixture.componentRef.setInput('option', mockType);
    fixture.detectChanges();

    const typeName = fixture.debugElement.query(By.css('[matListItemLine]')).nativeElement;
    expect(typeName.textContent).toContain('Credit Card');
  });

  it('should render total when toPaid is provided', () => {
    fixture.componentRef.setInput('option', mockType);
    fixture.componentRef.setInput('toPaid', 100);
    fixture.componentRef.setInput('currencyIcon', 'euro');
    fixture.detectChanges();

    const totalEl = fixture.debugElement.queryAll(By.css('span.bold'))
      .find(el => el.nativeElement.textContent.includes('100'))?.nativeElement;

    expect(totalEl).toBeTruthy();
    expect(totalEl.textContent).toContain('100');
  });

  it('should prefer penalty if toPaid is not defined', () => {
    fixture.componentRef.setInput('option', mockType);
    fixture.componentRef.setInput('penalty', 50);
    fixture.componentRef.setInput('currencyIcon', 'euro');
    fixture.detectChanges();

    const boldSpans = fixture.debugElement.queryAll(By.css('span.bold'));
    const totalSpan = boldSpans[1];
    expect(totalSpan.nativeElement.textContent).toContain('50');
  });
});
