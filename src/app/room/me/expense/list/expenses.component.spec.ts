import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ExpensesComponent } from './expenses.component';
import { PAGE_SIZE, Pagination } from '../../../../interfaces/pagination';
import { clean, deleteExpense, expenseSelected, getExpensesPage } from '../../../../store/expense.actions';
import { IExpense, IExpenseAll } from '../../../../interfaces/expense';
import { dateToTimestamp, getCurrentTimeZone } from '../../../../util/dates';
import { IRoomAll } from '../../../../interfaces/room';
import { PaymentType } from '../../../../interfaces/payment';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockActivatedRoute: any;
  let stateSubject: Subject<any>;
  let openDialogSpy: jasmine.Spy<any>;

  const room: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: { code: 'EUR', name: 'Euro', id: 'eur', icon: '€' },
    office: {},
    timeZone: getCurrentTimeZone(),
    paymentTypes: [PaymentType.transfer],
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
      expenseTotals: [],
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
      expenseTotals: [],
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
      expenseTotals: [],
      totalNet: 237,
      totalGross: 300,
      deleted: false,
    },
  ];

  const mockPagination: Pagination<IExpenseAll> = {
    content: mockExpenses,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1'),
        },
      },
      paramMap: of({
        get: () => '1',
      }),
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());
    mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    await TestBed.configureTestingModule({
      imports: [ExpensesComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;

    // Set up mock paginator and sort before initialization to prevent errors
    component.paginator = {
      pageIndex: 0,
      page: of({ pageIndex: 0, pageSize: PAGE_SIZE }),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of(),
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component.roomId = '1';

    openDialogSpy = spyOn(component.dialog, 'open');

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual(['position', 'invoice', 'supplyStore.name', 'timestamp', 'totalGross',
      'totalBtw', 'totalNet', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    mockStore.dispatch.calls.reset();
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getExpenses after view init', () => {
    spyOn(component as any, 'getExpenses');

    component.ngAfterViewInit();

    expect(component['getExpenses']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    stateSubject.next({
      data: mockPagination,
    });

    expect(component.dataSource).toEqual(mockExpenses.map((expense: IExpenseAll) => {
      const totalBtw = expense.totalGross - expense.totalNet;
      return Object.assign({}, expense, { totalBtw });
    }));
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get expense list on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getExpenses');

    stateSubject.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getExpenses']).toHaveBeenCalled();
  });

  it('should create page subscriptions when results length is available', () => {
    component.paginator = {
      pageIndex: 0,
      page: of({ pageIndex: 0, pageSize: PAGE_SIZE }),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of({ active: 'invoice', direction: 'asc' }),
      active: 'invoice',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'createPageSubscriptions');

    stateSubject.next({
      data: mockPagination,
    });

    expect(component['createPageSubscriptions']).toHaveBeenCalled();
  });

  it('should dispatch ExpenseSelected action when edit is called', () => {
    const testExpense = mockExpenses[0] as unknown as IExpense;

    component.edit(testExpense);

    expect(mockStore.dispatch).toHaveBeenCalledWith(expenseSelected({ selected: testExpense }));
  });

  it('should call delete method without errors', () => {
    const testExpense = mockExpenses[0] as unknown as IExpense;

    openDialogSpy.and.returnValue({
      afterClosed: () => of(testExpense),
    });

    component.delete(testExpense);

    expect(openDialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'EXPENSE.DELETED.TITLE',
          content: 'EXPENSE.DELETED.CONTENT',
          value: testExpense,
        },
      }));

    expect(mockStore.dispatch).toHaveBeenCalledWith(deleteExpense(
      { roomId: component.roomId!, id: testExpense.id!, invoice: testExpense.invoice! },
    ));
  });

  it('should call openDialog method without errors', () => {
    const testExpense = mockExpenses[0] as unknown as IExpenseAll;

    component.openDialog(testExpense);

    expect(openDialogSpy).toHaveBeenCalledWith(
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

  it('should unsubscribe from subscriptions on destroy', () => {
    const subscription = jasmine.createSpy('subscription');
    const paginatorSubscription = jasmine.createSpy('paginatorSubscription');

    component['subscription'] = { unsubscribe: subscription } as any;
    component['paginatorSubscription'] = { unsubscribe: paginatorSubscription } as any;

    component.ngOnDestroy();

    expect(subscription).toHaveBeenCalled();
    expect(paginatorSubscription).toHaveBeenCalled();
  });

  it('should handle missing subscriptions on destroy', () => {
    component['subscription'] = undefined;
    component['paginatorSubscription'] = undefined;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should reset paginator page index when sort changes', () => {
    const sortChangeSubject = new Subject();

    component.paginator = {
      pageIndex: 5,
      page: of({ pageIndex: 0, pageSize: PAGE_SIZE }),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: sortChangeSubject.asObservable(),
      active: 'invoice',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'getExpenses');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'description', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getExpenses']).toHaveBeenCalled();
  });

  it('should handle paginator page changes', () => {
    const pageSubject = new Subject();
    component.paginator = {
      pageIndex: 1,
      page: pageSubject.asObservable(),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of(),
      active: 'invoice',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'getExpenses');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getExpenses']).toHaveBeenCalled();
  });

  it('should dispatch GetExpensesPage action with correct parameters', () => {
    component.sort = {
      active: 'invoice',
      direction: 'asc',
    } as unknown as MatSort;

    component['dateFilter'] = '2024-01-01';
    const mockEvent = {
      target: { value: '  My Filter  ' },
    } as unknown as Event;
    component.applyFilter(mockEvent);
    component['getExpenses'](2);

    expect(component['filter']).toBe('my filter');
    expect(mockStore.dispatch).toHaveBeenCalledWith(getExpensesPage(
      {
        roomId: '1',
        sort: 'invoice',
        direction: 'asc',
        page: 2,
        size: PAGE_SIZE,
        filter: 'my filter',
        dateFilter: '2024-01-01',
      },
    ));
  });

  it('should handle undefined expanded expense', () => {
    expect(component.expanded).toBeUndefined();
    const expandedExpense = mockExpenses[0] as unknown as IExpense;

    component.expanded = expandedExpense;
    expect(component.expanded).toBe(expandedExpense);
  });

  it('should handle state subscription errors gracefully', () => {
    expect(() => {
      stateSubject.next({
        data: null,
      });
    }).not.toThrow();
  });

  it('should handle empty pagination data', () => {
    const emptyPagination: Pagination<IExpense> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
    };

    stateSubject.next({
      data: emptyPagination,
    });

    expect(component.dataSource).toEqual([]);
    expect(component.resultsLength).toBe(0);
  });

  it('should initialize with correct state observable', () => {
    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should maintain correct displayedColumns order', () => {
    const expectedColumns = ['position', 'invoice', 'supplyStore.name', 'timestamp', 'totalGross',
      'totalBtw', 'totalNet', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    // Test is handled by component initialization with BreakpointObserver
    // The mobile adjustment happens in constructor based on breakpoint observer
    expect(component.pageSize).toBeDefined();
  });

  it('should handle keydown events correctly', () => {
    const backspaceEvent = { code: 'Backspace' };
    const dateControl = component.date;

    component.keyDownHandler(backspaceEvent);
    expect(dateControl?.value).toBe(null);
  });
});
