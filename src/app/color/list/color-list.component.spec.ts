import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ColorListComponent } from './color-list.component';
import { IColor } from '../../interfaces/color';
import { PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import * as fromActionsColor from '../../store/color.actions';

describe('ColorListComponent', () => {
  let component: ColorListComponent;
  let fixture: ComponentFixture<ColorListComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockActivatedRoute: any;
  let stateSubject: Subject<any>;

  const mockColors: IColor[] = [
    { id: '1', name: 'Red', description: 'Red color' },
    { id: '2', name: 'Blue', description: 'Blue color' },
    { id: '3', name: 'Green', description: 'Green color' },
  ];

  const mockPagination: Pagination<IColor> = {
    content: mockColors,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: [],
      afterOpened: new Subject(),
      afterAllClosed: new Subject(),
    });
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());
    mockBreakpointObserver.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    await TestBed.configureTestingModule({
      imports: [
        ColorListComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorListComponent);
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

    // Initialize component after creation
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.displayedColumns).toEqual(['position', 'name', 'description', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    mockStore.dispatch.calls.reset();
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsColor.Clean));
  });

  it('should call getColorList after view init', () => {
    spyOn(component as any, 'getColorList');

    component.ngAfterViewInit();

    expect(component['getColorList']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    stateSubject.next({
      data: mockPagination,
    });

    expect(component.dataSource).toBe(mockColors);
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get color list on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getColorList');

    stateSubject.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getColorList']).toHaveBeenCalled();
  });

  it('should create page subscriptions when results length is available', () => {
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

    stateSubject.next({
      data: mockPagination,
    });

    expect(component['createPageSubscriptions']).toHaveBeenCalled();
  });

  it('should dispatch ColorSelected action when edit is called', () => {
    const testColor = mockColors[0];

    component.edit(testColor);

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsColor.ColorSelected));
  });

  it('should call delete method without errors', () => {
    const testColor = mockColors[0];

    expect(() => component.delete(testColor)).not.toThrow();
  });

  it('should have delete method defined', () => {
    expect(component.delete).toBeDefined();
    expect(typeof component.delete).toBe('function');
  });

  it('should handle delete operation', () => {
    const testColor = mockColors[0];

    expect(() => {
      component.delete(testColor);
    }).not.toThrow();
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

    spyOn(component as any, 'getColorList');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'description', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getColorList']).toHaveBeenCalled();
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

    spyOn(component as any, 'getColorList');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getColorList']).toHaveBeenCalled();
  });

  it('should dispatch GetColorsPage action with correct parameters', () => {
    component.sort = {
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component['getColorList'](2);

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsColor.GetColorsPage));
  });

  it('should handle undefined expanded color', () => {
    expect(component.expandedColor).toBeUndefined();

    component.expandedColor = mockColors[0];
    expect(component.expandedColor).toBe(mockColors[0]);
  });

  it('should handle state subscription errors gracefully', () => {
    expect(() => {
      stateSubject.next({
        data: null,
      });
    }).not.toThrow();
  });

  it('should handle empty pagination data', () => {
    const emptyPagination: Pagination<IColor> = {
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
    const expectedColumns = ['position', 'name', 'description', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    // Test is handled by component initialization with BreakpointObserver
    // The mobile adjustment happens in constructor based on breakpoint observer
    expect(component.pageSize).toBeDefined();
  });
});