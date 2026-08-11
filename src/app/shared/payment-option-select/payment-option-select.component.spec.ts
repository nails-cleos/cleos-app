import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PaymentOptionSelectComponent } from './payment-option-select.component';
import { IPaymentOption } from '@app/interfaces/payment';
import { provideAppIcons } from '@app/util/app-icons.provider';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PaymentOptionSelectComponent', () => {
  let component: PaymentOptionSelectComponent;
  let fixture: ComponentFixture<PaymentOptionSelectComponent>;

  const options: IPaymentOption[] = [
    {
      label: 'Cash',
      type: 'CASH',
      enabled: true,
      enabledCustomer: false,
      default: true,
      filter: true,
      defaultFilter: false,
      show: true,
      icon: 'cash',
    },
    {
      label: 'Transfer',
      type: 'TRANSFER',
      enabled: true,
      enabledCustomer: false,
      default: true,
      filter: true,
      defaultFilter: true,
      show: true,
      icon: 'Transfer',
    },
    {
      label: 'Mollie',
      type: 'MOLLIE',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: true,
      defaultFilter: true,
      show: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentOptionSelectComponent],
      providers: [provideAppIcons(), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentOptionSelectComponent);
    component = fixture.componentInstance;
  });

  it('should return all options when allowedValues is empty', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    expect(component.filteredOptions()).toEqual(options);
  });

  it('should filter options by allowedValues', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('allowedValues', ['TRANSFER', 'MOLLIE']);
    fixture.detectChanges();

    expect(component.filteredOptions().map((option) => option.type)).toEqual([
      'TRANSFER',
      'MOLLIE',
    ]);
  });

  it('should resolve selected option from control value when valueMode is type', () => {
    fixture.componentRef.setInput('control', new FormControl('TRANSFER'));
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('valueMode', 'type');
    fixture.detectChanges();

    expect(component.getSelectedOption()).toEqual(options[1]);
    expect(component.getSelectedType()).toBe('TRANSFER');
    expect(component.getSelectedLabel()).toBe('Transfer');
  });

  it('should return the selected object directly when valueMode is object', () => {
    fixture.componentRef.setInput('control', new FormControl(options[0]));
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('valueMode', 'object');
    fixture.detectChanges();

    expect(component.getSelectedOption()).toEqual(options[0]);
    expect(component.getSelectedType()).toBe('CASH');
    expect(component.getSelectedLabel()).toBe('Cash');
  });

  it('should return undefined values when control is empty', () => {
    fixture.componentRef.setInput('control', new FormControl(undefined));
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    expect(component.getSelectedOption()).toBeUndefined();
    expect(component.getSelectedLabel()).toBeUndefined();
    expect(component.getSelectedType()).toBeNull();
  });
});
