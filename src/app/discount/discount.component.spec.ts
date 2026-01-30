import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountComponent } from './discount.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { DiscountType, IDiscountAll } from '../interfaces/discount';
import { ICurrency } from '../interfaces/currency';
import { DiscountState } from '../store/reducers/discount.reducers';

describe('DiscountComponent', () => {
  let component: DiscountComponent;
  let fixture: ComponentFixture<DiscountComponent>;

  let discountId$: BehaviorSubject<string | null>;
  let selectedDiscount$: BehaviorSubject<IDiscountAll | undefined>;
  let subErrors$: BehaviorSubject<any>;
  let allCurrencies$: BehaviorSubject<ICurrency[]>;
  let action$: BehaviorSubject<void>;

  let storeSpy: jasmine.SpyObj<Store<DiscountState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
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
    discountId$ = new BehaviorSubject<string | null>(null);
    selectedDiscount$ = new BehaviorSubject<IDiscountAll | undefined>(undefined);
    subErrors$ = new BehaviorSubject<any>([]);
    allCurrencies$ = new BehaviorSubject<ICurrency[]>([]);
    action$ = new BehaviorSubject<void>(void 0);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
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
          return discountId$.asObservable();
        case 2:
          return selectedDiscount$.asObservable();
        case 3:
          return allCurrencies$.asObservable();
        case 4:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [DiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
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
    discountId$.next(null);
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeTrue();
  });

  it('should be in edit mode when discountId is set', () => {
    discountId$.next('123');
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeFalse();
  });

  it('should patch form when selectedDiscount emits a value', () => {
    selectedDiscount$.next(mockDiscount);
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
    subErrors$.next(errors);
    fixture.detectChanges();

    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(component.getForm.currency.hasError('incorrect')).toBeTrue();
    expect(component.getForm.type.hasError('incorrect')).toBeTrue();
    expect(component.errors()['name']).toBe('Name required');
    expect(component.errors()['currency']).toBe('Currency invalid');
    expect(component.errors()['type']).toBe('Type required');
  });

  it('should filter groups correctly using filteredCurrencySignal', () => {
    allCurrencies$.next([mockCurrency, { id: '2', name: 'USD', code: 'USD', icon: 'dollar' }]);
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

    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      discount: jasmine.objectContaining({
        name: 'New Name',
        description: 'New Description',
        type: DiscountType.percentage,
        currencyId: mockCurrency.id,
        amount: 15,
      }),
      type: '[Discount] Create discount',
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
