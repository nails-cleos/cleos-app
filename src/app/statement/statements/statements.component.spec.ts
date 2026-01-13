import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IStatement } from '../../interfaces/statement';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { getStatementsPage, statementView } from '../../store/statement.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StatementState } from '../../store/reducers/statement.reducers';
import { StatementsComponent } from './statements.component';
import { DriveAccessService } from '../../services/drive-access.service';
import { IOfficeAll } from '../../interfaces/office';

describe('StatementsComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;
  let storeSpy: jasmine.SpyObj<Store<StatementState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const mockStatement: IStatement[] = [
    { id: '1', name: 'Statement 1', date: new Date(2024, 2, 1) },
    { id: '2', name: 'Statement 2', date: new Date(2024, 1, 1) },
  ];

  const mockPagination = {
    content: mockStatement,
    totalElements: 2,
  };

  let statementList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let officeList$: BehaviorSubject<any>;

  const driveTokenSignal = signal<string>('fake-token');

  beforeEach(async () => {
    statementList$ = new BehaviorSubject(mockPagination);
    response$ = new BehaviorSubject<any>(undefined);
    officeList$ = new BehaviorSubject(undefined);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded'], { driveTokenSignal });

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
          return statementList$.asObservable();
        case 2:
          return response$.asObservable();
        case 3:
          return officeList$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [StatementsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatementsComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    statementList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    officeList$.next([mockOffice]);
    statementList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    officeList$.next([mockOffice]);
    statementList$.next(mockPagination);
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

  it('should dispatch getStatementPage when paginatorPageIndex changes', () => {
    officeList$.next([mockOffice]);
    fixture.detectChanges();
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getStatementsPage({
        officeId: mockOffice.id,
        page: 1,
        sort: 'date',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    officeList$.next([mockOffice]);
    fixture.detectChanges();
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    response$.next({ success: true });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getStatementsPage({
        officeId: mockOffice.id,
        page: 0,
        sort: 'date',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch statementSelected when edit is called', () => {
    const item = mockStatement[0];
    component.download(item);

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(statementView({ id: item.id, fileName: item.name, driveToken: driveTokenSignal() }));
  });

  it('should auto-select office when only one office is available', () => {
    const singleOffice = [mockOffice];
    officeList$.next(singleOffice);
    fixture.detectChanges();

    expect(component.getForm.office.value).toBe(mockOffice);
  });

  it('should clear office form control when keyDownHandler is called with Backspace', () => {
    component.getForm.office.setValue(mockOffice);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.office.value).toBe(undefined);
  });

  it('should filter office correctly using filteredOfficeSignal', () => {
    officeList$.next([mockOffice, { id: '2', name: 'Another Office', manager: { id: '1', displayName: 'Officer' } }]);
    (component.getForm.office as any).setValue('A');
    fixture.detectChanges();

    const filtered = component.filteredOfficeSignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('Another Office');
  });

  it('displayFnOffice should return office name', () => {
    const office = { name: 'Test Office' } as IOfficeAll;
    expect(component.displayFnOffice(office)).toBe('Test Office');
    expect(component.displayFnOffice(null as any)).toBe('');
  });
});
