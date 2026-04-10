import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreatmentsComponent } from './treatments.component';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { deleteTreatmentGroup, getTreatmentsPage } from '../../store/treatment.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { TreatmentState } from '../../store/reducers/treatment.reducers';

describe('TreatmentsComponent', () => {
  let component: TreatmentsComponent;
  let fixture: ComponentFixture<TreatmentsComponent>;
  let storeSpy: jasmine.SpyObj<Store<TreatmentState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<any>;

  const mockTreatments: ITreatmentGroupAll[] = [
    { id: '1', name: 'Treatment Red', description: 'Red treatment' },
    { id: '2', name: 'Treatment Blue', description: 'Blue treatment' },
    { id: '3', name: 'Treatment Green', description: 'Green treatment' },
  ];

  const mockPagination: Pagination<ITreatmentGroupAll> = {
    content: mockTreatments,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  let treatmentList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    treatmentList$ = new BehaviorSubject(mockPagination);
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
          return treatmentList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [TreatmentsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentsComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    treatmentList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    treatmentList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    treatmentList$.next(mockPagination);
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

  it('should dispatch getTreatmentPage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTreatmentsPage({
        page: 1,
        sort: 'order',
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
      getTreatmentsPage({
        page: 0,
        sort: 'order',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch deleteTreatment when dialog returns a result', () => {
    const item = mockTreatments[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'TREATMENT.DELETED.TITLE',
          content: 'TREATMENT.DELETED.CONTENT',
          value: item,
          variant: 'warning',
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteTreatmentGroup({ id: item.id!, name: item.name! }));
  });
});
