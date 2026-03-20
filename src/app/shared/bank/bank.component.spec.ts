import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankComponent, BankForm } from './bank.component';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { IPaymentOption, PaymentPercentage, PaymentType } from '../../interfaces/payment';
import { requireMatch } from '../../util/validators';
import { TranslateModule } from '@ngx-translate/core';

describe('BankComponent', () => {
  let component: BankComponent;
  let fixture: ComponentFixture<BankComponent>;

  const bankA: IPaymentOption = { subTypes: [], svgIcon: '', type: PaymentType.ideal, name: 'ING' };
  const bankB: IPaymentOption = { subTypes: [], svgIcon: '', type: PaymentType.ideal, name: 'ABN' };

  const paymentTypeWithBanks: IPaymentOption = {
    svgIcon: '',
    type: PaymentType.ideal,
    name: 'Card',
    subTypes: [bankA, bankB],
    hidePercentage: false,
  };

  const paymentTypeWithoutBanks: IPaymentOption = {
    subTypes: [],
    svgIcon: '',
    type: PaymentType.ideal,
    name: 'Cash',
    hidePercentage: true,
  };

  let form: FormGroup<BankForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BankComponent);
    component = fixture.componentInstance;

    const formBuilder = TestBed.inject(NonNullableFormBuilder);

    form = formBuilder.group<BankForm>({
      type: formBuilder.control(undefined),
      bank: formBuilder.control(undefined),
      percentage: formBuilder.control(PaymentPercentage.total),
    });

    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('options', [paymentTypeWithBanks, paymentTypeWithoutBanks]);
    fixture.componentRef.setInput('firstTime', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate bankList and set validators when type has subTypes', () => {
    form.controls.type.setValue(paymentTypeWithBanks);
    fixture.detectChanges();

    expect(component.bankList.length).toBe(2);
    expect(form.controls.bank.hasValidator(Validators.required)).toBeTrue();
    expect(form.controls.bank.hasValidator(requireMatch)).toBeTrue();
  });

  it('should clear bankList and validators when type has no subTypes', () => {
    form.controls.type.setValue(paymentTypeWithoutBanks);

    expect(component.bankList.length).toBe(0);
    expect(form.controls.bank.validator).toBeNull();
  });

  it('should hide percentage when type.hidePercentage is true', () => {
    form.controls.type.setValue(paymentTypeWithoutBanks);

    expect(form.controls.percentage.validator).toBeNull();
  });

  it('should require percentage when hidePercentage is false', () => {
    form.controls.type.setValue(paymentTypeWithBanks);
    fixture.detectChanges();

    expect(form.controls.percentage.hasValidator(Validators.required)).toBeTrue();
  });

  it('should reset bank value on backspace', () => {
    form.controls.bank.setValue(bankA);

    component.keyDownHandler(new KeyboardEvent('keydown', { code: 'Backspace' }));

    expect(form.controls.bank.value).toBeUndefined();
  });

  it('should emit correct percentage when percentage changes', () => {
    spyOn(component.percentageEmitter, 'emit');

    form.controls.percentage.setValue(PaymentPercentage.deposit_50);
    fixture.detectChanges();
    expect(component.percentageEmitter.emit).toHaveBeenCalledWith(50);

    form.controls.percentage.setValue(PaymentPercentage.total);
    fixture.detectChanges();
    expect(component.percentageEmitter.emit).toHaveBeenCalledWith(100);
  });

  it('should set default percentage and validators when firstTime is true', () => {
    fixture.componentRef.setInput('firstTime', true);
    fixture.detectChanges();

    expect(form.controls.percentage.value).toBe(PaymentPercentage.total);
    expect(form.controls.type.hasValidator(Validators.required)).toBeTrue();
  });

  it('should auto-select type if firstTime and only one option', () => {
    fixture.componentRef.setInput('options', [paymentTypeWithBanks]);
    fixture.componentRef.setInput('firstTime', true);

    fixture.detectChanges();

    expect(form.controls.type.value).toEqual(paymentTypeWithBanks);
  });
});
