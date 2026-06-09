import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseComponent } from './expense.component';
import { IExpenseAll, ISupplyStore } from './expense';
import { ICommon } from '../../../interfaces/common';
import { getNowTimeZone } from '../../../util/dates';
import { computed, signal } from '@angular/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { DriveAccessService } from '../../../services/drive-access.service';
import { EnvService } from '../../../services/env.service';
import { NavigationService } from '../../../services/navigation.service';
import { TokenService } from '../../../services/token.service';
import { provideAppDateAdapter } from '../../../util/adapter/app-date.provider';
import { AwsStore } from '../../../store/aws.store';
import { ExpenseStore } from '../../../store/expense.store';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;

  let navigateSpy: jasmine.Spy;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let awsStoreSpy: { data: ReturnType<typeof signal>; processPdf: jasmine.Spy };
  let expenseStoreSpy: {
    info: ReturnType<typeof infoSignal.asReadonly>;
    subErrors: ReturnType<typeof subErrorsSignal.asReadonly>;
    response: ReturnType<typeof responseSignal.asReadonly>;
    loadInfo: jasmine.Spy;
  };
  const infoSignal = signal<any>(undefined);
  const subErrorsSignal = signal<any>(undefined);
  const responseSignal = signal<any>(undefined);

  let env: EnvService;

  const mockExpense: Partial<IExpenseAll> = {
    id: '1',
    invoice: 'Test Invoice',
    supplyStore: 'Store 1',
    type: 'expense',
    timestamp: 1717430400,
    gross: 100,
    room: {
      id: 'room-1',
      availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
      address: { id: 1, name: 'Main Location', location: { x: 0, y: 0 } },
      currency: { id: 'eur', code: 'EUR', name: 'Euro', icon: '€' },
      office: { id: 'office-1', name: 'Main Office', manager: { id: 'manager-1' } },
      timeZone: 'Europe/Amsterdam',
      paymentTypes: ['TRANSFER'],
      primary: true,
    },
    totalNet: 100,
    totalGross: 100,
    deleted: false,
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
  const config: ICommon = {
    title: 'EXPENSE.TITLE',
    button: { icon: 'add_shopping_cart', label: 'COMMON.BUTTON.CREATE' },
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  const tokenSignal = signal<string | null>('token');

  const tokenServiceMock = {
    token: computed(() => tokenSignal()),
  };

  beforeEach(async () => {
    authUserSignal.set(initialAuthUser);
    tokenSignal.set('token');
    infoSignal.set(undefined);
    subErrorsSignal.set(undefined);
    responseSignal.set(undefined);

    authUserSignal.update(prev => ({
      ...prev,
      userId: 'user-123',
    }));

    driveAccessServiceSpy = jasmine.createSpyObj<DriveAccessService>('DriveAccessService', ['requestAccessIfNeeded']);
    awsStoreSpy = { data: signal<any>(undefined), processPdf: jasmine.createSpy('processPdf') };
    expenseStoreSpy = {
      info: infoSignal.asReadonly(),
      subErrors: subErrorsSignal.asReadonly(),
      response: responseSignal.asReadonly(),
      loadInfo: jasmine.createSpy('loadInfo'),
    };
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ExpenseStore, useValue: expenseStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: AwsStore, useValue: awsStoreSpy },
        provideAppDateAdapter(),
      ],
    }).compileComponents();

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

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    env = TestBed.inject(EnvService);

    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load room expense info when id emits a value', () => {
    fixture.componentRef.setInput('id', 'room-1');
    fixture.detectChanges();

    expect(expenseStoreSpy.loadInfo).toHaveBeenCalledWith('room-1');
  });

  it('should patch form when selectedExpense emits', async () => {
    fixture.componentRef.setInput('expense', mockExpense as IExpenseAll);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const expenseValue = component.expense();
    expect(expenseValue?.id).toBe('1');
    expect(component.getForm.invoice.value).toBe('Test Invoice');
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'supplyStore', message: 'Supply store required' },
    ];

    subErrorsSignal.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['supplyStore']).toBe('Supply store required');
    expect(component.getForm.supplyStore.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to expense list when response emits', () => {
    fixture.componentRef.setInput('id', 'room-1');
    responseSignal.set(true);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'rooms', 'room-1', 'expenses']);
  });

  it('should not emit submitData when form invalid on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    // ensure form invalid
    (component.getForm.supplyStore as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData when form valid in add mode', () => {
    fixture.componentRef.setInput('id', 'room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue({ id: '', name: 'New Expense' });
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('New Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();
    prepareSingleTotal();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      expense: jasmine.objectContaining({
        supplyStoreString: 'New Expense',
        invoice: 'New Description',
      }),
      file: mockFile,
    }));
  });

  it('should emit submitData with undefined file when raw file is undefined', () => {
    fixture.componentRef.setInput('id', 'room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: undefined });
    fixture.detectChanges();
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue({ id: '', name: 'New Expense' });
    supplyStoreControl.markAsDirty();
    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('New Description');
    invoiceControl.markAsDirty();
    const dateControl = component.getForm.date;
    dateControl.setValue(getNowTimeZone());
    dateControl.markAsDirty();
    prepareSingleTotal();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      expense: jasmine.objectContaining({
        supplyStoreString: 'New Expense',
        invoice: 'New Description',
      }),
      file: undefined,
    }));
  });

  it('should create expense and clean the form when createAnother is tick', () => {
    fixture.componentRef.setInput('id', 'room-123');
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

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

    responseSignal.set({ success: true });
    fixture.detectChanges();

    expect(supplyStoreControl.value).toBe('');
    expect(invoiceControl.value).toBe('');
    expect(dateControl.value).toBeNull();
    expect(component.totals.length).toBe(0);
    expect(component['file']()).toBeUndefined();
  });

  it('should not crash when create-another reset runs before form directive is ready', () => {
    const formDirectiveMock = { form: null, submitted: true };
    spyOn<any>(component, 'formDirective').and.returnValue(formDirectiveMock);

    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

    component.getForm.supplyStore.setValue('New Expense');
    component.getForm.invoice.setValue('New Description');
    component.getForm.date.setValue(getNowTimeZone());
    prepareSingleTotal();

    expect(() => {
      component['file'].set(undefined);
      fixture.detectChanges();
    }).not.toThrow();

    expect(component.getForm.supplyStore.value).toBe('');
    expect(component.getForm.invoice.value).toBe('');
    expect(component.getForm.date.value).toBeNull();
    expect(component.totals.length).toBe(0);
  });

  it('should emit submitData when in edit mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
    fixture.componentRef.setInput('id', 'room-123');
    fixture.componentRef.setInput('expense', { ...mockExpense, document: { name: 'invoice.pdf' } } as IExpenseAll);
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
    prepareSingleTotal();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      expense: jasmine.objectContaining({
        invoice: 'Updated Description',
        supplyStoreString: '123',
      }),
    }));
  });

  it('should call aws upload on file upload', () => {
    spyOnProperty(env, 'awsExtractEnable', 'get')
      .and.returnValue(true);
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

    expect(awsStoreSpy.processPdf)
      .toHaveBeenCalledWith('token', mockFile, 'user-123');
  });


  it('should not call aws upload on file upload when awsExtractEnable flag is disabled', () => {
    spyOnProperty(env, 'awsExtractEnable', 'get')
      .and.returnValue(false);
    component['file'].set({ name: 'invoice.pdf', size: 1000, progress: 100, raw: mockFile });
    fixture.detectChanges();

    expect(awsStoreSpy.processPdf).not.toHaveBeenCalled();
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
    awsStoreSpy.data.set(awsData);
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

    infoSignal.set({ supplyStores: mockSuppliers });
    awsStoreSpy.data.set(awsData);
    fixture.detectChanges();

    expect(component.getForm.supplyStore.value).toEqual(mockSuppliers[0]);
    const totals = component.totals.getRawValue();
    expect(totals.length).toBe(1);
    expect(totals[0].gross).toBe('121.00');
    expect(totals[0].btw).toBe('21.00');
    expect(component.totalMap.get(0)).toEqual({ net: '100.00', btwValue: '21.00' });
  });

  it('should remove supplier', () => {
    infoSignal.set({ supplyStores: mockSuppliers });
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
