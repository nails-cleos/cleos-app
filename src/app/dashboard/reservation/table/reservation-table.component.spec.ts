import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IReservation } from '../../../reservation/reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { ReservationTableComponent } from './reservation-table.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { IUser } from '../../../user/user';
import { IRoom } from '../../../room/room';
import { ITreatment } from '../../../treatment/treatment';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_LOCALE } from '../../../util/dates';
import { NavigationService } from '../../../services/navigation.service';
import { ReservationStore } from '../../../store/reservation.store';

describe('ReservationTableComponent', () => {
  let component: ReservationTableComponent;
  let fixture: ComponentFixture<ReservationTableComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let reservationStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    loadPage: jasmine.Spy;
    delete: jasmine.Spy;
  };
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  const customer: IUser = {
    id: 'customer1',
    displayName: 'Customer One',
  };

  const professional: IUser = {
    id: 'professional1',
    displayName: 'Professional One',
  };

  const room: IRoom = {
    id: '1',
    timeZone: 'Europe/Amsterdam',
  };

  const treatment: ITreatment = {
    primary: true,
    id: 'treatment1',
    name: 'Treatment One',
  };

  const mockReservation: IReservation[] = [
    { id: '1', timestamp: 100, room, customer, professional, treatment },
    { id: '2', timestamp: 200, room, customer, professional, treatment },
  ];

  const mockPagination = {
    content: mockReservation,
    totalElements: 2,
  };

  let breakpoint$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    reservationStoreSpy = {
      isLoading: signal(false),
      data: signal({ kind: 'pagination', value: mockPagination }),
      error: signal(undefined),
      loadPage: jasmine.createSpy('loadPage'),
      delete: jasmine.createSpy('delete'),
    };
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ReservationTableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationTableComponent);
    component = fixture.componentInstance;

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  afterEach(() => breakpoint$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    reservationStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    reservationStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(2);
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

  it('should dispatch getReservationPage when paginatorPageIndex changes', () => {
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.componentRef.setInput('professionalId', professional.id);
    fixture.componentRef.setInput('all', true);
    fixture.componentRef.setInput('roomId', room.id);
    fixture.detectChanges();

    expect(reservationStoreSpy.loadPage).toHaveBeenCalledWith(
      {
        page: 1,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        roomId: room.id,
        all: true,
        professionalId: professional.id,
      },
    );
  });

  it('should dispatch getReservationPage first time', () => {
    fixture.detectChanges();

    expect(reservationStoreSpy.loadPage).toHaveBeenCalledWith(
      {
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        roomId: undefined,
        professionalId: undefined,
        all: false,
      },
    );
  });

  it('should dispatch deleteReservation when dialog returns a result', () => {
    const item = mockReservation[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(reservationStoreSpy.delete).toHaveBeenCalledWith(item.id!, item.timestamp!, item.room!.timeZone!);
  });
});
