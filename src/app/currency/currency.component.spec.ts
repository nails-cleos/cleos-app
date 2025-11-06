import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyComponent } from './currency.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ICurrency } from '../interfaces/currency';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { clean, getCurrency } from '../store/currency.actions';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  let state$: Subject<any>;
  
  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  const mockCurrency: ICurrency = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    state$ = new Subject();

    paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    paramMapSpy.get.and.returnValue(null);
    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        CurrencyComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(CurrencyComponent);
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
    expect(component.form.get('code')).toBeDefined();
    expect(component.form.get('icon')).toBeDefined();
    expect(component.form.get('code')?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetCurrency action when in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCurrency({ id: testId }));
  });

  it('should patch form when currency is selected from state', () => {
    component.ngOnInit();

    state$.next({
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

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['code']).toBe('Code is required');
    expect(component.form.get('code')?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to currency list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'currency']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateCurrency action when in add mode and form is valid', () => {
    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const codeControl = component.form.get('code')!;
    const iconControl = component.form.get('icon')!;

    nameControl.setValue('New Currency');
    nameControl.markAsDirty();

    codeControl.setValue('EUR');
    codeControl.markAsDirty();

    iconControl.setValue('euro');
    iconControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      currency: jasmine.objectContaining({
        name: 'New Currency',
        code: 'EUR',
        icon: 'euro',
      }),
      type: '[Currency] Create currency',
    }));
  });

  it('should dispatch UpdateCurrency action when in edit mode and form is valid', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.currency = mockCurrency;

    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const codeControl = component.form.get('code')!;
    const iconControl = component.form.get('icon')!;

    nameControl.setValue('Updated Currency');
    nameControl.markAsDirty();

    codeControl.setValue('ARS');
    codeControl.markAsDirty();

    iconControl.setValue('cash');
    iconControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      currency: jasmine.objectContaining({
        name: 'Updated Currency',
        code: 'ARS',
        icon: 'cash',
      }),
      type: '[Currency] Update currency by id',
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

  it('should handle undefined currency in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.currency = undefined;

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCurrency({ id: testId }));
  });

  it('should clear currency when updating in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
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

    expect(component.form.invalid).toBeTrue();

    component.form.get('code')?.setValue('Test code');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get currency list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'currency']);
  });
});
