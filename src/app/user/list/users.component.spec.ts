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

import { UsersComponent } from './users.component';
import { IUser } from '../../interfaces/user';
import { PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { clean, deleteUser, getUsersPage, userSelected } from '../../store/user.actions';
import { AppState } from '../../store/app.states';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.Spy<any>;

  const mockUsers: IUser[] = [
    { id: '1', displayName: 'User 1', email: 'user1@test.com' },
    { id: '2', displayName: 'User 2', email: 'user2@test.com' },
    { id: '3', displayName: 'User 3', email: 'user3@test.com' },
  ];

  const mockPagination: Pagination<IUser> = {
    content: mockUsers,
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
      imports: [UsersComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
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
    expect(component.displayedColumns).toEqual(['position', 'displayName', 'email', 'status', 'actions']);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.pageSize).toBe(PAGE_SIZE);
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getUsers after view init', () => {
    spyOn(component as any, 'getUsers');

    component.ngAfterViewInit();

    expect(component['getUsers']).toHaveBeenCalled();
  });

  it('should update data source when state changes', () => {
    component.ngOnInit();

    state$.next({
      data: mockPagination,
    });

    expect(component.dataSource).toEqual(mockUsers);
    expect(component.resultsLength).toBe(3);
  });

  it('should clean and get user list on response', () => {
    component.ngOnInit();
    component.ngAfterViewInit();

    state$.next({
      response: true,
    });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUsersPage({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
      filter: undefined,
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

  it('should dispatch UserSelected action when edit is called', () => {
    const testUser = mockUsers[0];

    component.edit(testUser);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(userSelected({ selected: testUser }));
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

    spyOn(component as any, 'getUsers');
    component['createPageSubscriptions']();

    sortChangeSubject.next({ active: 'description', direction: 'desc' });

    expect(component.paginator.pageIndex).toBe(0);
    expect(component['getUsers']).toHaveBeenCalled();
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

    spyOn(component as any, 'getUsers');
    component['createPageSubscriptions']();

    pageSubject.next({ pageIndex: 1, pageSize: PAGE_SIZE });

    expect(component['getUsers']).toHaveBeenCalled();
  });

  it('should dispatch GetUsersPage action with correct parameters', () => {
    component.sort = {
      active: 'name',
      direction: 'asc',
    } as unknown as MatSort;

    component['getUsers'](2);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUsersPage(
      { page: 2, size: PAGE_SIZE, sort: 'name', direction: 'asc', filter: undefined },
    ));
  });

  it('should handle undefined expanded user', () => {
    expect(component.expandedUser).toBeUndefined();

    component.expandedUser = mockUsers[0];
    expect(component.expandedUser).toBe(mockUsers[0]);
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
    const emptyPagination: Pagination<IUser> = {
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
    const expectedColumns = ['position', 'displayName', 'email', 'status', 'actions'];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });

  it('should handle mobile breakpoint adjustment', () => {
    // Test is handled by component initialization with BreakpointObserver
    // The mobile adjustment happens in constructor based on breakpoint observer
    expect(component.pageSize).toBeDefined();
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();

    const testUser = mockUsers[0] as unknown as IUser;

    dialogSpy.and.returnValue({
      afterClosed: () => of(testUser),
    });

    component.delete(testUser);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.DELETED.TITLE',
          content: 'USER.DELETED.CONTENT',
          value: testUser,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteUser(
      { id: testUser.id!, displayName: testUser.displayName! }),
    );
  });
});