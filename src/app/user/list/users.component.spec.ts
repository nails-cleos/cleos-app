import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { UsersComponent } from './users.component';
import { IUser, IUserAll, User } from '../../interfaces/user';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { UserState } from '../../store/reducers/user.reducers';
import { deleteUser, getUsersPage, mergeUsers, resendToken, restore, userSelected } from '../../store/user.actions';
import { signal } from '@angular/core';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  let storeSpy: jasmine.SpyObj<Store<UserState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<any>;

  let userList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  const mockUsers = [
    { id: '1', displayName: 'User 1', email: 'user1@test.com' },
    { id: '2', displayName: 'User 2', email: 'user2@test.com' },
    { id: '3', displayName: 'User 3', email: 'user3@test.com' },
  ] as IUserAll[];

  const mockPagination: Pagination<IUserAll> = {
    content: mockUsers,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    userList$ = new BehaviorSubject(mockPagination);
    response$ = new BehaviorSubject<any>(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

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
          return userList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [UsersComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    userList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    userList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    userList$.next(mockPagination);
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

  it('should dispatch getUsersPage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getUsersPage({
        page: 1,
        sort: 'displayName',
        direction: 'asc',
        size: PAGE_SIZE,
        filter: undefined,
      }),
    );
  });

  it('should dispatch getUsersPage when filter changes', () => {
    const filterValue = ' filterValue ';
    component.getForm.filter.setValue(filterValue);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getUsersPage({
        page: 0,
        sort: 'displayName',
        direction: 'asc',
        size: PAGE_SIZE,
        filter: filterValue.trim().toLowerCase(),
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    response$.next({ success: true });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getUsersPage({
        page: 0,
        sort: 'displayName',
        direction: 'asc',
        size: PAGE_SIZE,
        filter: undefined,
      }),
    );
  });

  it('should dispatch userSelected when edit is called', () => {
    const item = mockUsers[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(userSelected({ selected: item }));
  });

  it('should dispatch deleteUser when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.DELETED.TITLE',
          content: 'USER.DELETED.CONTENT',
          value: item,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteUser({ id: item.id, displayName: item.displayName }));
  });

  it('should dispatch restore when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.restore(item);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.RESTORE.TITLE',
          content: 'USER.RESTORE.CONTENT',
          value: item,
        },
      }));

    const restoreUser: IUser = new User();
    restoreUser.id = item.id;
    restoreUser.deleted = false;

    expect(storeSpy.dispatch).toHaveBeenCalledWith(restore({ id: item.id, user: restoreUser }));
  });

  it('should dispatch sendInvite when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.sendInvite(item);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.ACTIVATION_RESEND.TITLE',
          content: 'USER.ACTIVATION_RESEND.CONTENT',
          value: item,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(resendToken({ id: item.id }));
  });

  it('should dispatch merge when dialog returns a result', () => {
    const oldUser = mockUsers[0];
    const newUser = mockUsers[1];
    dialogSpy.and.returnValue({
      afterClosed: () => of(oldUser),
    } as any);

    component.merge(newUser);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(mergeUsers({ oldUserId: oldUser.id, newUserId: newUser.id }));
  });
});

