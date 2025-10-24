import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalListComponent } from './additional-list.component';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IAdditional } from '../../interfaces/additional';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { additionalSelected, clean, deleteAdditional, getAdditionalPage } from '../../store/additional.actions';
import { convertDuration } from '../../util/dates';
import { AppState } from '../../store/app.states';

describe('AdditionalListComponent', () => {
  let component: AdditionalListComponent;
  let fixture: ComponentFixture<AdditionalListComponent>;

  let state$: Subject<any>;
  let breakpoint$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.Spy<any>;

  const mockAdditionalList: IAdditional[] = [
    { id: '1', name: 'Additional 1', description: '1 additional', duration: 'PT15M' },
    { id: '2', name: 'Additional 2', description: '2 additional', duration: 'PT1H30M' },
    { id: '3', name: 'Additional 3', description: '3 additional', duration: 'PT45M' },
    { id: '4', name: 'Additional 4', description: '4 additional' },
  ];

  const mockPagination: Pagination<IAdditional> = {
    content: mockAdditionalList,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    state$ = new Subject();
    breakpoint$ = new Subject();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());
    paramMapSpy.get.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        AdditionalListComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalListComponent);
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

  afterEach(() => {
    state$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual(['order', 'name', 'description', 'duration', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getAdditionalList after view init', () => {
    spyOn(component as any, 'getAdditionalList');

    component.ngAfterViewInit();

    expect(component['getAdditionalList']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    component.ngOnInit();

    state$.next({
      data: mockPagination,
    });

    expect(component.dataSource).toEqual(mockAdditionalList.map((additional: IAdditional) => {
      if (additional.duration) {
        const duration = convertDuration(additional.duration);

        return Object.assign({}, additional, { hour: duration.hour, minute: duration.minute });
      }
      return additional;
    }));
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get additional list on response', () => {
    component.ngOnInit();
    component.ngAfterViewInit();

    spyOn(component as any, 'clean');
    spyOn(component as any, 'getAdditionalList');

    state$.next({
      response: true,
    });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getAdditionalPage({ page: 0, sort: 'name', direction: 'asc', size: PAGE_SIZE }),
    );
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

  it('should dispatch AdditionalSelected action when edit is called', () => {
    const testAdditional = mockAdditionalList[0];

    component.edit(testAdditional);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(additionalSelected({ selected: testAdditional }));
  });

  it('should have delete method defined', () => {
    expect(component.delete).toBeDefined();
    expect(typeof component.delete).toBe('function');
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

    spyOn(component as any, 'getAdditionalList');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'description', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getAdditionalList']).toHaveBeenCalled();
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

    spyOn(component as any, 'getAdditionalList');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getAdditionalList']).toHaveBeenCalled();
  });

  it('should dispatch GetAdditionalListPage action with correct parameters', () => {
    component.sort = {
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component['getAdditionalList'](2);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAdditionalPage({
      page: 2,
      size: PAGE_SIZE,
      sort: 'name',
      direction: 'asc',
    }));
  });

  it('should handle undefined expanded additional', () => {
    expect(component.expandedAdditional).toBeUndefined();

    component.expandedAdditional = mockAdditionalList[0];
    expect(component.expandedAdditional).toBe(mockAdditionalList[0]);
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

    const emptyPagination: Pagination<IAdditional> = {
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
    const expectedColumns = ['order', 'name', 'description', 'duration', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    breakpoint$.next({ matches: true, breakpoints: {} });

    expect(component.pageSize).toBeDefined();
    expect(component.pageSize).toBe(MOBILE_PAGE_SIZE);
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();

    const testAdditional = mockAdditionalList[0] as unknown as IAdditional;

    dialogSpy.and.returnValue({
      afterClosed: () => of(testAdditional),
    });

    component.delete(testAdditional);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'ADDITIONAL.DELETED.TITLE',
          content: 'ADDITIONAL.DELETED.CONTENT',
          value: testAdditional,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteAdditional(
      { id: testAdditional.id!, name: testAdditional.name! }),
    );
  });
});
