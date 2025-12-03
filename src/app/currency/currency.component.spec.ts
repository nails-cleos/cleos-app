import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { CurrencyComponent } from './currency.component';
import { getCurrency } from '../store/currency.actions';
import { ICurrencyAll } from '../interfaces/currency';
import { CurrencyState } from '../store/reducers/currency.reducers';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  let storeSpy: jasmine.SpyObj<Store<CurrencyState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let navigateSpy: jasmine.Spy;

  let currencyId$: BehaviorSubject<any>;
  let selectedCurrency$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyId$ = new BehaviorSubject<any>(null);
    selectedCurrency$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return currencyId$.asObservable();
        case 2:
          return selectedCurrency$.asObservable();
        case 3:
          return subErrors$.asObservable();
        case 4:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [CurrencyComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    // Spy router.navigate
    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    // Make sure translate has a language so component.language is meaningful
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getCurrency when currencyId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    currencyId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCurrency({ id: '123' }));
  });

  it('should patch form when selectedCurrency emits', () => {
    selectedCurrency$.next(mockCurrency);
    fixture.detectChanges();

    expect(component.getForm.code.value).toBe(mockCurrency.code);
    expect(component.getForm.name.value).toBe(mockCurrency.name);
    expect(component.getForm.icon.value).toBe(mockCurrency.icon);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'code', message: 'Code required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['code']).toBe('Code required');
    expect(component.getForm.code.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to currency list when response emits', () => {
    response$.next(true);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'currency']);
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.code as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createCurrency when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Currency');
    nameControl.markAsDirty();
    const codeControl = component.getForm.code;
    codeControl.setValue('New Code');
    codeControl.markAsDirty();
    const iconControl = component.getForm.icon;
    iconControl.setValue('New Icon');
    iconControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      currency: jasmine.objectContaining({
        name: 'New Currency',
        code: 'New Code',
        icon: 'New Icon',
      }),
      type: '[Currency] Create currency',
    }));
  });

  it('should dispatch updateCurrency when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    // simulate edit mode
    currencyId$.next('abc-123');
    fixture.detectChanges();
    selectedCurrency$.next({ name: 'Old', code: 'old', icon: 'Old' });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Currency');
    nameControl.markAsDirty();
    const codeControl = component.getForm.code;
    codeControl.setValue('Updated Code');
    codeControl.markAsDirty();
    const iconControl = component.getForm.icon;
    iconControl.setValue('Updated Icon');
    iconControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      currency: jasmine.objectContaining({
        code: 'Updated Code',
        name: 'Updated Currency',
        icon: 'Updated Icon',
      }),
      type: '[Currency] Update currency by id',
    }));
  });
});
