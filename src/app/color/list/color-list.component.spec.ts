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
import { ColorListComponent } from './color-list.component';
import { IColor } from '../color';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorStore } from '@app/store/color.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('ColorListComponent', () => {
  let component: ColorListComponent;
  let fixture: ComponentFixture<ColorListComponent>;
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
  let colorStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    loadPage: Mock;
    clearResponse: Mock;
    delete: Mock;
  };

  const mockColor: IColor[] = [
    { id: '1', name: 'Color 1', description: 'Desc 1' },
    { id: '2', name: 'Color 2', description: 'Desc 2' },
  ];

  const mockPagination = {
    content: mockColor,
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
    colorStoreSpy = {
      data: signal({ kind: 'pagination', value: mockPagination }),
      response: signal<any>(undefined),
      isLoading: signal(false),
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
      imports: [ColorListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ColorStore, useValue: colorStoreSpy },
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

    fixture = TestBed.createComponent(ColorListComponent);
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
    colorStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    colorStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
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

  it('should dispatch getColorPage when paginatorPageIndex changes', () => {
    colorStoreSpy.loadPage.mockClear();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(colorStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = {
      firstPage: vi.fn().mockName('MatPaginator.firstPage'),
    };

    component['paginator'] = signal(paginatorMock) as any;
    colorStoreSpy.clearResponse.mockClear();
    colorStoreSpy.loadPage.mockClear();

    colorStoreSpy.response.set({ success: true } as any);
    fixture.detectChanges();

    expect(colorStoreSpy.clearResponse).toHaveBeenCalled();
    expect(colorStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch colorSelected when edit is called', () => {
    const item = mockColor[0];
    component.edit(item);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'colors',
      item.id,
    ]);
  });

  it('should dispatch deleteColor when dialog returns a result', () => {
    const item = mockColor[0];
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: {
          title: 'COLOR.DELETED.TITLE',
          content: 'COLOR.DELETED.CONTENT',
          value: item,
          variant: 'warning',
        },
      }),
    );

    expect(colorStoreSpy.delete).toHaveBeenCalledWith({
      id: item.id!,
      name: item.name!,
    });
  });
});
