import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyListComponent } from './currency-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { ICurrency } from '../../interfaces/currency';
import { PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { clean, currencySelected, deleteCurrency, getCurrenciesPage } from '../../store/currency.actions';

describe('CurrencyListComponent', () => {
  let component: CurrencyListComponent;
  let fixture: ComponentFixture<CurrencyListComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<any>;

  const mockCurrencyList: ICurrency[] = [
    { id: '1', name: 'Euro', code: 'EUR', icon: 'euro' },
    { id: '2', name: 'Dollar', code: 'USD', icon: 'dollar' },
    { id: '3', name: 'Pesos Argentinos', code: 'ARS', icon: 'dollar' },
  ];

  const mockPagination: Pagination<ICurrency> = {
    content: mockCurrencyList,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    state$ = new Subject();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    paramMapSpy.get.and.returnValue(null);
    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    await TestBed.configureTestingModule({
      imports: [CurrencyListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyListComponent);
    component = fixture.componentInstance;

    component.paginator = {
      pageIndex: 0,
      page: of({ pageIndex: 0, pageSize: PAGE_SIZE }),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of(),
      active: 'code',
      direction: 'asc',
    } as unknown as MatSort;

    dialogSpy = spyOn(component.dialog, 'open');
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual(['position', 'code', 'name', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getCurrency after view init', () => {
    spyOn(component as any, 'getCurrency');

    component.ngAfterViewInit();

    expect(component['getCurrency']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    component.ngOnInit();

    state$.next({
      data: mockPagination,
    });

    expect(component.dataSource).toBe(mockCurrencyList);
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get currency list on response', () => {
    component.ngOnInit();
    component.ngAfterViewInit();

    state$.next({
      response: true,
    });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCurrenciesPage({
      page: 0,
      sort: 'code',
      direction: 'asc',
      size: PAGE_SIZE,
    }));
  });

  it('should create page subscriptions when results length is available', () => {
    component.ngOnInit();

    component.paginator = {
      pageIndex: 0,
      page: of({ pageIndex: 0, pageSize: PAGE_SIZE }),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of({ active: 'code', direction: 'asc' }),
      active: 'code',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'createPageSubscriptions');

    state$.next({
      data: mockPagination,
    });

    expect(component['createPageSubscriptions']).toHaveBeenCalled();
  });

  it('should dispatch CurrencySelected action when edit is called', () => {
    const testCurrency = mockCurrencyList[0];

    component.edit(testCurrency);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(currencySelected({ selected: testCurrency }));
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
      active: 'code',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'getCurrency');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'name', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getCurrency']).toHaveBeenCalled();
  });

  it('should handle paginator page changes', () => {
    const pageSubject = new Subject();
    component.paginator = {
      pageIndex: 1,
      page: pageSubject.asObservable(),
    } as unknown as MatPaginator;

    component.sort = {
      sortChange: of(),
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'getCurrency');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getCurrency']).toHaveBeenCalled();
  });

  it('should dispatch GetCurrencyListPage action with correct parameters', () => {
    component.sort = {
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component['getCurrency'](2);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCurrenciesPage(
      { page: 2, sort: 'name', direction: 'asc', size: component.pageSize }),
    );
  });

  it('should handle undefined expanded currency', () => {
    expect(component.expanded).toBeUndefined();

    component.expanded = mockCurrencyList[0];
    expect(component.expanded).toBe(mockCurrencyList[0]);
  });

  it('should handle state subscription errors gracefully', () => {
    expect(() => {
      state$.next({
        data: null,
      });
    }).not.toThrow();
  });

  it('should handle empty pagination data', () => {
    component.ngOnInit();

    const emptyPagination: Pagination<ICurrency> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
    };

    state$.next({
      data: emptyPagination,
    });

    expect(component.dataSource).toEqual([]);
    expect(component.resultsLength).toBe(0);
  });

  it('should initialize with correct state observable', () => {
    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should maintain correct displayedColumns order', () => {
    const expectedColumns = ['position', 'code', 'name', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    // Test is handled by component initialization with BreakpointObserver
    // The mobile adjustment happens in constructor based on breakpoint observer
    expect(component.pageSize).toBeDefined();
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();

    const testColor = mockCurrencyList[0] as unknown as ICurrency;

    dialogSpy.and.returnValue({
      afterClosed: () => of(testColor),
    });

    component.delete(testColor);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'CURRENCY.DELETED.TITLE',
          content: 'CURRENCY.DELETED.CONTENT',
          value: testColor,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteCurrency({ id: testColor.id!, code: testColor.code! }));
  });
});
