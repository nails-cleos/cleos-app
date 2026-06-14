import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IReservation } from '../../../reservation/reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { deleteReservation, getPage } from '../../../store/actions/reservation.actions';
import { ActivatedRoute } from '@angular/router';
import { ReservationTableComponent } from './reservation-table.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { IUser } from '../../../user/user';
import { IRoom } from '../../../room/room';
import { ITreatment } from '../../../treatment/treatment';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_LOCALE } from '../../../util/dates';

describe('ReservationTableComponent', () => {
  let component: ReservationTableComponent;
  let fixture: ComponentFixture<ReservationTableComponent>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let translate: TranslateService;
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

  let reservationList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let isLoading$: BehaviorSubject<boolean>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  beforeEach(async () => {
    reservationList$ = new BehaviorSubject(mockPagination);
    response$ = new BehaviorSubject<any>(undefined);
    isLoading$ = new BehaviorSubject<boolean>(false);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch', 'select']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return reservationList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });
    storeSpy.select.and.returnValue(isLoading$.asObservable());

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ReservationTableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationTableComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  afterEach(() => {
    reservationList$.complete();
    response$.complete();
    isLoading$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    reservationList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    reservationList$.next(mockPagination);
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPage({
        page: 1,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        roomId: room.id,
        professionalId: professional.id,
        all: true,
      }),
    );
  });

  it('should dispatch getReservationPage first time', () => {
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPage({
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
        roomId: undefined,
        professionalId: undefined,
        all: false,
      }),
    );
  });

  it('should dispatch deleteReservation when dialog returns a result', () => {
    const item = mockReservation[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      deleteReservation({ id: item.id!, timestamp: item.timestamp!, timeZone: item.room!.timeZone! }));
  });
});
