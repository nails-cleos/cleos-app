import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { documentDownloadZip, documentView, getDocumentsPage } from '../store/document.actions';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DocumentState } from '../store/reducers/document.reducers';
import { DocumentComponent } from './document.component';
import { DriveAccessService } from '../services/drive-access.service';
import { IOfficeAll } from '../interfaces/office';
import { DocumentTypeEnum, IDocument } from '../interfaces/document';
import { getDateFormat, getDateQuarter, getNowTimeZone, monthViewTitle } from '../util/dates';
import { MatDatepicker } from '@angular/material/datepicker';

describe('DocumentsComponent', () => {
  let component: DocumentComponent;
  let fixture: ComponentFixture<DocumentComponent>;
  let storeSpy: jasmine.SpyObj<Store<DocumentState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const mockDocument: IDocument[] = [
    { id: '1', name: 'Document 1', date: new Date(2024, 2, 1), type: DocumentTypeEnum.expense },
    { id: '2', name: 'Document 2', date: new Date(2024, 1, 1), type: DocumentTypeEnum.invoice },
  ];

  const mockPagination = {
    content: mockDocument,
    totalElements: 2,
  };

  let documentList$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;
  let officeList$: BehaviorSubject<any>;

  beforeEach(async () => {
    documentList$ = new BehaviorSubject(mockPagination);
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
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded']);

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
          return documentList$.asObservable();
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
      imports: [DocumentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    documentList$.complete();
    response$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    officeList$.next([mockOffice]);
    documentList$.next(mockPagination);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    officeList$.next([mockOffice]);
    documentList$.next(mockPagination);
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

  it('should dispatch getDocumentPage when paginatorPageIndex changes', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    officeList$.next([mockOffice]);
    fixture.detectChanges();
    component.paginatorPageIndex.set(1);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getDocumentsPage({
        officeId: mockOffice.id,
        date: getDateFormat(date),
        page: 1,
        sort: 'date',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    component.getForm.date.setValue(getNowTimeZone());
    officeList$.next([mockOffice]);
    fixture.detectChanges();
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    response$.next({ success: true });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getDocumentsPage({
        officeId: mockOffice.id,
        date: getDateFormat(date),
        page: 0,
        sort: 'date',
        direction: 'desc',
        size: PAGE_SIZE,
      }),
    );
  });

  it('should dispatch documentSelected when edit is called', () => {
    const item = mockDocument[0];
    component.download(item);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(documentView({ id: item.id, fileName: item.name }));
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

  describe('setMonthAndYear', () => {
    it('should set month and year from undefined date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = getNowTimeZone();
      component.getForm.date.setValue(undefined);

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getMonth()).toBe(newDate.getMonth());
      expect(component.getForm.date.value?.getFullYear()).toBe(newDate.getFullYear());
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should set month and year from normalized date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 5, 1);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getMonth()).toBe(5);
      expect(component.getForm.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should close datepicker after setting date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 3, 1);
      component.getForm.date.setValue(new Date());

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('downloadZip', () => {
    it('should dispatch download zip action', () => {
      const date = new Date(2024, 0, 1);
      component.getForm.date.setValue(date);
      officeList$.next([mockOffice]);
      fixture.detectChanges();

      component.downloadZip();

      expect(storeSpy.dispatch).toHaveBeenCalledWith(documentDownloadZip({
        officeId: mockOffice.id,
        date: getDateFormat(date),
        fileName: `${mockOffice.name} Q${getDateQuarter(date)} ${monthViewTitle(date)}.zip`,
      }));
    });

    it('should not dispatch download zip action if office is not selected', () => {
      const date = new Date(2024, 0, 1);
      component.getForm.date.setValue(date);
      officeList$.next([mockOffice, { id: '2', name: 'Another Office', manager: { id: '1', displayName: 'Officer' } }]);
      fixture.detectChanges();

      component.downloadZip();

      expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
        type: documentDownloadZip.type,
      }));
    });

    it('should not dispatch download zip action if date is not set', () => {
      component.getForm.date.setValue(undefined);
      officeList$.next([mockOffice]);
      fixture.detectChanges();

      component.downloadZip();

      expect(storeSpy.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
        type: documentDownloadZip.type,
      }));
    });
  });
});
