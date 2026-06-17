import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorListComponent } from './color-list.component';
import { IColor } from '../color';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorStore } from '../../store/color.store';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('ColorListComponent', () => {
  let component: ColorListComponent;
  let fixture: ComponentFixture<ColorListComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let colorStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    delete: jasmine.Spy;
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
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    colorStoreSpy = {
      data: signal({ kind: 'pagination', value: mockPagination }),
      response: signal<any>(undefined),
      isLoading: signal(false),
      loadPage: jasmine.createSpy('loadPage'),
      clearResponse: jasmine.createSpy('clearResponse'),
      delete: jasmine.createSpy('delete'),
    };

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ColorListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ColorStore, useValue: colorStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.use(DEFAULT_LOCALE);

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
    colorStoreSpy.loadPage.calls.reset();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(colorStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'name',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);
    colorStoreSpy.clearResponse.calls.reset();
    colorStoreSpy.loadPage.calls.reset();

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

    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'colors', item.id]);
  });

  it('should dispatch deleteColor when dialog returns a result', () => {
    const item = mockColor[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'COLOR.DELETED.TITLE',
          content: 'COLOR.DELETED.CONTENT',
          value: item,
          variant: 'warning',
        },
      }));

    expect(colorStoreSpy.delete).toHaveBeenCalledWith({ id: item.id!, name: item.name! });
  });
});
