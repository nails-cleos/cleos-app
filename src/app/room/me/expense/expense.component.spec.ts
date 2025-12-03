import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ExpenseComponent } from './expense.component';
import { ExpenseState } from '../../../store/reducers/expense.reducers';
import { RoomState } from '../../../store/reducers/room.reducers';
import { IExpenseAll } from '../../../interfaces/expense';
import { getExpense } from '../../../store/expense.actions';
import { getNowTimeZone } from '../../../util/dates';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;

  let storeSpy: jasmine.SpyObj<Store<ExpenseState | RoomState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let navigateSpy: jasmine.Spy;

  let roomId$: BehaviorSubject<any>;
  let expenseId$: BehaviorSubject<any>;
  let selectedExpense$: BehaviorSubject<any>;
  let info$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  const mockExpense: Partial<IExpenseAll> = {
    id: '1',
    invoice: 'Test Invoice',
    expenseTotals: [
      { type: 'expense', gross: 100, btw: 21, description: 'expense total 1' },
      { type: 'expense', gross: 200, btw: 0, description: 'expense total 2' },
    ],
  };

  beforeEach(async () => {
    roomId$ = new BehaviorSubject<any>(undefined);
    expenseId$ = new BehaviorSubject<any>(undefined);
    selectedExpense$ = new BehaviorSubject<any>(undefined);
    info$ = new BehaviorSubject<any>(undefined);
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
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

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
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      expense: jasmine.objectContaining({
        supplyStoreString: 'New Expense',
        invoice: 'New Description',
      }),
      type: '[Expense] Create expense',
    }));
  });

  it('should dispatch updateExpense when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    expenseId$.next('abc-123');
    roomId$.next('room-123');
    selectedExpense$.next(mockExpense);
    fixture.detectChanges();
    fixture.detectChanges();

    const supplyStoreControl = component.getForm.supplyStore;
    supplyStoreControl.setValue('Updated Expense');
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
        supplyStoreString: 'Updated Expense',
      }),
      type: '[Expense] Update expense by id',
    }));
  });
});
