import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UnavailableListComponent } from './unavailable-list.component';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { deleteUnavailable, getUnavailablePage, unavailableSelected } from '../../store/unavailable.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UnavailableState } from '../../store/reducers/unavailable.reducers';
import { IUserAll } from '../../interfaces/user';
import { getNowTimeZone } from '../../util/dates';
import { FrequencyEnum } from '../../util/helper';

describe('UnavailableListComponent', () => {
  let component: UnavailableListComponent;
  let fixture: ComponentFixture<UnavailableListComponent>;
  let storeSpy: jasmine.SpyObj<Store<UnavailableState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<any>;

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
      id: '1', description: 'Desc 1',
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
    },
  ];

  const mockPagination = {
    content: mockUnavailable,
    totalElements: 2,
  };

  let unavailableList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    unavailableList$ = new BehaviorSubject(mockPagination);
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
          return unavailableList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [UnavailableListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnavailableListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    unavailableList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    unavailableList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    unavailableList$.next(mockPagination);
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

  it('should dispatch getUnavailablePage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getUnavailablePage({
        page: 1,
        sort: 'timestamp',
        direction: 'desc',
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
      getUnavailablePage({
        page: 0,
        sort: 'timestamp',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch unavailableSelected when edit is called', () => {
    const item = mockUnavailable[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(unavailableSelected({ selected: item }));
  });

  it('should dispatch deleteUnavailable when dialog returns a result', () => {
    const item = mockUnavailable[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'UNAVAILABLE.DELETED.TITLE',
          content: 'UNAVAILABLE.DELETED.CONTENT',
          value: item,
        },
      }));

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(deleteUnavailable({ id: item.id, timestamp: item.timestamp, timeZone: item.timeZone }));
  });
});
