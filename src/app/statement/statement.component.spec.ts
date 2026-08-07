import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StatementComponent } from './statement.component';
import { ActivatedRoute } from '@angular/router';
import { IOfficeAll } from '../office/office';
import { DriveAccessService } from '../services/drive-access.service';
import { signal } from '@angular/core';
import { OfficeStore } from '../store/office.store';
import { NavigationService } from '../services/navigation.service';
import { DEFAULT_LOCALE, getNowTimeZone } from '../util/dates';
import { ICommon } from '../interfaces/common';
import { DocumentTypeEnum, IDocument } from '../document/document';
import { MatDatepicker } from '@angular/material/datepicker';
import { provideTranslateService } from "@ngx-translate/core";

describe('StatementComponent', () => {
  let component: StatementComponent;
  let fixture: ComponentFixture<StatementComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let officeStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    loadMyOffices: jasmine.Spy;
  };

  const config: ICommon = {
    title: 'DOCUMENT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const mockFile = new File(
    ['dummy content'],
    'statement.pdf',
    { type: 'application/pdf' },
  );

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

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded']);
    officeStoreSpy = {
      isLoading: signal(false),
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
      imports: [StatementComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatementComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bootstrap statement page state on init', () => {
    const name = 'test.pdf';
    const document: IDocument = {
      date: getNowTimeZone(),
      type: DocumentTypeEnum.statement,
      id: '123',
      name,
      office: mockOffice,
    };

    const freshFixture = TestBed.createComponent(StatementComponent);
    const freshComponent = freshFixture.componentInstance;

    freshFixture.componentRef.setInput('config', config);
    freshFixture.detectChanges();
    freshFixture.componentRef.setInput('statement', document);
    freshFixture.detectChanges();

    expect(officeStoreSpy.loadMyOffices).toHaveBeenCalled();
    expect(freshComponent.getForm.office.disabled).toBeTrue();
    expect(freshComponent.getForm.date.disabled).toBeTrue();
    expect(freshComponent.getForm.date.value).toEqual(document.date);
    expect(freshComponent.getForm.office.value).toEqual(document.office);
    expect(freshComponent.file()).toEqual({ name, progress: 100, size: 0 });
  });

  it('should display office name with displayFnOffice', () => {
    const result = component.displayFnOffice(mockOffice);
    expect(result).toBe('Office 1');
  });

  it('should return empty string when displayFnOffice receives undefined', () => {
    const result = component.displayFnOffice(undefined as any);
    expect(result).toBe('');
  });

  it('should clear office value on Backspace key', () => {
    component.getForm.office.setValue(mockOffice);
    const event = { code: 'Backspace' } as KeyboardEvent;
    component.keyDownHandler(event);
    expect(component.getForm.office.value).toBeUndefined();
  });

  it('should not clear office value on other keys', () => {
    component.getForm.office.setValue(mockOffice);
    const event = { code: 'Enter' } as KeyboardEvent;
    component.keyDownHandler(event);
    expect(component.getForm.office.value).toBe(mockOffice);
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

  it('should submit statement when all required fields are set', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    officeStoreSpy.data.set({ kind: 'list', value: [mockOffice] });
    fixture.detectChanges();
    component.getForm.date.setValue(new Date(2026, 0, 1));
    component.onSelectedFile({ raw: mockFile, name: 'testName', size: mockFile.size, progress: 100 });
    fixture.detectChanges();

    component.submit();

    const fileName = 'Statement_01-2026.pdf';
    const blob = new Blob([mockFile], { type: mockFile.type });
    expect(component.form.valid).toBeTrue();
    expect(component.fileName()).toBe(fileName);
    expect(component.blob()).toEqual(blob);
    expect(emitSpy).toHaveBeenCalledWith({
      officeId: mockOffice.id, blob, fileName,
    });
  });

  it('should not submit statement when required fields are missing', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
    component.submit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  describe('setMonthAndYear method', () => {
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
});
