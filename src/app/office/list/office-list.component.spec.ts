import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { IOffice } from '../office';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { OfficeStore } from '@app/store/office.store';
import { OfficeListComponent } from './office-list.component';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('OfficeListComponent', () => {
  let component: OfficeListComponent;
  let fixture: ComponentFixture<OfficeListComponent>;
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
  let officeStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: Mock;
    loadPage: Mock;
    clearResponse: Mock;
    delete: Mock;
  };

  const mockOffice: IOffice[] = [
    { id: '1', name: 'Office 1' },
    { id: '2', name: 'Office 2' },
  ];

  const mockPagination = {
    content: mockOffice,
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
    officeStoreSpy = {
      isLoading: signal(false),
      data: signal<any>({ kind: 'pagination', value: mockPagination }),
      response: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
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
      imports: [OfficeListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: OfficeStore, useValue: officeStoreSpy },
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

    fixture = TestBed.createComponent(OfficeListComponent);
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
    officeStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    officeStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
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

  it('should call loadPage when paginatorPageIndex changes', () => {
    officeStoreSpy.loadPage.mockClear();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(officeStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should clear response and reset paginator when responseSignal emits', () => {
    const paginator = component['paginator']();
    paginator!.pageIndex = 1;
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    officeStoreSpy.clearResponse.mockClear();
    officeStoreSpy.loadPage.mockClear();

    officeStoreSpy.response.set({ success: true } as any);
    fixture.detectChanges();

    expect(officeStoreSpy.clearResponse).toHaveBeenCalled();
    expect(officeStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should navigate when edit is called', () => {
    const item = mockOffice[0];
    component.edit(item);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'offices',
      item.id,
    ]);
  });

  it('should call delete when dialog returns a result', () => {
    const item = mockOffice[0];
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(officeStoreSpy.delete).toHaveBeenCalledWith(item.id!, item.name!);
  });
});
