import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IDiscount } from '../discount';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { DiscountListComponent } from './discount-list.component';
import { MatDialog } from '@angular/material/dialog';
import { DiscountStore } from '@app/store/discount.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('DiscountListComponent', () => {
  let component: DiscountListComponent;
  let fixture: ComponentFixture<DiscountListComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let discountStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    clearResponse: jasmine.Spy;
    loadPage: jasmine.Spy;
    delete: jasmine.Spy;
    sendToCustomers: jasmine.Spy;
  };

  const mockDiscount: IDiscount[] = [
    { id: '1', name: 'Discount 1', description: 'Desc 1' },
    { id: '2', name: 'Discount 2', description: 'Desc 2' },
  ];

  const mockPagination = {
    content: mockDiscount,
    totalElements: 2,
  };

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    discountStoreSpy = {
      isLoading: signal(false),
      data: signal<any>({ kind: 'paginationDiscount', value: mockPagination }),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      clearResponse: jasmine.createSpy('clearResponse'),
      loadPage: jasmine.createSpy('loadPage'),
      delete: jasmine.createSpy('delete'),
      sendToCustomers: jasmine.createSpy('sendToCustomers'),
    };

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [DiscountListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountListComponent);
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
    discountStoreSpy.data.set({ kind: 'paginationDiscount', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should not compute dataSourceSignal when is not paginationDiscount', () => {
    discountStoreSpy.data.set({ kind: 'list', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBeUndefined();
  });

  it('should compute resultsLengthSignal correctly', () => {
    discountStoreSpy.data.set({ kind: 'paginationDiscount', value: mockPagination });
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
    discountStoreSpy.loadPage.calls.reset();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(discountStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);
    discountStoreSpy.clearResponse.calls.reset();
    discountStoreSpy.loadPage.calls.reset();

    discountStoreSpy.response.set({ success: true });

    fixture.detectChanges();

    expect(discountStoreSpy.clearResponse).toHaveBeenCalled();
    expect(discountStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch discountSelected when edit is called', () => {
    const item = mockDiscount[0];
    component.edit(item);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['discounts', item.id]);
  });

  it('should dispatch deleteDiscount when dialog returns a result', () => {
    const item = mockDiscount[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(discountStoreSpy.delete).toHaveBeenCalledWith(item.id!, item.name!);
  });
});
