import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountComponent } from './discount.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { DiscountType, IDiscountAll } from '../interfaces/discount';
import { ICurrency } from '../interfaces/currency';
import { NavigationService } from '../services/navigation.service';
import { signal } from '@angular/core';
import { DiscountStore } from '../store/discount.store';

describe('DiscountComponent', () => {
  let component: DiscountComponent;
  let fixture: ComponentFixture<DiscountComponent>;

  let discountStoreSpy: {
    selected: ReturnType<typeof signal>;
    currencies: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadCurrencies: jasmine.Spy;
    loadById: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

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

  beforeEach(async () => {
    discountStoreSpy = {
      selected: signal<IDiscountAll | undefined>(undefined),
      currencies: signal<ICurrency[] | undefined>([]),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadCurrencies: jasmine.createSpy('loadCurrencies'),
      loadById: jasmine.createSpy('loadById'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [DiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(DiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in add mode when discountId is null', () => {
    expect(component.isAddModeSignal()).toBeTrue();
  });

  it('should be in edit mode when discountId is set', () => {
    discountStoreSpy.loadById.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeFalse();
    expect(discountStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should patch form when selectedDiscount emits a value', () => {
    discountStoreSpy.selected.set(mockDiscount);
    fixture.detectChanges();

    expect(component.getForm.name.value).toBe(mockDiscount.name!);
    expect(component.getForm.description.value).toBe(mockDiscount.description);
  });

  it('should set form errors when subErrors emits values', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'currency', message: 'Currency invalid' },
      { field: 'type', message: 'Type required' },
    ];
    discountStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(component.getForm.currency.hasError('incorrect')).toBeTrue();
    expect(component.getForm.type.hasError('incorrect')).toBeTrue();
    expect(component.errors()['name']).toBe('Name required');
    expect(component.errors()['currency']).toBe('Currency invalid');
    expect(component.errors()['type']).toBe('Type required');
  });

  it('should filter groups correctly using filteredCurrencySignal', () => {
    discountStoreSpy.currencies.set([mockCurrency, { id: '2', name: 'USD', code: 'USD', icon: 'dollar' }]);
    (component.getForm.currency as any).setValue('U');
    fixture.detectChanges();

    const filtered = component.filteredCurrencySignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('USD');
  });

  it('should update form values correctly on submit', () => {
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

    expect(discountStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Name',
      description: 'New Description',
      type: DiscountType.percentage,
      currencyId: mockCurrency.id,
      amount: 15,
    }));
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
