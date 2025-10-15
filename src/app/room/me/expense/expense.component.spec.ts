import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseComponent } from './expense.component';
import { Subject } from 'rxjs';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { clean, getAllExpensesInfo, getExpense } from '../../../store/expense.actions';
import { IExpenseAll, ISupplyStore } from '../../../interfaces/expense';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let stateSubject: Subject<any>;

  const mockExpense: IExpenseAll = {
    id: '1',
    invoice: 'INV-001',
    supplyStore: { id: 's1', name: 'Test Store' },
    timestamp: '2025-01-15T10:00:00Z',
    expenseTotals: [
      { type: 'Type1', gross: 100, btw: 21, description: 'Test expense' },
      { type: 'Type1', gross: 100, description: 'Test expense without btw' },
    ],
    room: { timeZone: 'Europe/Amsterdam' },
  } as any;

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

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
        ExpenseComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
      EXPENSE: {
        BTW: {
          MIN: 'BTW must be greater than 0.00',
          MAX: 'BTW must be less than 100.00',
        },
      },
    });

    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'expenseId') {
        return testId;
      }
      if (key === 'id') {
        return 'room123';
      }
      return null;
    });

    component.ngOnInit();

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required fields', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.getForm.invoice).toBeDefined();
    expect(component.getForm.supplyStore).toBeDefined();
    expect(component.getForm.date).toBeDefined();
    expect(component.getForm.totals).toBeDefined();
    expect(component.getForm.invoice.hasError('required')).toBeTrue();
    expect(component.getForm.supplyStore.hasError('required')).toBeTrue();
    expect(component.getForm.date.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetAllExpensesInfo action when initialized', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        {
          return 'room123';
        }
      }
      return null;
    });

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAllExpensesInfo({ roomId: 'room123' }));
  });

  it('should dispatch GetExpense action when in edit mode', () => {
    const testId = '123';
    const roomId = 'room123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'expenseId') {
        return testId;
      }
      if (key === 'id') {
        return roomId;
      }
      return null;
    });

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getExpense({ roomId, id: testId }));
  });

  it('should patch form when expense is selected from state', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return 'room123';
      }
      return null;
    });

    component.ngOnInit();

    stateSubject.next({
      selected: mockExpense,
      info: {
        supplyStores: [{ id: 's1', name: 'Test Store' }],
        types: ['Type1', 'Type2'],
        roomName: 'Test Room',
        currency: { icon: '€' },
        timeZone: 'Europe/Amsterdam',
      },
    });

    expect(component.expense?.id).toEqual(mockExpense.id);
    expect(component.getForm.invoice.value).toBe(mockExpense.invoice);
    expect(component.supplyStores).toBeDefined();
    expect(component.types).toBeDefined();
  });

  it('should handle form errors from state', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return 'room123';
      }
      return null;
    });

    component.ngOnInit();

    const mockErrors = [
      { field: 'invoice', message: 'Invoice is required' },
      { field: 'supplyStore', message: 'Supply store is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['invoice']).toBe('Invoice is required');
    expect(component.getForm.invoice.hasError('incorrect')).toBeTrue();
    expect(component.errors['supplyStore']).toBe('Supply store is required');
    expect(component.getForm.supplyStore.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to expense list on successful response', () => {
    const roomId = 'room123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return roomId;
      }
      return null;
    });

    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'rooms', roomId, 'expenses']);
  });

  it('should not dispatch action when form is invalid', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return 'room123';
      }
      return null;
    });

    component.ngOnInit();
    component.getForm.invoice.setValue('');
    component.getForm.supplyStore.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateExpense action when in add mode and form is valid', () => {
    const roomId = 'room123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return roomId;
      }
      return null;
    });

    component.ngOnInit();
    const invoiceControl = component.getForm.invoice;
    const supplyStoreControl = component.getForm.supplyStore;
    const dateControl = component.getForm.date;

    invoiceControl.setValue('INV-123');
    invoiceControl.markAsDirty();

    supplyStoreControl.setValue({ id: 's1', name: 'Test Store' });
    supplyStoreControl.markAsDirty();

    dateControl.setValue(new Date('2025-01-15'));
    dateControl.markAsDirty();

    component.addDate();

    component.totals.at(0).get('type')?.setValue('Type1');
    component.totals.at(0).get('gross')?.setValue('100.00');
    component.totals.at(0).get('btw')?.setValue('21.00');
    component.totals.at(0).markAsDirty();

    mockStore.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0] as any;
    expect(dispatchedAction.type).toBe('[Expense] Create expense');
    expect(dispatchedAction.roomId).toBe(roomId);
    expect(dispatchedAction.expense).toBeDefined();
  });

  it('should dispatch UpdateExpense action when in edit mode and form is valid', () => {
    const testId = '123';
    const roomId = 'room123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'expenseId') {
        return testId;
      }
      if (key === 'id') {
        return roomId;
      }
      return null;
    });

    component.ngOnInit();

    stateSubject.next({
      selected: mockExpense,
      info: {
        supplyStores: [{ id: 's1', name: 'Test Store' }],
        types: ['Type1', 'Type2'],
        roomName: 'Test Room',
        currency: { icon: '€' },
        timeZone: 'Europe/Amsterdam',
      },
    });

    const invoiceControl = component.getForm.invoice;
    invoiceControl.setValue('INV-456');
    invoiceControl.markAsDirty();

    mockStore.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0] as any;
    expect(dispatchedAction.type).toBe('[Expense] Update expense by id');
    expect(dispatchedAction.id).toBe(testId);
    expect(dispatchedAction.roomId).toBe(roomId);
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

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.getForm.invoice.value).toBe('');
    expect(component.getForm.supplyStore.value).toBe('');
    expect(component.getForm.date.value).toBe('');
  });

  it('should validate form correctly', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return 'room123';
      }
      return null;
    });

    component.ngOnInit();
    component.addDate();

    expect(component.form.invalid).toBeTrue();

    component.getForm.invoice.setValue('INV-123');
    component.getForm.supplyStore.setValue({ id: 's1', name: 'Test Store' });
    component.getForm.date.setValue(new Date());
    component.totals.at(0).get('type')?.setValue('Type1');
    component.totals.at(0).get('gross')?.setValue('100.00');
    component.totals.at(0).get('btw')?.setValue('21.00');

    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should filter supply stores correctly when filterSupplyStore is called', () => {
    component.supplyStores = [
      { id: 's1', name: 'Test Store 1' },
      { id: 's2', name: 'Another Store' },
      { id: 's3', name: 'Test Store 2' },
    ] as any[];

    const result = component['filterSupplyStore']('test');

    expect(result?.length).toBe(2);
    expect(result?.[0].name).toBe('Test Store 1');
    expect(result?.[1].name).toBe('Test Store 2');
  });

  it('should return undefined when filterSupplyStore is called with no stores', () => {
    component.supplyStores = undefined;

    const result = component['filterSupplyStore']('test');

    expect(result).toBeUndefined();
  });

  it('should filter supply store options based on form input', (done) => {
    component.supplyStores = [
      { id: 's1', name: 'Test Store 1' },
      { id: 's2', name: 'Another Store' },
      { id: 's3', name: 'Test Store 2' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredSupplyStore?.subscribe(filtered => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { id: 's1', name: 'Test Store 1' },
          { id: 's3', name: 'Test Store 2' },
        ]);
        done();
      }
    });

    component.getForm.supplyStore.setValue('T');
  });

  it('should add new expense total when addDate is called', () => {
    component.ngOnInit();
    const initialLength = component.totals.length;

    component.addDate();

    expect(component.totals.length).toBe(initialLength + 1);
  });

  it('should remove expense total when removeExpense is called', () => {
    component.ngOnInit();
    component.addDate();
    const initialLength = component.totals.length;

    component.removeExpense(0);

    expect(component.totals.length).toBe(initialLength - 1);
  });

  it('should calculate total gross correctly', () => {
    component.ngOnInit();
    component.addDate();
    component.totals.at(0).get('gross')?.setValue('100.00');
    component.addDate();
    component.totals.at(1).get('gross')?.setValue('50.00');

    expect(component.totalGross).toBe(150);
  });

  it('should calculate total BTW correctly', () => {
    component.ngOnInit();
    component.totalMap.set(0, { btwValue: '21.00', net: '100.00' });
    component.totalMap.set(1, { btwValue: '10.50', net: '50.00' });

    expect(component.totalBTW).toBe(31.5);
  });

  it('should calculate total net correctly', () => {
    component.ngOnInit();
    component.totalMap.set(0, { btwValue: '21.00', net: '100.00' });
    component.totalMap.set(1, { btwValue: '10.50', net: '50.00' });

    expect(component.totalNet).toBe(150);
  });

  it('should validate input value correctly', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'gross0';
    input.value = '100.50';

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBe('100.50');
  });

  it('should set error when input value is below minimum', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'btw0';
    input.value = '-10';

    component.validateInputValue(input, 0, 0, 100);

    expect(component.errors['btw0']).toBe('BTW must be greater than 0.00');
    expect(component.totals.at(0).get('btw')?.hasError('incorrect')).toBeTrue();
  });

  it('should set error when input value is above maximum', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'btw0';
    input.value = '101';

    component.validateInputValue(input, 0, 0, 100);

    expect(component.errors['btw0']).toBe('BTW must be less than 100.00');
    expect(component.totals.at(0).get('btw')?.hasError('incorrect')).toBeTrue();
  });

  it('should display supply store name correctly', () => {
    const supplyStore: ISupplyStore = { id: 's1', name: 'Test Store' };

    const result = component.displayFnSupplyStore(supplyStore);

    expect(result).toBe('Test Store');
  });

  it('should remove supply store when removeSupplyStore is called', () => {
    component.ngOnInit();
    component.getForm.supplyStore.setValue({ id: 's1', name: 'Test Store' });

    void component.removeSupplyStore;

    expect(component.getForm.supplyStore.value).toBe('');
  });

  it('should reset form and create another when createAnother is true', () => {
    const roomId = 'room123';
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((key: string) => {
      if (key === 'id') {
        return roomId;
      }
      return null;
    });

    component.ngOnInit();
    component.createAnother = true;

    stateSubject.next({
      response: true,
    });

    expect(component.createAnother).toBeFalse();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return isAddButtonDisabled as true when totals form is invalid', () => {
    component.ngOnInit();
    component.addDate();
    component.totals.at(0).get('type')?.setValue('');
    component.totals.at(0).get('gross')?.setValue('');

    expect(component.isAddButtonDisabled).toBeTrue();
  });

  it('should return isAddButtonDisabled as false when totals form is valid', () => {
    component.ngOnInit();
    component.addDate();
    component.totals.at(0).get('type')?.setValue('Type1');
    component.totals.at(0).get('gross')?.setValue('100.00');
    component.totals.at(0).get('btw')?.setValue('21.00');

    expect(component.isAddButtonDisabled).toBeFalse();
  });

  it('should not dispatch action when roomId is null', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();
    component.getForm.invoice.setValue('INV-123');
    component.getForm.supplyStore.setValue({ id: 's1', name: 'Test Store' });
    component.getForm.date.setValue(new Date());
    component.addDate();
    component.totals.at(0).get('type')?.setValue('Type1');
    component.totals.at(0).get('gross')?.setValue('100.00');
    component.totals.at(0).get('btw')?.setValue('21.00');

    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should calculate net value correctly when btw is provided', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'gross0';
    input.value = '121';

    component.totals.at(0).get('btw')?.setValue('21.00');
    component.validateInputValue(input, 0);

    const total = component.totalMap.get(0);
    expect(total?.net).toBe('100.00');
    expect(total?.btwValue).toBe('21.00');
  });

  it('should handle NaN input value', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'gross0';
    input.value = 'abc';

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBeNull();
  });

  it('should handle empty input value', () => {
    component.ngOnInit();
    component.addDate();
    const input = document.createElement('input');
    input.id = 'gross0';
    input.value = '';

    component.validateInputValue(input, 0);

    expect(component.totals.at(0).get('gross')?.value).toBeUndefined();
  });
});