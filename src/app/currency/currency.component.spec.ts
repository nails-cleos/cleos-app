import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyComponent } from './currency.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ICurrency } from '../interfaces/currency';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fromActionsCurrency from '../store/currency.actions';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let stateSubject: Subject<any>;

  const mockCurrency: ICurrency = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
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
        CurrencyComponent,
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

    fixture = TestBed.createComponent(CurrencyComponent);
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
    expect(component.form.get('code')).toBeDefined();
    expect(component.form.get('icon')).toBeDefined();
    expect(component.form.get('code')?.hasError('required')).toBe(true);
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCurrency.Clean));
  });

  it('should dispatch GetCurrency action when in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCurrency.GetCurrency));
  });

  it('should patch form when currency is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockCurrency,
    });

    expect(component.currency).toEqual(mockCurrency);
    expect(component.form.get('name')?.value).toBe(mockCurrency.name);
    expect(component.form.get('code')?.value).toBe(mockCurrency.code);
    expect(component.form.get('icon')?.value).toBe(mockCurrency.icon);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'code', message: 'Code is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['code']).toBe('Code is required');
    expect(component.form.get('code')?.hasError('incorrect')).toBe(true);
  });

  it('should navigate to currency list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'currency']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateCurrency action when in add mode and form is valid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('New Currency');
    component.form.get('code')?.setValue('USD');
    component.form.get('icon')?.setValue('usd');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCurrency.CreateCurrency));
  });

  it('should dispatch UpdateCurrency action when in edit mode and form is valid', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.currency = mockCurrency;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Currency');
    component.form.get('code')?.setValue('ARS');
    component.form.get('icon')?.setValue('cash');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCurrency.UpdateCurrency));
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

  it('should handle undefined currency in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.currency = undefined;

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCurrency.GetCurrency));
  });

  it('should clear currency when updating in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.currency = mockCurrency;

    component.ngOnInit();
    component.form.get('code')?.setValue('Updated Currency');

    void component.submit;

    expect(component.currency).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('code')?.value).toBe('');
    expect(component.form.get('icon')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBe(true);

    component.form.get('code')?.setValue('Test code');
    expect(component.form.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should clean state and get currency list on response', () => {
    component.ngOnInit();
    mockStore.dispatch.calls.reset();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'currency']);
  });
});
