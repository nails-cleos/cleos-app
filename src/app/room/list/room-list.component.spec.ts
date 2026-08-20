import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { IAddress, IRoomAll } from '../room';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { RoomListComponent } from './room-list.component';
import { ICurrencyAll } from '@app/currency/currency';
import { DEFAULT_LOCALE, getCurrentTimeZone } from '@app/util/dates';
import { MatDialog } from '@angular/material/dialog';
import { RoomStore } from '@app/store/room.store';
import { NavigationService } from '@app/services/navigation.service';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let translateService: TranslateService;
  let dialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };
  let roomStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal<any>>;
    response: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadPage: Mock;
    selectAndNavigate: Mock;
    delete: Mock;
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
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    dialogSpy = {
      open: vi.fn().mockName('MatDialog.open'),
    };
    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    roomStoreSpy = {
      isLoading: signal(false),
      data: signal({ kind: 'pagination', value: mockPagination }),
      response: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadPage: vi.fn().mockName('loadPage'),
      selectAndNavigate: vi.fn().mockName('selectAndNavigate'),
      delete: vi.fn().mockName('delete'),
    };

    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockName('ParamMap.get'),
        },
      },
    };

    breakpointObserverSpy.observe.mockReturnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;

    translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    roomStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    roomStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
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
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(roomStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'office',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should clear response and reset paginator when response emits', () => {
    const paginatorMock = {
      firstPage: vi.fn().mockName('MatPaginator.firstPage'),
    };

    component['paginator'] = signal(paginatorMock) as any;

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
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(roomStoreSpy.delete).toHaveBeenCalledWith(item);
  });
});
