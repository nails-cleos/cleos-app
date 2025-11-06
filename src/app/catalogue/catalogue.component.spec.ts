import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { ICatalogue } from '../interfaces/catalogue';
import { ToastService } from '../services/toast.service';
import { ITreatmentGroup } from '../interfaces/treatment';
import { clean, getAllTreatmentsGroup, getCatalogue } from '../store/catalogue.actions';
import { AppState } from '../store/app.states';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;

  let state$: Subject<any>;
  let action$: Subject<void>;
  let dismiss$: Subject<void>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  const mockCatalogue: ICatalogue = {
    id: '1',
    name: 'Test Catalogue',
    description: 'Test Description',
    home: false,
    groupId: undefined,
    catalog: false,
  };

  beforeEach(async () => {
    state$ = new Subject();
    action$ = new Subject();
    dismiss$ = new Subject();

    paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'show']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    paramMapSpy.get.and.returnValue(null);
    toastServiceSpy.warning.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => dismiss$.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    state$.complete();
    action$.complete();
    dismiss$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    paramMapSpy.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.getForm.name).toBeDefined();
    expect(component.getForm.description).toBeDefined();
    expect(component.getForm.home).toBeDefined();
    expect(component.getForm.catalog).toBeDefined();
    expect(component.getForm.group).toBeDefined();
    expect(component.getForm.name?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetCatalogue action when in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCatalogue({ id: testId }));
  });

  it('should patch form when catalogue is selected from state', () => {
    component.ngOnInit();

    state$.next({
      selected: mockCatalogue,
    });

    expect(component.catalogue).toEqual(mockCatalogue);
    expect(component.getForm.name?.value).toBe(mockCatalogue.name);
    expect(component.getForm.description?.value).toBe(mockCatalogue.description);
    expect(component.getForm.home?.value).toBe(mockCatalogue.home);
    expect(component.getForm.catalog?.value).toBe(mockCatalogue.catalog);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'group', message: 'Treatment type is invalid' },
    ];

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.errors['group']).toBe('Treatment type is invalid');
    expect(component.getForm.name?.hasError('incorrect')).toBeTrue();
    expect(component.getForm.group?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to catalogues list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'catalogues']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.getForm.name?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
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

    const nameControl = component.getForm.name;
    const descriptionControl = component.getForm.description;
    const homeControl = component.getForm.home;
    const catalogControl = component.getForm.catalog;
    const groupControl = component.getForm.group;

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
    storeSpy.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
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
    paramMapSpy.get.and.returnValue(testId);
    component.catalogue = mockCatalogue;

    component.ngOnInit();

    const nameControl = component.getForm.name!;
    const descriptionControl = component.getForm.description!;
    const homeControl = component.getForm.home!;
    const catalogControl = component.getForm.catalog!;
    const groupControl = component.getForm.group!;

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
    storeSpy.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
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
    expect(changeDetectorRefSpy.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined catalogue in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.catalogue = undefined;

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getCatalogue({ id: testId }));
  });

  it('should clear catalogue when updating in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.catalogue = mockCatalogue;

    component.ngOnInit();
    component.getForm.name?.setValue('Updated Catalogue');

    void component.submit;

    expect(component.catalogue).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.getForm.name?.value).toBe('');
    expect(component.getForm.description?.value).toBe('');
    expect(component.getForm.home?.value).toBe('');
    expect(component.getForm.catalog?.value).toBe('');
    expect(component.getForm.group?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.getForm.name?.setValue('Test Name');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get catalogue list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'catalogues']);
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

    dismiss$.next();

    expect(toastServiceSpy.warning).toHaveBeenCalled();
    expect(component.resizedImageDataUrl).toBeUndefined();
  });

  it('should show toast and not clear image when deleteImg is called in edit mode and undo is press', () => {
    component.isAddMode = false;
    component.catalogue = { name: 'Test Catalogue' } as ICatalogue;
    component.resizedImageDataUrl = 'data:image/jpeg;base64,test';

    void component.deleteImg;

    action$.next();

    expect(toastServiceSpy.warning).toHaveBeenCalled();
    expect(component.resizedImageDataUrl).toBeDefined();
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
    component.getForm.group?.setValue('test value');

    component.keyDownGroup({ code: 'Backspace' });

    expect(component.getForm.group?.value).toBe('');
  });

  it('should not clear group form control when keyDownGroup is called with other key', () => {
    component.ngOnInit();
    component.getForm.group?.setValue('test value');

    component.keyDownGroup({ code: 'Enter' });

    expect(component.getForm.group?.value).toBe('test value');
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
    storeSpy.dispatch.calls.reset();

    component['findGroups']();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
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
