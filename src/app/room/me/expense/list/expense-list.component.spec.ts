import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { ExpenseListComponent } from './expense-list.component';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../../interfaces/pagination';
import { IExpenseAll } from '../../../../interfaces/expense';
import { dateToTimestamp, getCurrentTimeZone, getDateFormat, getNowTimeZone } from '../../../../util/dates';
import { IRoomAll } from '../../../../interfaces/room';
import { MatDatepicker } from '@angular/material/datepicker';
import { signal } from '@angular/core';
import { DriveAccessService } from '../../../../services/drive-access.service';
import { DocumentStore } from '../../../../store/document.store';
import { DocumentTypeEnum } from '../../../../interfaces/document';
import { ExpenseStore } from '../../../../store/expense.store';
import { Router } from '@angular/router';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let datepickerSpy: jasmine.SpyObj<MatDatepicker<Date>>;
  let dialogSpy: jasmine.Spy<any>;
  let navigateSpy: jasmine.Spy;
  let translate: TranslateService;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let documentStoreSpy: { download: jasmine.Spy };
  let expenseStoreSpy: {
    data: ReturnType<typeof expenseListSignal.asReadonly>;
    response: ReturnType<typeof responseSignal.asReadonly>;
    clean: jasmine.Spy;
    clearResponse: jasmine.Spy;
    loadPage: jasmine.Spy;
    delete: jasmine.Spy;
  };
  const expenseListSignal = signal<any>(undefined);
  const responseSignal = signal<any>(undefined);
  let breakpoint$: BehaviorSubject<any>;
  const defaultBreakpoint = {
    matches: false,
    breakpoints: {
      [Breakpoints.XSmall]: false,
      [Breakpoints.Small]: false,
    },
  };

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
    expenseListSignal.set(mockPagination);
    responseSignal.set(undefined);
    breakpoint$ = new BehaviorSubject(defaultBreakpoint);

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    datepickerSpy = jasmine.createSpyObj('MatDatepicker', ['close']);
    driveAccessServiceSpy = jasmine.createSpyObj<DriveAccessService>('DriveAccessService', ['requestAccessIfNeeded']);
    documentStoreSpy = { download: jasmine.createSpy('download') };
    expenseStoreSpy = {
      data: expenseListSignal.asReadonly(),
      response: responseSignal.asReadonly(),
      clean: jasmine.createSpy('clean'),
      clearResponse: jasmine.createSpy('clearResponse'),
      loadPage: jasmine.createSpy('loadPage'),
      delete: jasmine.createSpy('delete'),
    };

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ExpenseListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ExpenseStore, useValue: expenseStoreSpy },
        { provide: DocumentStore, useValue: documentStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    expenseListSignal.set(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal();
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    expenseListSignal.set(mockPagination);
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

  it('should load expense page when paginatorPageIndex changes', () => {
    fixture.componentRef.setInput('id', room.id);
    fixture.detectChanges();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(expenseStoreSpy.loadPage).toHaveBeenCalledWith({
      roomId: room.id,
      page: 1,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
      filter: undefined,
      dateFilter: '',
    });
  });

  it('should load expense page when filters change', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    component.getForm.filter.setValue('filter');
    fixture.componentRef.setInput('id', room.id);
    fixture.detectChanges();

    expect(expenseStoreSpy.loadPage).toHaveBeenCalledWith({
      roomId: room.id,
      page: 0,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
      filter: 'filter',
      dateFilter: getDateFormat(date),
    });
  });

  it('should clear response and reset paginator when responseSignal emits', () => {
    fixture.componentRef.setInput('id', room.id);
    responseSignal.set({ success: true });

    fixture.detectChanges();

    expect(expenseStoreSpy.clearResponse).toHaveBeenCalled();
  });

  it('should navigate when edit is called', () => {
    const item = mockExpenses[0];
    component.edit(item);

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'rooms', room.id, 'expenses', item.id]);
  });

  it('should call delete method without errors', () => {
    fixture.componentRef.setInput('id', room.id);
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

    expect(expenseStoreSpy.delete).toHaveBeenCalledWith(room.id, testExpense.id!, testExpense.invoice!);
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
    const expectedColumns = ['position', 'invoice', 'supplyStore.name', 'timestamp', 'actions'];
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

    expect(documentStoreSpy.download).toHaveBeenCalledWith({ id: item.id, fileName: item.name });
  });
});
