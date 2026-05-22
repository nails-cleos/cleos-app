import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { ExpensesComponent } from './expenses.component';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../../interfaces/pagination';
import { IExpenseAll } from '../../../../interfaces/expense';
import { dateToTimestamp, getCurrentTimeZone, getDateFormat, getNowTimeZone } from '../../../../util/dates';
import { IRoomAll } from '../../../../interfaces/room';
import { MatDatepicker } from '@angular/material/datepicker';
import { ExpenseState } from '../../../../store/reducers/expense.reducers';
import { RoomState } from '../../../../store/reducers/room.reducers';
import { deleteExpense, expenseSelected, getExpensesPage } from '../../../../store/expense.actions';
import { signal } from '@angular/core';
import { DriveAccessService } from '../../../../services/drive-access.service';
import { documentView } from '../../../../store/document.actions';
import { DocumentTypeEnum } from '../../../../interfaces/document';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;

  let storeSpy: jasmine.SpyObj<Store<ExpenseState | RoomState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let datepickerSpy: jasmine.SpyObj<MatDatepicker<Date>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.Spy<any>;
  let translate: TranslateService;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  let roomId$: BehaviorSubject<string | undefined>;
  let expenseList$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;

  const room: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: { code: 'EUR', name: 'Euro', id: 'eur', icon: '€' },
    office: {
      id: 'office-id',
      name: 'Main Office',
      manager: {
        id: 'manager-id',
      },
    },
    timeZone: getCurrentTimeZone(),
    paymentTypes: ['TRANSFER'],
    primary: true,
  };

  const mockExpenses: IExpenseAll[] = [
    {
      id: '1',
      invoice: 'Invoice-1',
      description: 'expense 1',
      supplyStore: 'Store 1',
      timestamp: dateToTimestamp(),
      type: 'expense',
      gross: 100,
      btw: 21,
      room,
      expenseTotals: [
        { type: 'expense', gross: 100, btw: 21, description: 'expense total 1' },
        { type: 'expense', gross: 200, btw: 0, description: 'expense total 2' },
      ],
      totalNet: 79,
      totalGross: 100,
      deleted: false,
    },
    {
      id: '2',
      invoice: 'Invoice-2',
      description: 'expense 2',
      supplyStore: 'Store 2',
      timestamp: dateToTimestamp(),
      type: 'expense',
      gross: 200,
      btw: 42,
      room,
      expenseTotals: [
        { type: 'expense', gross: 100, btw: 21, description: 'expense total 1' },
        { type: 'expense', gross: 200, btw: 0, description: 'expense total 2' },
      ],
      totalNet: 158,
      totalGross: 200,
      deleted: false,
    },
    {
      id: '3',
      invoice: 'Invoice-3',
      description: 'expense 3',
      supplyStore: 'Store 3',
      timestamp: dateToTimestamp(),
      type: 'expense',
      gross: 300,
      btw: 63,
      room,
      expenseTotals: [
        { type: 'expense', gross: 100, btw: 21, description: 'expense total 1' },
        { type: 'expense', gross: 200, btw: 0, description: 'expense total 2' },
      ],
      totalNet: 237,
      totalGross: 300,
      deleted: false,
    },
  ];

  const mockPagination = {
    content: mockExpenses,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    roomId$ = new BehaviorSubject<string | undefined>(undefined);
    expenseList$ = new BehaviorSubject(mockPagination);
    response$ = new BehaviorSubject(undefined);
    breakpoint$ = new BehaviorSubject({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    datepickerSpy = jasmine.createSpyObj('MatDatepicker', ['close']);
    driveAccessServiceSpy = jasmine.createSpyObj<DriveAccessService>('DriveAccessService', ['requestAccessIfNeeded']);

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
          return expenseList$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ExpensesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    roomId$.complete();
    expenseList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    expenseList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal();
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    expenseList$.next(mockPagination);
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(3);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(PAGE_SIZE);
  });

  it('should dispatch getExpensePage when paginatorPageIndex changes', () => {
    roomId$.next(room.id);
    fixture.detectChanges();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getExpensesPage({
        roomId: room.id,
        page: 1,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        filter: undefined,
        dateFilter: '',
      }),
    );
  });

  it('should dispatch getExpensePage when filters changes', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    component.getForm.filter.setValue('filter');
    roomId$.next(room.id);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getExpensesPage({
        roomId: room.id,
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        filter: 'filter',
        dateFilter: getDateFormat(date),
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);
    roomId$.next(room.id);
    response$.next({ success: true });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getExpensesPage({
        roomId: room.id,
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        filter: undefined,
        dateFilter: '',
      }),
    );
  });

  it('should dispatch expenseSelected when edit is called', () => {
    const item = mockExpenses[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(expenseSelected({ selected: item }));
  });

  it('should call delete method without errors', () => {
    roomId$.next(room.id);
    fixture.detectChanges();
    const testExpense = mockExpenses[0];

    dialogSpy.and.returnValue({
      afterClosed: () => of(testExpense),
    });

    component.delete(testExpense);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'EXPENSE.DELETED.TITLE',
          content: 'EXPENSE.DELETED.CONTENT',
          value: testExpense,
          variant: 'warning',
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteExpense(
      { roomId: room.id, id: testExpense.id!, invoice: testExpense.invoice! },
    ));
  });

  it('should call openDialog method without errors', () => {
    const testExpense = mockExpenses[0];

    component.openDialog(testExpense);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'COMMON.TIME_ZONE.TITLE',
          content: 'COMMON.TIME_ZONE.ROOM_INFO',
          hideNoButton: true,
          hideOkButton: true,
        },
      }));
  });

  it('should handle undefined expanded expense', () => {
    expect(component.expanded).toBeUndefined();
    const expandedExpense = mockExpenses[0];

    component.expanded = expandedExpense;
    expect(component.expanded).toBe(expandedExpense);
  });

  it('should maintain correct displayedColumns order', () => {
    const expectedColumns = ['position', 'invoice', 'supplyStore.name', 'timestamp', 'totalGross',
      'totalBtw', 'totalNet', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle keydown events correctly', () => {
    const backspaceEvent = { code: 'Backspace' } as KeyboardEvent;
    const dateControl = component.getForm.date;

    component.keyDownHandler(backspaceEvent);
    expect(dateControl?.value).toBe(undefined);
  });

  it('should set month and year from normalizedMonthAndYear and close datepicker', () => {
    const normalizedMonthAndYear = new Date(2024, 6, 1);

    component.setMonthAndYear(normalizedMonthAndYear, datepickerSpy);

    const result = component.getForm.date.value;
    expect(result?.getMonth()).toBe(6);
    expect(result?.getFullYear()).toBe(2024);
    expect(datepickerSpy.close).toHaveBeenCalled();
  });

  it('should use getNowTimeZone() if date has no value', () => {
    component.getForm.date.setValue(undefined);

    const normalizedMonthAndYear = new Date(2025, 2, 1);

    component.setMonthAndYear(normalizedMonthAndYear, datepickerSpy);

    const result = component.getForm.date.value;
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(2);
    expect(datepickerSpy.close).toHaveBeenCalled();
  });

  it('should dispatch documentSelected when edit is called', () => {
    const item = { id: '1', name: 'Document 1', date: new Date(2024, 2, 1), type: DocumentTypeEnum.expense };
    component.download(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(documentView({ id: item.id, fileName: item.name }));
  });
});
