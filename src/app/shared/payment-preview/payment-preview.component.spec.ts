import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentPreviewComponent } from './payment-preview.component';
import { SharedModule } from '../shared.module';
import { By } from '@angular/platform-browser';
import { IPaymentOption, PaymentType } from '../../interfaces/payment';
import { TranslateModule } from '@ngx-translate/core';

describe('PaymentPreviewComponent', () => {
  let component: PaymentPreviewComponent;
  let fixture: ComponentFixture<PaymentPreviewComponent>;

  const mockType: IPaymentOption = {
    name: 'Credit Card',
    subTypes: [],
    svgIcon: 'credit_card',
    type: PaymentType.ideal,
    icon: 'credit_card',
  };

  const mockBank: IPaymentOption = {
    name: 'Bank X',
    subTypes: [],
    svgIcon: 'bank',
    type: PaymentType.transfer,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPreviewComponent, SharedModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render type info when type is provided', () => {
    component.type = mockType;
    fixture.detectChanges();

    const typeName = fixture.debugElement.query(By.css('[matListItemLine]')).nativeElement;
    expect(typeName.textContent).toContain('Credit Card');
  });

  it('should render bank info when type.subTypes and bank are provided', () => {
    component.type = { ...mockType, subTypes: [mockBank] };
    component.bank = mockBank;
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems[1].nativeElement.textContent).toContain('Bank X');
  });

  it('should render total when toPaid is provided', () => {
    component.type = { ...mockType, subTypes: [] };
    component.toPaid = 100;
    component.currencyIcon = 'euro';
    fixture.detectChanges();

    const totalEl = fixture.debugElement.queryAll(By.css('span.bold'))
      .find(el => el.nativeElement.textContent.includes('100'))?.nativeElement;

    expect(totalEl).toBeTruthy();
    expect(totalEl.textContent).toContain('100');
  });

  it('should prefer penalty if toPaid is not defined', () => {
    component.type = { ...mockType, subTypes: [] };
    component.penalty = 50;
    component.currencyIcon = 'euro';
    fixture.detectChanges();

    const boldSpans = fixture.debugElement.queryAll(By.css('span.bold'));
    const totalSpan = boldSpans[1];
    expect(totalSpan.nativeElement.textContent).toContain('50');
  });
});
