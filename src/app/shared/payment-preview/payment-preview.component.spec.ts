import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentPreviewComponent } from './payment-preview.component';
import { SharedModule } from '../shared.module';
import { By } from '@angular/platform-browser';
import { IPaymentOption, PaymentType } from '../../interfaces/payment';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconRegistry } from '@angular/material/icon';
import { matIconRegistryStub } from '../../util/app-material-registry-stub';

describe('PaymentPreviewComponent', () => {
  let component: PaymentPreviewComponent;
  let fixture: ComponentFixture<PaymentPreviewComponent>;

  const mockType: IPaymentOption = {
    name: 'Credit Card',
    svgIcon: 'credit_card',
    type: PaymentType.ideal,
    icon: 'credit_card',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPreviewComponent, SharedModule, TranslateModule.forRoot()],
      providers: [{ provide: MatIconRegistry, useValue: matIconRegistryStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render type info when type is provided', () => {
    fixture.componentRef.setInput('type', mockType);
    fixture.detectChanges();

    const typeName = fixture.debugElement.query(By.css('[matListItemLine]')).nativeElement;
    expect(typeName.textContent).toContain('Credit Card');
  });

  it('should render total when toPaid is provided', () => {
    fixture.componentRef.setInput('type', mockType);
    fixture.componentRef.setInput('toPaid', 100);
    fixture.componentRef.setInput('currencyIcon', 'euro');
    fixture.detectChanges();

    const totalEl = fixture.debugElement.queryAll(By.css('span.bold'))
      .find(el => el.nativeElement.textContent.includes('100'))?.nativeElement;

    expect(totalEl).toBeTruthy();
    expect(totalEl.textContent).toContain('100');
  });

  it('should prefer penalty if toPaid is not defined', () => {
    fixture.componentRef.setInput('type', mockType);
    fixture.componentRef.setInput('penalty', 50);
    fixture.componentRef.setInput('currencyIcon', 'euro');
    fixture.detectChanges();

    const boldSpans = fixture.debugElement.queryAll(By.css('span.bold'));
    const totalSpan = boldSpans[1];
    expect(totalSpan.nativeElement.textContent).toContain('50');
  });
});
