import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ExpenseComponent } from './expense.component';
import { ExpenseState } from '../../../store/reducers/expense.reducers';
import { RoomState } from '../../../store/reducers/room.reducers';
import { IExpenseAll, ISupplyStore } from '../../../interfaces/expense';
import { getExpense } from '../../../store/expense.actions';
import { getNowTimeZone } from '../../../util/dates';
import { computed, signal } from '@angular/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { callAwsLambda } from '../../../store/aws.actions';
import { DriveAccessService } from '../../../services/drive-access.service';
import { EnvService } from '../../../services/env.service';
import { TokenService } from '../../../services/token.service';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;

  let storeSpy: jasmine.SpyObj<Store<ExpenseState | RoomState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let navigateSpy: jasmine.Spy;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  let roomId$: BehaviorSubject<any>;
  let expenseId$: BehaviorSubject<any>;
  let selectedExpense$: BehaviorSubject<any>;
  let info$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let aws$: BehaviorSubject<any>;

  let env: EnvService;

  const mockExpense: Partial<IExpenseAll> = {
    id: '1',
    invoice: 'Test Invoice',
    expenseTotals: [
      { type: 'expense', gross: 100, btw: 21, description: 'expense total 1' },
      { type: 'expense', gross: 200, btw: 0, description: 'expense total 2' },
    ],
  };

  const mockFile = new File(
    ['dummy content'],
    'invoice.pdf',
    { type: 'application/pdf' },
  );

  const mockSuppliers: ISupplyStore[] = [{ id: '1', name: 'vendor_name' }];

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  const tokenSignal = signal<string | null>('token');

  const tokenServiceMock = {
    token: computed(() => tokenSignal()),
  };

  beforeEach(async () => {
    roomId$ = new BehaviorSubject<any>(undefined);
    expenseId$ = new BehaviorSubject<any>(undefined);
    selectedExpense$ = new BehaviorSubject<any>(undefined);
    info$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);
    aws$ = new BehaviorSubject<any>(undefined);

    authUserSignal.update(prev => ({
      ...prev,
      userId: 'user-123',
    }));

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    driveAccessServiceSpy = jasmine.createSpyObj<DriveAccessService>('DriveAccessService', ['requestAccessIfNeeded']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return roomId$.asObservable();
        case 2:
          return expenseId$.asObservable();
        case 3:
          return selectedExpense$.asObservable();
        case 4:
          return info$.asObservable();
        case 5:
          return subErrors$.asObservable();
        case 6:
          return response$.asObservable();
        case 7:
          return aws$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        { provide: TokenService, useValue: tokenServiceMock },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    env = TestBed.inject(EnvService);

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
      EXPENSE: {
        GROSS: {
          MIN: 'Gross is below minimum',
          MAX: 'Gross exceeds maximum',
        },
        BTW: {
          MIN: 'BTW is below minimum',
          MAX: 'BTW exceeds maximum',
        },
      },
    });

    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getExpense when expenseId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    expenseId$.next('123');
    roomId$.next('room-1');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getExpense({ id: '123', roomId: 'room-1' }));
  });

  it('should patch form when selectedExpense emits', () => {
    selectedExpense$.next(mockExpense);
    fixture.detectChanges();

    const expenseSignalValue = component.expenseSignal();
    expect(expenseSignalValue?.id).toBe('1');
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'supplyStore', message: 'Supply store required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['supplyStore']).toBe('Supply store required');
    expect(component.getForm.supplyStore.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to expense list when response emits', () => {
    roomId$.next('room-1');
    response$.next(true);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'rooms', 'room-1', 'expenses']);
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.supplyStore as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createExpense when in add mode and form valid', () => {
    roomId$.next('room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();
    storeSpy.dispatch.calls.reset();

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue({ id: '', name: 'New Expense' });
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('New Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      expense: jasmine.objectContaining({
        supplyStoreString: 'New Expense',
        invoice: 'New Description',
      }),
      type: '[Expense] Create expense',
    }));
  });

  it('should not dispatch createExpense when in add mode and form valid but raw is undefined', () => {
    roomId$.next('room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: undefined });
    fixture.detectChanges();
    storeSpy.dispatch.calls.reset();

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue('New Expense');
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('New Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should create expense and clean the form when createAnother is tick', () => {
    roomId$.next('room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();
    storeSpy.dispatch.calls.reset();

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue('New Expense');
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('New Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();
    prepareSingleTotal();

    component.createAnother = true;
    expect(component.totals.length).toBe(1);

    response$.next({ success: true });
    fixture.detectChanges();

    expect(supplyStoreControl.value).toBe('');
    expect(invoiceControl.value).toBe('');
    expect(dateControl.value).toBeNull();
    expect(component.totals.length).toBe(0);
  });

  it('should dispatch updateExpense when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    expenseId$.next('abc-123');
    roomId$.next('room-123');
    selectedExpense$.next({ ...mockExpense, document: { name: 'invoice.pdf' } });
    fixture.detectChanges();

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue({ id: '123', name: 'Updated Expense' });
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('Updated Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      expense: jasmine.objectContaining({
        invoice: 'Updated Description',
        supplyStoreString: '123',
      }),
      type: '[Expense] Update expense by id',
    }));
  });

  it('should call aws upload on file upload', () => {
    spyOnProperty(env, 'awsExtractEnable', 'get')
      .and.returnValue(true);
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(callAwsLambda({ token: 'token', file: mockFile, userId: 'user-123' }));
  });


  it('should not call aws upload on file upload when awsExtractEnable flag is disabled', () => {
    spyOnProperty(env, 'awsExtractEnable', 'get')
      .and.returnValue(false);
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

    expect(storeSpy.dispatch).not
      .toHaveBeenCalledWith(callAwsLambda({ token: 'token', file: mockFile, userId: 'user-123' }));
  });

  it('should set full aws data', () => {
    const awsData = {
      VENDOR_NAME: 'VENDOR_NAME',
      INVOICE_RECEIPT_DATE: '2025-10-10',
      INVOICE_RECEIPT_ID: 'INV-123',
      TOTAL: '€ 121,00',
      SUBTOTAL: '€ 100.00',
      TAX: '€ 21',
    };
    aws$.next(awsData);
    fixture.detectChanges();

    expect(component.getForm.supplyStore.value).toEqual({ id: '', name: awsData.VENDOR_NAME });
    expect(component.getForm.invoice.value).toBe(awsData.INVOICE_RECEIPT_ID);
    expect(component.getForm.date.value).toEqual(new Date(awsData.INVOICE_RECEIPT_DATE));
    const totals = component.totals.getRawValue();
    expect(totals.length).toBe(1);
    expect(totals[0].gross).toBe('121.00');
    expect(totals[0].btw).toBe('21.00');
    expect(component.totalMap.get(0)).toEqual({ net: '100.00', btwValue: '21.00' });
  });

  it('should set correct data when receive partial aws data', () => {
    const awsData = {
      VENDOR_NAME: 'VENDOR_NAME',
      SUBTOTAL: '€ 100.00',
      TAX: '€ 21',
    };

    aws$.next(awsData);
    info$.next({ supplyStores: mockSuppliers });
    fixture.detectChanges();

    expect(component.getForm.supplyStore.value).toEqual(mockSuppliers[0]);
    const totals = component.totals.getRawValue();
    expect(totals.length).toBe(1);
    expect(totals[0].gross).toBe('121.00');
    expect(totals[0].btw).toBe('21.00');
    expect(component.totalMap.get(0)).toEqual({ net: '100.00', btwValue: '21.00' });
  });

  it('should remove supplier', () => {
    info$.next({ supplyStores: mockSuppliers });
    fixture.detectChanges();

    component.getForm.supplyStore.setValue(mockSuppliers[0]);
    expect(component.getForm.supplyStore.value).toEqual(mockSuppliers[0]);

    component.removeSupplyStore();

    expect(component.getForm.supplyStore.value).toBe('');
  });

  it('should create an empty total when addDate is fire', () => {
    component.addDate();
    const totals = component.totals.getRawValue();
    expect(totals.length).toBe(1);
    expect(totals[0].gross).toBe('');
    expect(totals[0].btw).toBe('');
  });

  it('should set formatted value and update totals when input is valid', () => {
    prepareSingleTotal();

    const input = createInput('gross0', '100');

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBe('100.00');
    expect(component.totalMap.get(0)).toEqual({
      net: '100.00',
      btwValue: '0.00',
    });
  });

  it('should set error when value is below min', () => {
    prepareSingleTotal();

    const input = createInput('gross0', '5');

    component.validateInputValue(input, 0, 10);

    expect(component.errors()['gross0']).toBeDefined();
    expect(component.totals.at(0).get('gross')?.hasError('incorrect')).toBeTrue();
  });

  it('should set error when value exceeds max', () => {
    prepareSingleTotal();

    const input = createInput('gross0', '200');

    component.validateInputValue(input, 0, undefined, 100);

    expect(component.errors()['gross0']).toBeDefined();
    expect(component.totals.at(0).get('gross')?.hasError('incorrect')).toBeTrue();
  });

  it('should clear value when input is NaN', () => {
    prepareSingleTotal();

    const input = createInput('gross0', 'abc');

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBeNull();
  });

  it('should clear value when input is empty', () => {
    prepareSingleTotal();

    const input = createInput('gross0', '');

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBeUndefined();
  });

  it('should recalculate net and btw when gross and btw are present', () => {
    prepareSingleTotal();

    component.totals.at(0).get('btw')?.setValue('21');

    const input = createInput('gross0', '121');

    component.validateInputValue(input, 0);

    expect(component.totalMap.get(0)).toEqual({
      net: '100.00',
      btwValue: '21.00',
    });
  });

  const createInput = (id: string, value: string): HTMLInputElement => {
    const input = document.createElement('input');
    input.id = id;
    input.value = value;
    return input;
  };

  const prepareSingleTotal = () => {
    component.addDate();
    component.totals.at(0).patchValue({
      type: 'expense',
      gross: '0',
      btw: '0',
      description: '',
    });
  };
});
