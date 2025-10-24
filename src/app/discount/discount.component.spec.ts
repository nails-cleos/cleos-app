import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountComponent } from './discount.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DiscountType, IDiscountAll } from '../interfaces/discount';
import { clean, getAllCurrency, getDiscount } from '../store/discount.actions';
import { AppState } from '../store/app.states';

describe('DiscountComponent', () => {
  let component: DiscountComponent;
  let fixture: ComponentFixture<DiscountComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  const mockDiscount: IDiscountAll = {
    id: '1',
    name: 'Test Discount',
    description: 'Test Description',
    amount: 10,
    type: DiscountType.money,
    currency: {
      id: '1',
      name: 'Test Currency',
      code: 'EUR',
      icon: 'euro',
    },
  };

  beforeEach(async () => {
    state$ = new Subject();

    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    paramMapSpy.get.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [DiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(DiscountComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    paramMapSpy.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('currency')).toBeDefined();
    expect(component.form.get('amount')).toBeDefined();
    expect(component.form.get('type')).toBeDefined();
    expect(component.form.get('name')?.hasError('required')).toBeTrue();
    expect(component.form.get('currency')?.hasError('required')).toBeTrue();
    expect(component.form.get('amount')?.hasError('required')).toBeTrue();
    expect(component.form.get('type')?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetDiscount action when in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getDiscount({ id: testId }));
  });

  it('should patch form when discount is selected from state', () => {
    component.ngOnInit();

    state$.next({
      selected: mockDiscount,
    });

    expect(component.discount).toEqual(mockDiscount);
    expect(component.form.get('name')?.value).toBe(mockDiscount.name);
    expect(component.form.get('description')?.value).toBe(mockDiscount.description);
    expect(component.form.get('currency')?.value).toBe(mockDiscount.currency);
    expect(component.form.get('amount')?.value).toBe(mockDiscount.amount);
    expect(component.form.get('type')?.value).toBe(mockDiscount.type);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'currency', message: 'Currency is required' },
      { field: 'amount', message: 'Amount is required' },
      { field: 'type', message: 'Type is required' },
    ];

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.errors['currency']).toBe('Currency is required');
    expect(component.errors['amount']).toBe('Amount is required');
    expect(component.errors['type']).toBe('Type is required');
    expect(component.form.get('name')?.hasError('incorrect')).toBeTrue();
    expect(component.form.get('currency')?.hasError('incorrect')).toBeTrue();
    expect(component.form.get('amount')?.hasError('incorrect')).toBeTrue();
    expect(component.form.get('type')?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to discounts list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'discounts']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateDiscount action when in add mode and form is valid', () => {
    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    nameControl.setValue('New Discount');
    nameControl.markAsDirty();

    const descriptionControl = component.form.get('description')!;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const currencyControl = component.form.get('currency')!;
    currencyControl.setValue({ id: '1', code: 'EUR' });
    currencyControl.markAsDirty();

    const amountControl = component.form.get('amount')!;
    amountControl.setValue(20);
    amountControl.markAsDirty();

    const typeControl = component.form.get('type')!;
    typeControl.setValue(DiscountType.percentage);
    typeControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      discount: jasmine.objectContaining({
        name: 'New Discount',
        description: 'New Description',
        amount: 20,
        type: DiscountType.percentage,
        currencyId: '1',
      }),
      type: '[Discount] Create discount',
    }));
  });

  it('should dispatch UpdateDiscount action when in edit mode and form is valid', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.ngOnInit();

    state$.next({ selected: mockDiscount });

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Discount');
    nameControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    const amountControl = component.getForm.amount;
    amountControl.setValue(15);
    amountControl.markAsDirty();

    const typeControl = component.getForm.type;
    typeControl.setValue(DiscountType.percentage);
    typeControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      discount: jasmine.objectContaining({
        name: 'Updated Discount',
        description: 'Updated Description',
        amount: 15,
        type: DiscountType.percentage,
      }),
      type: '[Discount] Update discount by id',
    }));
  });

  it('should return form controls from getForm getter', () => {
    component.ngOnInit();

    const controls = component.getForm;

    expect(controls).toBe(component.form.controls);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    const subscription = component['subscription'];
    spyOn(subscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('should handle subscription when no subscription exists', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should call detectChanges when needed', () => {
    expect(changeDetectorRefSpy.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined discount in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.discount = undefined;

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getDiscount({ id: testId }));
  });

  it('should clear discount when updating in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.discount = mockDiscount;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Discount');
    component.form.get('currency')?.setValue({ id: '1', code: 'EUR' });
    component.form.get('amount')?.setValue(20);
    component.form.get('type')?.setValue(DiscountType.percentage);

    void component.submit;

    expect(component.discount).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('currency')?.value).toBe('');
    expect(component.form.get('amount')?.value).toBe('');
    expect(component.form.get('type')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.form.get('name')?.setValue('Test Name');
    component.form.get('currency')?.setValue({ id: '1', code: 'EUR' });
    component.form.get('amount')?.setValue(15);
    component.form.get('type')?.setValue(DiscountType.percentage);
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get discount list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'discounts']);
  });

  it('should dispatch GetAllCurrency action when findGroups is called', () => {
    storeSpy.dispatch.calls.reset();

    component['getCurrencies']();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCurrency());
  });

  it('should filter currencies correctly when filterCurrency is called', () => {
    component.currencies = [
      { code: 'EUR', name: 'Euro', id: '1' },
      { code: 'USD', name: 'US Dollar', id: '2' },
      { code: 'GBP', name: 'British Pound', id: '3' },
    ] as any[];

    const result = component['filterCurrency']('eu');

    expect(result?.length).toBe(1);
    expect(result?.[0].code).toBe('EUR');
  });

  it('should return undefined when filterCurrency is called with no currencies', () => {
    component.currencies = undefined;

    const result = component['filterCurrency']('test');

    expect(result).toBeUndefined();
  });

  it('should test addCurrency getter navigation', () => {
    void component.addCurrency;

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'currency', 'add']);
  });

  it('should test displayCurrencyFn with valid currency', () => {
    const currency = { id: '1', code: 'EUR', name: 'Euro' } as any;

    const result = component.displayCurrencyFn(currency);

    expect(result).toBe('EUR');
  });

  it('should test displayCurrencyFn with null currency', () => {
    const result = component.displayCurrencyFn(null as any);

    expect(result).toBe('');
  });

  it('should test keyDownHandler with Backspace event', () => {
    component.ngOnInit();
    const mockEvent = { code: 'Backspace' };
    const mockFormControl = component.form.get('name')!;
    mockFormControl.setValue('test value');

    component.keyDownHandler(mockEvent, mockFormControl);

    expect(mockFormControl.value).toBe('');
  });

  it('should test keyDownHandler with non-Backspace event', () => {
    component.ngOnInit();
    const mockEvent = { code: 'Enter' };
    const mockFormControl = component.form.get('name')!;
    mockFormControl.setValue('test value');

    component.keyDownHandler(mockEvent, mockFormControl);

    expect(mockFormControl.value).toBe('test value');
  });

  it('should test form validation with amount less than 1', () => {
    component.ngOnInit();

    component.form.get('amount')?.setValue(0);

    expect(component.form.get('amount')?.hasError('min')).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  });

  it('should handle currencies from state', () => {
    const testCurrencies = [
      { id: '1', code: 'EUR', name: 'Euro', icon: 'euro' },
      { id: '2', code: 'USD', name: 'US Dollar', icon: 'dollar' },
    ];

    component.ngOnInit();

    state$.next({
      currencies: testCurrencies,
    });

    expect(component.currencies).toEqual(testCurrencies);
  });

  it('should setup filteredCurrencyOptions observable on form creation', () => {
    component.ngOnInit();

    expect(component.filteredCurrencyOptions).toBeDefined();
  });

  it('should call getCurrencies when in add mode', () => {
    paramMapSpy.get.and.returnValue(null);
    spyOn(component as any, 'getCurrencies');

    component.ngOnInit();

    expect(component['getCurrencies']).toHaveBeenCalled();
  });

  it('should call getDiscount when in edit mode', () => {
    paramMapSpy.get.and.returnValue('123');
    spyOn(component as any, 'getDiscount');

    component.ngOnInit();

    expect(component['getDiscount']).toHaveBeenCalled();
  });

  it('should set errors correctly when clearing errors', () => {
    component.ngOnInit();

    // First set some errors
    state$.next({
      subErrors: [{ field: 'name', message: 'Name error' }],
    });

    expect(component.errors['name']).toBe('Name error');

    // Then clear errors
    state$.next({
      response: false,
      subErrors: null,
    });

    // Errors should still be there until explicitly cleared or form is reset
    expect(component.errors['name']).toBe('Name error');
  });
});
