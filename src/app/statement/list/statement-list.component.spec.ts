import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatementListComponent } from './statement-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IOfficeAll } from '../../interfaces/office';
import { DriveAccessService } from '../../services/drive-access.service';
import { NavigationService } from '../../services/navigation.service';
import { StatementStore } from '../../store/statement.store';
import { signal } from '@angular/core';
import { OfficeStore } from '../../store/office.store';

describe('StatementListComponent', () => {
  let component: StatementListComponent;
  let fixture: ComponentFixture<StatementListComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let statementStoreSpy: {
    clean: jasmine.Spy;
    upload: jasmine.Spy;
  };
  let officeStoreSpy: {
    data: ReturnType<typeof signal>;
    loadMyOffices: jasmine.Spy;
  };
  let translate: TranslateService;

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
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded']);
    statementStoreSpy = {
      clean: jasmine.createSpy('clean'),
      upload: jasmine.createSpy('upload'),
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

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [StatementListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: StatementStore, useValue: statementStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatementListComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bootstrap statement page state on init', () => {
    const freshFixture = TestBed.createComponent(StatementListComponent);
    freshFixture.detectChanges();

    expect(statementStoreSpy.clean).toHaveBeenCalled();
    expect(officeStoreSpy.loadMyOffices).toHaveBeenCalled();
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
    expect(statementStoreSpy.upload).toHaveBeenCalledWith(mockOffice.id, blob, fileName);
  });

  it('should not submit statement when required fields are missing', () => {
    component.submit();
    expect(statementStoreSpy.upload).not.toHaveBeenCalled();
  });
});
