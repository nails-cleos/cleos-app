import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IAddress, IRoomAll } from '../room';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { RoomListComponent } from './room-list.component';
import { ICurrencyAll } from '../../currency/currency';
import { getCurrentTimeZone } from '../../util/dates';
import { MatDialog } from '@angular/material/dialog';
import { RoomStore } from '../../store/room.store';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let roomStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal<any>>;
    response: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    selectAndNavigate: jasmine.Spy;
    delete: jasmine.Spy;
  };

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
    paymentTypes: ['TRANSFER'],
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

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    roomStoreSpy = {
      isLoading: signal(false),
      data: signal(mockPagination),
      response: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadPage: jasmine.createSpy('loadPage'),
      selectAndNavigate: jasmine.createSpy('selectAndNavigate'),
      delete: jasmine.createSpy('delete'),
    };

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: RoomStore, useValue: roomStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    roomStoreSpy.data.set(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    roomStoreSpy.data.set(mockPagination);
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

  it('should load room page when paginatorPageIndex changes', () => {
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(roomStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'office',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should clear response and reset paginator when response emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    roomStoreSpy.response.set({ success: true });

    fixture.detectChanges();

    expect(roomStoreSpy.clean).toHaveBeenCalled();
  });

  it('should select and navigate when edit is called', () => {
    const item = mockRooms[0];
    component.edit(item);

    expect(roomStoreSpy.selectAndNavigate).toHaveBeenCalledWith(item);
  });

  it('should call delete when dialog returns a result', () => {
    const item = mockRooms[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(roomStoreSpy.delete).toHaveBeenCalledWith(item);
  });
});
