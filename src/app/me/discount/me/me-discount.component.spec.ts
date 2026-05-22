import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DiscountType, IUserDiscount } from '../../../interfaces/discount';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { getMyDiscountsPage } from '../../../store/discount.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { MeDiscountComponent } from './me-discount.component';
import { DiscountState } from '../../../store/reducers/discount.reducers';

describe('MeDiscountComponent', () => {
  let component: MeDiscountComponent;
  let fixture: ComponentFixture<MeDiscountComponent>;

  let navigateSpy: jasmine.Spy;
  let storeSpy: jasmine.SpyObj<Store<DiscountState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translateService: TranslateService;

  const mockDiscount: IUserDiscount[] = [
    {
      id: '1', discountCustomer: {
        id: '1',
        name: 'Discount 1',
        description: 'Desc 1',
        amount: 10,
        type: DiscountType.money,
        currency: {
          code: 'EUR',
        },
      },
      used: false,
    }, {
      id: '2', discountCustomer: {
        id: '2',
        name: 'Discount 2',
        description: 'Desc 2',
        amount: 10,
        type: DiscountType.money,
        currency: {
          code: 'EUR',
        },
      },
      used: true,
    },
  ];

  const mockPagination = {
    content: mockDiscount,
    totalElements: 2,
  };

  let discountList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    discountList$ = new BehaviorSubject(mockPagination);
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

    // Define order of .pipe() calls
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return discountList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MeDiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(MeDiscountComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    discountList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    discountList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    discountList$.next(mockPagination);
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

  it('should dispatch getDiscountPage when paginatorPageIndex changes', () => {
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getMyDiscountsPage({
        page: 1,
        sort: 'discountCustomer.name',
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
      getMyDiscountsPage({
        page: 0,
        sort: 'discountCustomer.name',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should navigate when click on used', () => {
    const item = mockDiscount[0];
    component.useDiscount(item);

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'me', 'reservation'], { state: { discountId: item.id } });
  });
});
