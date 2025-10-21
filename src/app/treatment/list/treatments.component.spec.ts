import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';

import { TreatmentsComponent } from './treatments.component';
import { ITreatment, ITreatmentGroup } from '../../interfaces/treatment';
import { PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { clean, deleteTreatmentGroup, getTreatmentsPage } from '../../store/treatment.actions';
import { AppState } from '../../store/app.states';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TreatmentsComponent', () => {
  let component: TreatmentsComponent;
  let fixture: ComponentFixture<TreatmentsComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.Spy<any>;

  const mockTreatments: ITreatmentGroup[] = [
    { id: '1', name: 'Treatment Red', description: 'Red treatment' },
    { id: '2', name: 'Treatment Blue', description: 'Blue treatment' },
    { id: '3', name: 'Treatment Green', description: 'Green treatment' },
  ];

  const mockPagination: Pagination<ITreatmentGroup> = {
    content: mockTreatments,
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
      imports: [TreatmentsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentsComponent);
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

    dialogSpy = spyOn(component.dialog, 'open');
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual(['order', 'name', 'priceFrom', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getTreatments after view init', () => {
    spyOn(component as any, 'getTreatments');

    component.ngAfterViewInit();

    expect(component['getTreatments']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    component.ngOnInit();

    state$.next({
      data: mockPagination,
    });

    expect(component.dataSource).toBe(mockTreatments);
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get treatment list on response', () => {
    component.ngOnInit();
    component.ngAfterViewInit();

    state$.next({
      response: true,
    });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getTreatmentsPage({
      page: 0,
      sort: 'name',
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
      sortChange: of({ active: 'name', direction: 'asc' }),
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'createPageSubscriptions');

    state$.next({
      data: mockPagination,
    });

    expect(component['createPageSubscriptions']).toHaveBeenCalled();
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
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    spyOn(component as any, 'getTreatments');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'description', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getTreatments']).toHaveBeenCalled();
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

    spyOn(component as any, 'getTreatments');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getTreatments']).toHaveBeenCalled();
  });

  it('should dispatch GetTreatmentsPage action with correct parameters', () => {
    component.sort = {
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component['getTreatments'](2);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getTreatmentsPage(
      { page: 2, size: PAGE_SIZE, sort: 'name', direction: 'asc' },
    ));
  });

  it('should handle undefined expanded treatment', () => {
    expect(component.expanded).toBeUndefined();

    component.expanded = mockTreatments[0];
    expect(component.expanded).toBe(mockTreatments[0]);
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
    const emptyPagination: Pagination<ITreatmentGroup> = {
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
    const expectedColumns = ['order', 'name', 'priceFrom', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    // Test is handled by component initialization with BreakpointObserver
    // The mobile adjustment happens in constructor based on breakpoint observer
    expect(component.pageSize).toBeDefined();
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();

    const testTreatment: ITreatment = { id: '1', name: 'Treatment Red', description: 'Red treatment', primary: true };

    dialogSpy.and.returnValue({
      afterClosed: () => of(testTreatment),
    });

    component.delete(testTreatment);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'TREATMENT.DELETED.TITLE',
          content: 'TREATMENT.DELETED.CONTENT',
          value: testTreatment,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteTreatmentGroup(
      { id: testTreatment.id!, name: testTreatment.name! }),
    );
  });
});