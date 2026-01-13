import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IInvoiceData } from '../../interfaces/invoice';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { getInvoicesPage, invoiceView } from '../../store/invoice.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { InvoiceState } from '../../store/reducers/invoice.reducers';
import { InvoicesComponent } from './invoices.component';
import { DriveAccessService } from '../../services/drive-access.service';

describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;
  let storeSpy: jasmine.SpyObj<Store<InvoiceState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  const mockInvoice: IInvoiceData[] = [
    { id: '1', name: 'Invoice 1', date: new Date(2024, 2, 1) },
    { id: '2', name: 'Invoice 2', date: new Date(2024, 1, 1) },
  ];

  const mockPagination = {
    content: mockInvoice,
    totalElements: 2,
  };

  let invoiceList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  const officeId = 'officeId-123';
  const driveTokenSignal = signal<string>('fake-token');

  beforeEach(async () => {
    invoiceList$ = new BehaviorSubject(mockPagination);
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
          return invoiceList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [InvoicesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.componentRef.setInput('officeId', officeId);

    fixture.detectChanges();
  });

  afterEach(() => {
    invoiceList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    invoiceList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    invoiceList$.next(mockPagination);
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

  it('should dispatch getInvoicePage when paginatorPageIndex changes', () => {
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getInvoicesPage({
        officeId: officeId,
        page: 1,
        sort: 'date',
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
      getInvoicesPage({
        officeId: officeId,
        page: 0,
        sort: 'date',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch invoiceSelected when edit is called', () => {
    const item = mockInvoice[0];
    component.view(item);

    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(invoiceView({ id: item.id, fileName: item.name, driveToken: driveTokenSignal() }));
  });
});
