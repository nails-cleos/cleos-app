import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyListComponent } from './currency-list.component';
import { ICurrency } from '../../interfaces/currency';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { currencySelected, deleteCurrency, getCurrenciesPage } from '../../store/currency.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyState } from '../../store/reducers/currency.reducers';

describe('CurrencyListComponent', () => {
  let component: CurrencyListComponent;
  let fixture: ComponentFixture<CurrencyListComponent>;

  let storeSpy: jasmine.SpyObj<Store<CurrencyState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<any>;

  let translate: TranslateService;

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

  let currencyList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    currencyList$ = new BehaviorSubject(mockPagination);
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
          return currencyList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [CurrencyListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    currencyList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    currencyList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    currencyList$.next(mockPagination);
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
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getCurrenciesPage({
        page: 1,
        sort: 'code',
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
      getCurrenciesPage({
        page: 0,
        sort: 'code',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch currencySelected when edit is called', () => {
    const item = mockCurrencyList[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(currencySelected({ selected: item }));
  });

  it('should dispatch deleteCurrency when dialog returns a result', () => {
    const item = mockCurrencyList[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteCurrency({ id: item.id!, code: item.code! }));
  });
});
