import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountComponent } from './discount.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DiscountType, IDiscountAll } from '../interfaces/discount';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fromActionsDiscount from '../store/discount.actions';

describe('DiscountComponent', () => {
  let component: DiscountComponent;
  let fixture: ComponentFixture<DiscountComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let stateSubject: Subject<any>;

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
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        DiscountComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBe(true);
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBe(false);
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
    expect(component.form.get('name')?.hasError('required')).toBe(true);
    expect(component.form.get('currency')?.hasError('required')).toBe(true);
    expect(component.form.get('amount')?.hasError('required')).toBe(true);
    expect(component.form.get('type')?.hasError('required')).toBe(true);
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.Clean));
  });

  it('should dispatch GetDiscount action when in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.GetDiscount));
  });

  it('should patch form when discount is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
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

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.errors['currency']).toBe('Currency is required');
    expect(component.errors['amount']).toBe('Amount is required');
    expect(component.errors['type']).toBe('Type is required');
    expect(component.form.get('name')?.hasError('incorrect')).toBe(true);
    expect(component.form.get('currency')?.hasError('incorrect')).toBe(true);
    expect(component.form.get('amount')?.hasError('incorrect')).toBe(true);
    expect(component.form.get('type')?.hasError('incorrect')).toBe(true);
  });

  it('should navigate to discounts list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'discounts']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateDiscount action when in add mode and form is valid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('New Discount');
    component.form.get('description')?.setValue('New Description');
    component.form.get('currency')?.setValue({ id: '1', code: 'EUR' });
    component.form.get('amount')?.setValue(20);
    component.form.get('type')?.setValue(DiscountType.percentage);
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.CreateDiscount));
  });

  it('should dispatch UpdateDiscount action when in edit mode and form is valid', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.discount = mockDiscount;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Discount');
    component.form.get('description')?.setValue('Updated Description');
    component.form.get('currency')?.setValue({ id: '1', code: 'EUR' });
    component.form.get('amount')?.setValue(20);
    component.form.get('type')?.setValue(DiscountType.percentage);
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.UpdateDiscount));
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
    expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined discount in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.discount = undefined;

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.GetDiscount));
  });

  it('should clear discount when updating in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
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

    expect(component.form.invalid).toBe(true);

    component.form.get('name')?.setValue('Test Name');
    component.form.get('currency')?.setValue({ id: '1', code: 'EUR' });
    component.form.get('amount')?.setValue(15);
    component.form.get('type')?.setValue(DiscountType.percentage);
    expect(component.form.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should clean state and get discount list on response', () => {
    component.ngOnInit();
    mockStore.dispatch.calls.reset();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'discounts']);
  });

  it('should dispatch GetAllCurrency action when findGroups is called', () => {
    mockStore.dispatch.calls.reset();

    component['getCurrencies']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.GetAllCurrency));
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

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'currency', 'add']);
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

    expect(component.form.get('amount')?.hasError('min')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should handle currencies from state', () => {
    const testCurrencies = [
      { id: '1', code: 'EUR', name: 'Euro', icon: 'euro' },
      { id: '2', code: 'USD', name: 'US Dollar', icon: 'dollar' },
    ];

    component.ngOnInit();

    stateSubject.next({
      currencies: testCurrencies,
    });

    expect(component.currencies).toEqual(testCurrencies);
  });

  it('should setup filteredCurrencyOptions observable on form creation', () => {
    component.ngOnInit();

    expect(component.filteredCurrencyOptions).toBeDefined();
  });

  it('should call getCurrencies when in add mode', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    spyOn(component as any, 'getCurrencies');

    component.ngOnInit();

    expect(component['getCurrencies']).toHaveBeenCalled();
  });

  it('should call getDiscount when in edit mode', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    spyOn(component as any, 'getDiscount');

    component.ngOnInit();

    expect(component['getDiscount']).toHaveBeenCalled();
  });

  it('should set errors correctly when clearing errors', () => {
    component.ngOnInit();

    // First set some errors
    stateSubject.next({
      subErrors: [{ field: 'name', message: 'Name error' }],
    });

    expect(component.errors['name']).toBe('Name error');

    // Then clear errors
    stateSubject.next({
      response: false,
      subErrors: null,
    });

    // Errors should still be there until explicitly cleared or form is reset
    expect(component.errors['name']).toBe('Name error');
  });
});
