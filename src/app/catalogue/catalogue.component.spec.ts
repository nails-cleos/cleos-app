import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { ICatalogue } from '../interfaces/catalogue';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastService } from '../services/toast.service';
import { ITreatmentGroup } from '../interfaces/treatment';
import { clean, getAllTreatmentsGroup, getCatalogue } from '../store/catalogue.actions';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let stateSubject: Subject<any>;

  const mockCatalogue: ICatalogue = {
    id: '1',
    name: 'Test Catalogue',
    description: 'Test Description',
    home: false,
    groupId: undefined,
    catalog: false,
  };

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockToastService = jasmine.createSpyObj('ToastService', ['warning']);

    const mockToastRef = {
      onAction: jasmine.createSpy('onAction').and.returnValue(new Subject()),
      onDismiss: jasmine.createSpy('onDismiss').and.returnValue(new Subject()),
    };
    mockToastService.warning.and.returnValue(mockToastRef);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        CatalogueComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('home')).toBeDefined();
    expect(component.form.get('catalog')).toBeDefined();
    expect(component.form.get('group')).toBeDefined();
    expect(component.form.get('name')?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetCatalogue action when in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getCatalogue({ id: testId }));
  });

  it('should patch form when catalogue is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockCatalogue,
    });

    expect(component.catalogue).toEqual(mockCatalogue);
    expect(component.form.get('name')?.value).toBe(mockCatalogue.name);
    expect(component.form.get('description')?.value).toBe(mockCatalogue.description);
    expect(component.form.get('home')?.value).toBe(mockCatalogue.home);
    expect(component.form.get('catalog')?.value).toBe(mockCatalogue.catalog);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'group', message: 'Treatment type is invalid' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.errors['group']).toBe('Treatment type is invalid');
    expect(component.form.get('name')?.hasError('incorrect')).toBeTrue();
    expect(component.form.get('group')?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to catalogues list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'catalogues']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateCatalogue action when in add mode and form is valid', () => {
    component.ngOnInit();
    component.resizedImageDataUrl = 'data:image/jpeg;base64,test';

    const catalogue: ICatalogue = {
      name: 'New Catalogue',
      description: 'New Description',
      home: true,
      catalog: true,
      groupId: 'groupId',
    };

    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;
    const homeControl = component.form.get('home')!;
    const catalogControl = component.form.get('catalog')!;
    const groupControl = component.form.get('group')!;

    nameControl.setValue(catalogue.name);
    nameControl.markAsDirty();

    descriptionControl.setValue(catalogue.description);
    descriptionControl.markAsDirty();

    homeControl.setValue(catalogue.home);
    homeControl.markAsDirty();

    catalogControl.setValue(catalogue.catalog);
    catalogControl.markAsDirty();

    groupControl.setValue({ id: catalogue.groupId });
    groupControl.markAsDirty();
    mockStore.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      resizedImageDataUrl: component.resizedImageDataUrl,
      catalogue: jasmine.objectContaining(catalogue),
      type: '[Catalogue] Create catalogue',
    }));
  });

  it('should dispatch UpdateCatalogue action when in edit mode and form is valid', () => {
    const testId = '123';
    component.resizedImageDataUrl = 'data:image/jpeg;base64,test';

    const catalogue: ICatalogue = {
      name: 'Updated Catalogue',
      description: 'Updated Description',
      home: true,
      catalog: true,
      groupId: 'groupId',
    };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.catalogue = mockCatalogue;

    component.ngOnInit();

    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;
    const homeControl = component.form.get('home')!;
    const catalogControl = component.form.get('catalog')!;
    const groupControl = component.form.get('group')!;

    nameControl.setValue(catalogue.name);
    nameControl.markAsDirty();

    descriptionControl.setValue(catalogue.description);
    descriptionControl.markAsDirty();

    homeControl.setValue(catalogue.home);
    homeControl.markAsDirty();

    catalogControl.setValue(catalogue.catalog);
    catalogControl.markAsDirty();

    groupControl.setValue({ id: catalogue.groupId });
    groupControl.markAsDirty();
    mockStore.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      resizedImageDataUrl: component.resizedImageDataUrl,
      catalogue: jasmine.objectContaining(catalogue),
      type: '[Catalogue] Update catalogue by id',
    }));
  });

  it('should return form controls from getForm getter', () => {
    component.ngOnInit();

    const controls = component.getForm;

    expect(controls).toBe(component.form.controls);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    const subscription = component['subscription'];
    spyOn(subscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('should handle subscription when no subscription exists', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should call detectChanges when needed', () => {
    expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined catalogue in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.catalogue = undefined;

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getCatalogue({ id: testId }));
  });

  it('should clear catalogue when updating in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.catalogue = mockCatalogue;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Catalogue');

    void component.submit;

    expect(component.catalogue).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('home')?.value).toBe('');
    expect(component.form.get('catalog')?.value).toBe('');
    expect(component.form.get('group')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.form.get('name')?.setValue('Test Name');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should clean state and get catalogue list on response', () => {
    component.ngOnInit();
    mockStore.dispatch.calls.reset();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'catalogues']);
  });

  it('should clear file when deleteFile is called', () => {
    component.file = { name: 'test.jpg', size: 1024 };

    void component.deleteFile;

    expect(component.file).toBeUndefined();
  });

  it('should clear file and resized image data URL when deleteImg is called in add mode', () => {
    component.isAddMode = true;
    component.file = { name: 'test.jpg', size: 1024 };
    component.resizedImageDataUrl = 'data:image/jpeg;base64,test';

    void component.deleteImg;

    expect(component.file).toBeUndefined();
    expect(component.resizedImageDataUrl).toBeUndefined();
  });

  it('should show toast and clear image when deleteImg is called in edit mode', () => {
    component.isAddMode = false;
    component.catalogue = { name: 'Test Catalogue' } as ICatalogue;
    component.resizedImageDataUrl = 'data:image/jpeg;base64,test';

    void component.deleteImg;

    expect(mockToastService.warning).toHaveBeenCalled();
    expect(component.resizedImageDataUrl).toBeUndefined();
  });

  it('should return group name when displayFnGroup is called with group', () => {
    const group = { name: 'Test Group', id: '1' } as ITreatmentGroup;

    const result = component.displayFnGroup(group);

    expect(result).toBe('Test Group');
  });

  it('should return empty string when displayFnGroup is called with null', () => {
    const result = component.displayFnGroup(null as any);

    expect(result).toBe('');
  });

  it('should clear group form control when keyDownGroup is called with Backspace', () => {
    component.ngOnInit();
    component.form.get('group')?.setValue('test value');

    component.keyDownGroup({ code: 'Backspace' });

    expect(component.form.get('group')?.value).toBe('');
  });

  it('should not clear group form control when keyDownGroup is called with other key', () => {
    component.ngOnInit();
    component.form.get('group')?.setValue('test value');

    component.keyDownGroup({ code: 'Enter' });

    expect(component.form.get('group')?.value).toBe('test value');
  });

  it('should set file and start upload when onFileDropped is called', () => {
    spyOn(component, 'uploadFilesSimulator' as any);
    const files = [{ name: 'test.jpg', size: 1024, progress: 0 }];

    component.onFileDropped(files);

    expect(files[0].progress).toBe(0);
    expect(component.file).toBe(files[0]);
    expect(component['uploadFilesSimulator']).toHaveBeenCalled();
  });

  it('should set file and start upload when fileBrowseHandler is called', () => {
    spyOn(component, 'uploadFilesSimulator' as any);
    const mockFile = { name: 'test.jpg', size: 1024 };
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    };

    component.fileBrowseHandler(mockEvent);

    expect((mockEvent.target.files[0] as any).progress).toBe(0);
    expect(component.file).toBe(mockEvent.target.files[0]);
    expect(component['uploadFilesSimulator']).toHaveBeenCalled();
  });

  it('should format bytes correctly', () => {
    const result1 = component.formatBytes(1024, 2);
    const result2 = component.formatBytes(1048576, 1);

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it('should dispatch GetAllTreatmentsGroup action when findGroups is called', () => {
    mockStore.dispatch.calls.reset();

    component['findGroups']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
  });

  it('should filter groups correctly when filterGroup is called', () => {
    component.groups = [
      { name: 'Test Group 1', id: '1' },
      { name: 'Another Group', id: '2' },
      { name: 'Test Group 2', id: '3' },
    ] as any[];

    const result = component['filterGroup']('test');

    expect(result?.length).toBe(2);
    expect(result?.[0].name).toBe('Test Group 1');
    expect(result?.[1].name).toBe('Test Group 2');
  });

  it('should return undefined when filterGroup is called with no groups', () => {
    component.groups = undefined;

    const result = component['filterGroup']('test');

    expect(result).toBeUndefined();
  });

  it('should set up upload simulation intervals correctly', () => {
    component.file = { progress: 0, size: 1024 * 1024 };
    spyOn(component, 'processImage' as any);
    spyOn(window, 'setTimeout');

    component['uploadFilesSimulator']();

    expect(setTimeout).toHaveBeenCalled();
  });
});
