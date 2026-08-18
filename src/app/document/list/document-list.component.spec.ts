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
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { DocumentListComponent } from './document-list.component';
import { DriveAccessService } from '@app/services/drive-access.service';
import { IOfficeAll } from '@app/office/office';
import { DocumentTypeEnum, IDocument } from '../document';
import {
  getDateQuarter,
  getNowTimeZone,
  monthViewTitle,
} from '@app/util/dates';
import { DocumentStore } from '@app/store/document.store';
import { OfficeStore } from '@app/store/office.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
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
  let driveAccessServiceSpy: {
    requestAccessIfNeeded: Mock;
  };
  let documentStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: Mock;
    clearResponse: Mock;
    loadPage: Mock;
    download: Mock;
    downloadZip: Mock;
  };
  let officeStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    loadMyOffices: Mock;
  };

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const mockDocument: IDocument[] = [
    {
      id: '1',
      name: 'Document 1',
      date: new Date(2024, 2, 1),
      type: DocumentTypeEnum.expense,
    },
    {
      id: '2',
      name: 'Document 2',
      date: new Date(2024, 1, 1),
      type: DocumentTypeEnum.invoice,
    },
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

    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    driveAccessServiceSpy = {
      requestAccessIfNeeded: vi
        .fn()
        .mockName('DriveAccessService.requestAccessIfNeeded'),
    };
    documentStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(mockPagination),
      response: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      clearResponse: vi.fn().mockName('clearResponse'),
      loadPage: vi.fn().mockName('loadPage'),
      download: vi.fn().mockName('download'),
      downloadZip: vi.fn().mockName('downloadZip'),
    };
    officeStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(undefined),
      loadMyOffices: vi.fn().mockName('loadMyOffices'),
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
      imports: [DocumentListComponent],
      providers: [
        provideTranslateService(),
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: DocumentStore, useValue: documentStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
    vi.clearAllMocks();
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
    paginator!.page.emit({
      pageIndex: 1,
      previousPageIndex: 0,
      pageSize: PAGE_SIZE,
      length: 2,
    });
    fixture.detectChanges();

    expect(documentStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'date',
      direction: 'desc',
      officeId: mockOffice.id,
      size: PAGE_SIZE,
      date,
      types: undefined,
    });
  });

  it('should dispatch clean and reset paginator when responseSignal emits', () => {
    const date = getNowTimeZone();
    component.getForm.date.setValue(date);
    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    fixture.detectChanges();
    const paginatorMock = {
      firstPage: vi.fn().mockName('MatPaginator.firstPage'),
    };

    component['paginator'] = signal(paginatorMock) as any;

    documentStoreSpy.response.set({ success: true });

    fixture.detectChanges();

    expect(documentStoreSpy.clearResponse).toHaveBeenCalled();
    expect(documentStoreSpy.loadPage).toHaveBeenCalledWith(
      expect.objectContaining({
        officeId: mockOffice.id,
        date,
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

    expect(documentStoreSpy.download).toHaveBeenCalledWith({
      id: item.id,
      fileName: item.name,
    });
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
      value: [
        mockOffice,
        {
          id: '2',
          name: 'Another Office',
          manager: { id: '1', displayName: 'Officer' },
        },
      ],
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
      const mockDatepicker = {
        close: vi.fn().mockName('MatDatepicker.close'),
      };
      const newDate = getNowTimeZone();
      component.getForm.date.setValue(undefined);

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getMonth()).toBe(newDate.getMonth());
      expect(component.getForm.date.value?.getFullYear()).toBe(
        newDate.getFullYear(),
      );
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should set month and year from normalized date', () => {
      const mockDatepicker = {
        close: vi.fn().mockName('MatDatepicker.close'),
      };
      const newDate = new Date(2024, 5, 1);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getMonth()).toBe(5);
      expect(component.getForm.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should close datepicker after setting date', () => {
      const mockDatepicker = {
        close: vi.fn().mockName('MatDatepicker.close'),
      };
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
        value: [
          mockOffice,
          {
            id: '2',
            name: 'Another Office',
            manager: { id: '1', displayName: 'Officer' },
          },
        ],
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

  it('should emit add button', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.addOutput.subscribe(emitSpy);

    fixture.detectChanges();

    component.add();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit edit button', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.editOutput.subscribe(emitSpy);

    const document = {
      id: '1',
      name: 'Document 1',
      date: new Date(2024, 2, 1),
      type: DocumentTypeEnum.expense,
    };

    fixture.detectChanges();

    component.edit(document);

    expect(emitSpy).toHaveBeenCalledWith(document);
  });

  it('should emit delete button', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.deleteOutput.subscribe(emitSpy);

    const document = {
      id: '1',
      name: 'Document 1',
      date: new Date(2024, 2, 1),
      type: DocumentTypeEnum.expense,
    };

    fixture.detectChanges();

    component.delete(document);

    expect(emitSpy).toHaveBeenCalledWith(document);
  });
});
