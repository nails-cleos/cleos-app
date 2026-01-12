import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdditionalListComponent } from './additional-list.component';
import { IAdditional } from '../../interfaces/additional';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { additionalSelected, deleteAdditional, getAdditionalPage } from '../../store/additional.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdditionalState } from '../../store/reducers/additional.reducers';

describe('AdditionalListComponent', () => {
  let component: AdditionalListComponent;
  let fixture: ComponentFixture<AdditionalListComponent>;
  let storeSpy: jasmine.SpyObj<Store<AdditionalState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<any>;

  const mockAdditional: IAdditional[] = [
    { id: '1', name: 'Additional 1', description: 'Desc 1', duration: 'PT15M' },
    { id: '2', name: 'Additional 2', description: 'Desc 2', duration: 'PT30M' },
  ];

  const mockPagination = {
    content: mockAdditional,
    totalElements: 2,
  };

  let additionalList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    additionalList$ = new BehaviorSubject(mockPagination);
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
          return additionalList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [AdditionalListComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    additionalList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    additionalList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
    expect(data?.[0].hour).toBeDefined();
    expect(data?.[0].minute).toBeDefined();
  });

  it('should compute resultsLengthSignal correctly', () => {
    additionalList$.next(mockPagination);
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

  it('should dispatch getAdditionalPage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getAdditionalPage({
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
      getAdditionalPage({
        page: 0,
        sort: 'order',
        direction: 'asc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch additionalSelected when edit is called', () => {
    const item = mockAdditional[0];
    component.edit(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(additionalSelected({ selected: item }));
  });

  it('should dispatch deleteAdditional when dialog returns a result', () => {
    const item = mockAdditional[0];
    dialogSpy.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteAdditional({ id: item.id!, name: item.name! }));
  });
});
