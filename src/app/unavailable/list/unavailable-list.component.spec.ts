import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UnavailableListComponent } from './unavailable-list.component';
import { IUnavailableAll } from '../unavailable';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { IUserAll } from '../../user/user';
import { DEFAULT_LOCALE, getNowTimeZone } from '../../util/dates';
import { FrequencyEnum } from '../../util/helper';
import { MatDialog } from '@angular/material/dialog';
import { UnavailableStore } from '../../store/unavailable.store';
import { NavigationService } from '../../services/navigation.service';

describe('UnavailableListComponent', () => {
  let component: UnavailableListComponent;
  let fixture: ComponentFixture<UnavailableListComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translateService: TranslateService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let unavailableStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    delete: jasmine.Spy;
  };

  const mockProfessional: IUserAll = {
    id: 'prof-1',
    displayName: 'Professional 1',
    email: 'email',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockUnavailable: IUnavailableAll[] = [
    {
      id: '1',
      description: 'Desc 1',
      start: '',
      timestamp: getNowTimeZone().getTime() / 1000,
      end: '',
      duration: 'PT1H',
      professional: mockProfessional,
      repeat: FrequencyEnum.none,
      allDay: false,
    },
    {
      id: '2',
      description: 'Desc 2',
      start: '',
      timestamp: getNowTimeZone().getTime() / 1000,
      end: '',
      duration: '',
      professional: mockProfessional,
      repeat: FrequencyEnum.none,
      allDay: true,
      type: 'BLOCK_AGENDA',
    },
  ];

  const mockPagination = {
    content: mockUnavailable,
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
    unavailableStoreSpy = {
      isLoading: signal(false),
      data: signal(mockPagination),
      response: signal<any>(undefined),
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
      imports: [UnavailableListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, {
      COMMON: {
        TIME_ZONE: {
          TITLE: 'Time Zone',
          PROFESSIONAL_INFO: 'You are in a different time zone than <b>{{value}}</b>.',
        },
      },
    });

    fixture = TestBed.createComponent(UnavailableListComponent);
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
    unavailableStoreSpy.data.set(mockPagination);
    fixture.detectChanges();

    expect(component.dataSourceSignal()?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    unavailableStoreSpy.data.set(mockPagination);
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

  it('should loadPage when paginatorPageIndex changes', () => {
    unavailableStoreSpy.loadPage.calls.reset();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(unavailableStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
    });
  });

  it('should clear response and reload first page when response emits', () => {
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);
    unavailableStoreSpy.clearResponse.calls.reset();
    unavailableStoreSpy.loadPage.calls.reset();

    unavailableStoreSpy.response.set({ success: true } as any);
    fixture.detectChanges();

    expect(unavailableStoreSpy.clearResponse).toHaveBeenCalled();
    expect(unavailableStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'timestamp',
      direction: 'desc',
      size: PAGE_SIZE,
    });
  });

  it('should navigate to the unavailable detail page when edit is called', () => {
    component.edit(mockUnavailable[0]);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['unavailable', mockUnavailable[0].id]);
  });

  it('should navigate to the block agenda detail page when edit is called for block agenda', () => {
    component.edit(mockUnavailable[1]);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['unavailable', 'block-agenda', mockUnavailable[1].id]);
  });

  it('should delete when dialog returns a result', () => {
    const item = mockUnavailable[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(unavailableStoreSpy.delete).toHaveBeenCalledWith({
      id: item.id,
      timestamp: item.timestamp,
      timeZone: item.timeZone,
    });
  });
});
