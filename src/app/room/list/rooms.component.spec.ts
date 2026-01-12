import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IAddress, IRoomAll } from '../../interfaces/room';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { deleteRoom, getRoomsPage, roomSelected } from '../../store/room.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RoomState } from '../../store/reducers/room.reducers';
import { RoomsComponent } from './rooms.component';
import { ICurrencyAll } from '../../interfaces/currency';
import { getCurrentTimeZone } from '../../util/dates';
import { PaymentType } from '../../interfaces/payment';

describe('RoomsComponent', () => {
  let component: RoomsComponent;
  let fixture: ComponentFixture<RoomsComponent>;
  let storeSpy: jasmine.SpyObj<Store<RoomState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<any>;

  const address: IAddress = {
    id: 1,
    name: 'Main Location',
    location: { x: 0, y: 0 },
  };

  const currency: ICurrencyAll = {
    id: 'currency-id',
    code: 'EUR',
    icon: 'euro',
    name: 'Euro',
  };

  const mockRoom: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address,
    currency,
    office: {
      id: 'office-id',
      name: 'Main Office',
      manager: {
        id: 'manager-id',
      },
    },
    timeZone: getCurrentTimeZone(),
    paymentTypes: [PaymentType.transfer],
    primary: true,
  };

  const mockRooms: IRoomAll[] = [
    { ...mockRoom, id: 'room-1' },
    { ...mockRoom, id: 'room-2' },
  ];

  const mockPagination = {
    content: mockRooms,
    totalElements: 2,
  };

  let roomList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    roomList$ = new BehaviorSubject(mockPagination);
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
          return roomList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    roomList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    roomList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    roomList$.next(mockPagination);
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

  it('should dispatch getRoomPage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getRoomsPage({
        page: 1,
        sort: 'office',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    response$.next({ success: true });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getRoomsPage({
        page: 0,
        sort: 'office',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch roomSelected when edit is called', () => {
    const item = mockRooms[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(roomSelected({ selected: item, redirect: true }));
  });

  it('should dispatch deleteRoom when dialog returns a result', () => {
    const item = mockRooms[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteRoom({ id: item.id!, room: item }));
  });
});
