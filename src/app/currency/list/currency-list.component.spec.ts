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
import { CurrencyListComponent } from './currency-list.component';
import { ICurrency } from '../currency';
import {
  MOBILE_PAGE_SIZE,
  PAGE_SIZE,
  Pagination,
} from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyStore } from '@app/store/currency.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('CurrencyListComponent', () => {
  let component: CurrencyListComponent;
  let fixture: ComponentFixture<CurrencyListComponent>;
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
  let dialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };
  let currencyStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    loadPage: Mock;
    clearResponse: Mock;
    delete: Mock;
  };

  const mockCurrencyList: ICurrency[] = [
    { id: '1', name: 'Euro', code: 'EUR', icon: 'euro' },
    { id: '2', name: 'Dollar', code: 'USD', icon: 'dollar' },
    { id: '3', name: 'Pesos Argentinos', code: 'ARS', icon: 'dollar' },
  ];

  const mockPagination: Pagination<ICurrency> = {
    content: mockCurrencyList,
    totalElements: 3,
    totalPages: 1,
    number: 0,
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
    currencyStoreSpy = {
      isLoading: signal(false),
      data: signal({ kind: 'pagination', value: mockPagination }),
      response: signal<any>(undefined),
      loadPage: vi.fn().mockName('loadPage'),
      clearResponse: vi.fn().mockName('clearResponse'),
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
      imports: [CurrencyListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: CurrencyStore, useValue: currencyStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(CurrencyListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    currencyStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    currencyStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
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

  it('should dispatch getCurrencyPage when paginatorPageIndex changes', () => {
    currencyStoreSpy.loadPage.mockClear();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(currencyStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'code',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = {
      firstPage: vi.fn().mockName('MatPaginator.firstPage'),
    };

    component['paginator'] = signal(paginatorMock) as any;
    currencyStoreSpy.clearResponse.mockClear();
    currencyStoreSpy.loadPage.mockClear();

    currencyStoreSpy.response.set({ success: true } as any);

    fixture.detectChanges();

    expect(currencyStoreSpy.clearResponse).toHaveBeenCalled();
    expect(currencyStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'code',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch currencySelected when edit is called', () => {
    const item = mockCurrencyList[0];
    component.edit(item);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'currency',
      item.id,
    ]);
  });

  it('should dispatch deleteCurrency when dialog returns a result', () => {
    const item = mockCurrencyList[0];
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(currencyStoreSpy.delete).toHaveBeenCalledWith({
      id: item.id!,
      code: item.code!,
    });
  });
});
