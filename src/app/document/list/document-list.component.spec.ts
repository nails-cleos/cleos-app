import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { DocumentListComponent } from './document-list.component';
import { DriveAccessService } from '../../services/drive-access.service';
import { IOfficeAll } from '../../office/office';
import { DocumentTypeEnum, IDocument } from '../document';
import { getDateQuarter, getNowTimeZone, monthViewTitle } from '../../util/dates';
import { MatDatepicker } from '@angular/material/datepicker';
import { DocumentStore } from '../../store/document.store';
import { OfficeStore } from '../../store/office.store';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let documentStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    clearResponse: jasmine.Spy;
    loadPage: jasmine.Spy;
    download: jasmine.Spy;
    downloadZip: jasmine.Spy;
  };
  let officeStoreSpy: {
    data: ReturnType<typeof signal>;
    loadMyOffices: jasmine.Spy;
  };

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

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded']);
    documentStoreSpy = {
      data: signal<any>(mockPagination),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      clearResponse: jasmine.createSpy('clearResponse'),
      loadPage: jasmine.createSpy('loadPage'),
      download: jasmine.createSpy('download'),
      downloadZip: jasmine.createSpy('downloadZip'),
    };
    officeStoreSpy = {
      data: signal<any>(undefined),
      loadMyOffices: jasmine.createSpy('loadMyOffices'),
    };

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [DocumentListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: DocumentStore, useValue: documentStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;

    const translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bootstrap document page state on init', () => {
    const freshFixture = TestBed.createComponent(DocumentListComponent);
    freshFixture.detectChanges();

    expect(documentStoreSpy.clean).toHaveBeenCalled();
    expect(officeStoreSpy.loadMyOffices).toHaveBeenCalled();
  });

  it('should compute dataSourceSignal correctly', () => {
    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    documentStoreSpy.data.set(mockPagination as any);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    documentStoreSpy.data.set(mockPagination as any);
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
    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    fixture.detectChanges();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(documentStoreSpy.loadPage).toHaveBeenCalledWith({
      officeId: mockOffice.id,
      date,
      page: 1,
      sort: 'date',
      direction: 'desc',
      size: PAGE_SIZE,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    fixture.detectChanges();
    const paginatorMock = jasmine.createSpyObj('MatPaginator', ['firstPage']);

    component['paginator'] = signal(paginatorMock);

    documentStoreSpy.response.set({ success: true });

    fixture.detectChanges();

    expect(documentStoreSpy.clearResponse).toHaveBeenCalled();
    expect(documentStoreSpy.loadPage).toHaveBeenCalledWith(jasmine.objectContaining({
      officeId: mockOffice.id,
      date,
      page: 0,
      sort: 'date',
      direction: 'desc',
      size: PAGE_SIZE,
    }));
  });

  it('should dispatch documentSelected when edit is called', () => {
    const item = mockDocument[0];
    component.download(item);

    expect(documentStoreSpy.download).toHaveBeenCalledWith({ id: item.id, fileName: item.name });
  });

  it('should auto-select office when only one office is available', () => {
    const singleOffice = [mockOffice];
    officeStoreSpy.data.set({ kind: 'list', value: singleOffice });
    fixture.detectChanges();

    expect(component.getForm.office.value).toBe(mockOffice);
  });

  it('should clear office form control when keyDownHandler is called with Backspace', () => {
    component.getForm.office.setValue(mockOffice);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.office.value).toBe(undefined);
  });

  it('should filter office correctly using filteredOfficeSignal', () => {
    officeStoreSpy.data.set({
      kind: 'list',
      value: [mockOffice, { id: '2', name: 'Another Office', manager: { id: '1', displayName: 'Officer' } }],
    });
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
      officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
      fixture.detectChanges();

      component.downloadZip();

      expect(documentStoreSpy.downloadZip).toHaveBeenCalledWith({
        officeId: mockOffice.id,
        date,
        fileName: `${mockOffice.name} Q${getDateQuarter(date)} ${monthViewTitle(date)}.zip`,
      });
    });

    it('should not dispatch download zip action if office is not selected', () => {
      const date = new Date(2024, 0, 1);
      component.getForm.date.setValue(date);
      officeStoreSpy.data.set({
        kind: 'list',
        value: [mockOffice, { id: '2', name: 'Another Office', manager: { id: '1', displayName: 'Officer' } }],
      });
      fixture.detectChanges();

      component.downloadZip();

      expect(documentStoreSpy.downloadZip).not.toHaveBeenCalled();
    });

    it('should not dispatch download zip action if date is not set', () => {
      component.getForm.date.setValue(undefined);
      officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
      fixture.detectChanges();

      component.downloadZip();

      expect(documentStoreSpy.downloadZip).not.toHaveBeenCalled();
    });
  });
});
