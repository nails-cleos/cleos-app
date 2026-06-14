import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { IUser, IUserAll, User } from '../user';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserStore } from '../../store/user.store';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  let userStoreSpy: jasmine.SpyObj<InstanceType<typeof UserStore>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let breakpoint$: BehaviorSubject<any>;
  let paginationSignal: WritableSignal<Pagination<IUserAll> | undefined>;
  let responseSignal: WritableSignal<any>;
  let isLoadingSignal: WritableSignal<boolean>;

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
    paginationSignal = signal(mockPagination);
    responseSignal = signal(undefined);
    isLoadingSignal = signal(false);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    userStoreSpy = jasmine.createSpyObj<InstanceType<typeof UserStore>>('UserStore', [
      'loadPage',
      'clean',
      'selectAndNavigate',
      'delete',
      'restore',
      'resendToken',
      'mergeUsers',
      'setRole',
    ]);
    Object.assign(userStoreSpy, {
      pagination: paginationSignal.asReadonly(),
      response: responseSignal.asReadonly(),
      isLoading: isLoadingSignal.asReadonly(),
    });
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [UserListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: UserStore, useValue: userStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    paginationSignal.set(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    paginationSignal.set(mockPagination);
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

  it('should load users when filter changes', () => {
    userStoreSpy.loadPage.calls.reset();
    const filterValue = ' filterValue ';
    component.getForm.filter.setValue(filterValue);
    fixture.detectChanges();

    expect(userStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'displayName',
      direction: 'asc',
      size: PAGE_SIZE,
      filter: filterValue.trim().toLowerCase(),
    });
  });

  it('should reset the paginator when responseSignal emits', () => {
    const paginator = component['paginator']();

    if (!paginator) {
      return;
    }

    responseSignal.set({ success: true });
    fixture.detectChanges();

    expect(userStoreSpy.clean).toHaveBeenCalled();
  });

  it('should select and navigate when edit is called', () => {
    const item = mockUsers[0];
    component.edit(item);

    expect(userStoreSpy.selectAndNavigate).toHaveBeenCalledWith(item);
  });

  it('should delete when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.DELETED.TITLE',
          content: 'USER.DELETED.CONTENT',
          value: item,
          variant: 'warning',
        },
      }));

    expect(userStoreSpy.delete).toHaveBeenCalledWith(item.id, item.displayName);
  });

  it('should restore when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.restore(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
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

    expect(userStoreSpy.restore).toHaveBeenCalledWith(item.id, restoreUser);
  });

  it('should resend invite when dialog returns a result', () => {
    const item = mockUsers[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.sendInvite(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'USER.ACTIVATION_RESEND.TITLE',
          content: 'USER.ACTIVATION_RESEND.CONTENT',
          value: item,
        },
      }));

    expect(userStoreSpy.resendToken).toHaveBeenCalledWith(item.id);
  });

  it('should merge when dialog returns a result', () => {
    const oldUser = mockUsers[0];
    const newUser = mockUsers[1];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(oldUser),
    } as any);

    component.merge(newUser);

    expect(userStoreSpy.mergeUsers).toHaveBeenCalledWith(oldUser.id, newUser.id);
  });
});
