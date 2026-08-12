import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountComponent } from './discount.component';
import { ToastService } from '../services/toast.service';
import { DiscountType, IDiscountAll } from './discount';
import { ICurrency } from '../currency/currency';
import { NavigationService } from '../services/navigation.service';
import { signal } from '@angular/core';
import { DiscountStore } from '../store/discount.store';
import { ICommon } from '../interfaces/common';
import { DEFAULT_LOCALE } from '../util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('DiscountComponent', () => {
  let component: DiscountComponent;
  let fixture: ComponentFixture<DiscountComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  let discountStoreSpy: {
    subErrors: ReturnType<typeof signal>;
  };

  let toastServiceSpy: {
    show: Mock;
  };

  const mockCurrency: ICurrency = {
    id: '1',
    code: 'EUR',
    icon: 'euro',
    name: 'Euro',
  };

  const mockDiscount: IDiscountAll = {
    amount: 10,
    currency: mockCurrency,
    type: DiscountType.money,
    id: '1',
    name: 'Test Discount',
    description: 'Test Description',
  };

  const config: ICommon = {
    title: 'DISCOUNT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    discountStoreSpy = {
      subErrors: signal<any>(undefined),
    };
    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };

    await TestBed.configureTestingModule({
      imports: [DiscountComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedDiscount emits', () => {
    fixture.componentRef.setInput('discount', mockDiscount);
    fixture.detectChanges();

    expect(component.discount()?.id).toBe('1');
    expect(component.getForm.name.value).toBe('Test Discount');
  });

  it('should set form errors when subErrors emits values', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'currency', message: 'Currency invalid' },
      { field: 'type', message: 'Type required' },
    ];
    discountStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    expect(component.getForm.name.hasError('incorrect')).toBe(true);
    expect(component.getForm.currency.hasError('incorrect')).toBe(true);
    expect(component.getForm.type.hasError('incorrect')).toBe(true);
    expect(component.errors()['name']).toBe('Name required');
    expect(component.errors()['currency']).toBe('Currency invalid');
    expect(component.errors()['type']).toBe('Type required');
  });

  it('should filter groups correctly using filteredCurrencySignal', () => {
    fixture.componentRef.setInput('currencies', [
      mockCurrency,
      { id: '2', name: 'USD', code: 'USD', icon: 'dollar' },
    ]);
    (component.getForm.currency as any).setValue('U');
    fixture.detectChanges();

    const filtered = component.filteredCurrencySignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('USD');
  });

  it('should not dispatch when form invalid on submit', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should update form values correctly on submit', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    const nameControl = component.getForm.name;
    nameControl.setValue('New Name');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();
    const typeControl = component.getForm.type;
    typeControl.setValue(DiscountType.percentage);
    typeControl.markAsDirty();
    const currencyControl = component.getForm.currency;
    currencyControl.setValue(mockCurrency);
    currencyControl.markAsDirty();
    fixture.detectChanges();
    const amountControl = component.getForm.amount;
    amountControl.setValue(15);
    amountControl.markAsDirty();
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
        description: 'New Description',
        type: DiscountType.percentage,
        currencyId: mockCurrency.id,
        amount: 15,
      }),
    );
  });

  it('displayFnCurrency should return group name', () => {
    const group = { code: 'Test Currency' } as ICurrency;
    expect(component.displayCurrencyFn(group)).toBe('Test Currency');
    expect(component.displayCurrencyFn(null as any)).toBe('');
  });

  it('keyDownCurrency should clear group on Backspace', () => {
    component.getForm.currency.setValue(mockCurrency);
    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);
    expect(component.getForm.currency.value).toBeUndefined();
  });
});
