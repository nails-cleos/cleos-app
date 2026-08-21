import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldAdderComponent } from './form-field-adder.component';
import { IPaymentOption } from '@app/interfaces/payment';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('FormFieldAdderComponent', () => {
  let component: FormFieldAdderComponent;
  let fixture: ComponentFixture<FormFieldAdderComponent>;
  const paymentOptions: IPaymentOption[] = [
    {
      label: 'Cash',
      type: 'CASH',
      icon: 'universal_currency',
      enabled: true,
      enabledCustomer: false,
      default: false,
      filter: true,
      defaultFilter: false,
      show: true,
    },
    {
      label: 'Transfer',
      type: 'TRANSFER',
      icon: 'send_money',
      enabled: true,
      enabledCustomer: false,
      default: false,
      filter: true,
      defaultFilter: false,
      show: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldAdderComponent],
      providers: [provideTranslateService()],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldAdderComponent);
    component = fixture.componentInstance;

    // Provide required inputs
    fixture.componentRef.setInput('allPaymentOptions', paymentOptions);
    fixture.componentRef.setInput('key', 'test');
    fixture.componentRef.setInput('currency', { code: 'EUR', icon: '€' });
    fixture.componentRef.setInput('split', false);
    fixture.componentRef.setInput('toPaid', 100);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a row', () => {
    expect(component['formArray'].length).toBe(0);
    component.addNewRow();
    fixture.detectChanges();
    expect(component['formArray'].length).toBe(1);

    const row = component['formArray'].at(0).value;
    expect(row.description).toBe('');
    expect(row.price).toBe(0);
  });

  it('should delete a row', () => {
    component.addNewRow();
    component.addNewRow();
    fixture.detectChanges();

    expect(component['formArray'].length).toBe(2);
    component.deleteRow(0);
    fixture.detectChanges();

    expect(component['formArray'].length).toBe(1);
  });

  it('should update extras on updateExtra', () => {
    component.addNewRow();
    fixture.detectChanges();

    const group = component.getFormGroup(0);
    group.controls.description.setValue('Test description');
    group.controls.price.setValue(42);

    component.updateExtra(0);

    const extras = component.extras();
    expect(extras.length).toBe(1);
    expect(extras[0].description).toBe('Test description');
    expect(extras[0].price).toBe(42);
  });

  it('should emit onChange and isValid', () => {
    vi.spyOn(component.changeOutput, 'emit').mockReturnValue(undefined);
    vi.spyOn(component.isValid, 'emit').mockReturnValue(undefined);

    component.addNewRow();
    fixture.detectChanges();

    const group = component.getFormGroup(0);
    group.controls.description.setValue('A');
    group.controls.price.setValue(10);

    component.updateExtra(0);
    fixture.detectChanges();

    expect(component.changeOutput.emit).toHaveBeenCalledWith(
      component.extras(),
    );
    expect(component.isValid.emit).toHaveBeenCalledWith(true);
  });

  it('should calculate total correctly', () => {
    component.addNewRow();
    component.addNewRow();

    const group1 = component.getFormGroup(0);
    const group2 = component.getFormGroup(1);

    group1.controls.price.setValue(30);
    group2.controls.price.setValue(20);

    component.updateExtra(0);
    component.updateExtra(1);

    expect(component.total()).toBe(50);
  });

  it('should resolve selected payment option and control in split mode', () => {
    fixture.componentRef.setInput('split', true);
    fixture.detectChanges();

    component.addNewRow();
    fixture.detectChanges();

    component.getPaymentOptionControl(0).setValue('TRANSFER');

    expect(component.getPaymentOptionControl(0).value).toBe('TRANSFER');
    expect(component.getFormGroupControls(0).paymentOption?.value).toBe(
      paymentOptions[1].type,
    );
  });

  it('should emit invalid split state when total does not match toPaid', () => {
    vi.spyOn(component.isValid, 'emit').mockReturnValue(undefined);
    fixture.componentRef.setInput('split', true);
    fixture.detectChanges();

    component.addNewRow();
    fixture.detectChanges();

    const group = component.getFormGroup(0);
    group.controls.description.setValue('Split payment');
    group.controls.price.setValue(10);
    component.getPaymentOptionControl(0).setValue('CASH');
    component.updateExtra(0);
    fixture.detectChanges();

    expect(component.isValid.emit).toHaveBeenCalledWith(false);
  });
});
