import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { ICatalogueAll } from '../interfaces/catalogue';
import { ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { CatalogueState } from '../store/reducers/catalogue.reducers';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;

  let catalogueId$: BehaviorSubject<string | null>;
  let selectedCatalogue$: BehaviorSubject<ICatalogueAll | undefined>;
  let subErrors$: BehaviorSubject<any>;
  let allGroups$: BehaviorSubject<ITreatmentGroupAll[]>;
  let action$: BehaviorSubject<void>;

  let storeSpy: jasmine.SpyObj<Store<CatalogueState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockCatalogue: ICatalogueAll = {
    blob: undefined,
    contentType: '',
    image: undefined,
    order: 0,
    id: '1',
    name: 'Test Catalogue',
    description: 'Test Description',
    home: false,
    catalog: false,
  };

  const mockGroup: ITreatmentGroupAll = { id: 'group1', name: 'Test Group' };

  beforeEach(async () => {
    catalogueId$ = new BehaviorSubject<string | null>(null);
    selectedCatalogue$ = new BehaviorSubject<ICatalogueAll | undefined>(undefined);
    subErrors$ = new BehaviorSubject<any>([]);
    allGroups$ = new BehaviorSubject<ITreatmentGroupAll[]>([]);
    action$ = new BehaviorSubject<void>(void 0);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'show']);
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
          return catalogueId$.asObservable();
        case 2:
          return selectedCatalogue$.asObservable();
        case 3:
          return allGroups$.asObservable();
        case 4:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    toastServiceSpy.warning.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in add mode when catalogueId is null', () => {
    catalogueId$.next(null);
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeTrue();
  });

  it('should be in edit mode when catalogueId is set', () => {
    catalogueId$.next('123');
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeFalse();
  });

  it('should patch form when selectedCatalogue emits a value', () => {
    selectedCatalogue$.next(mockCatalogue);
    fixture.detectChanges();

    expect(component.getForm.name.value).toBe(mockCatalogue.name!);
    expect(component.getForm.description.value).toBe(mockCatalogue.description);
  });

  it('should set form errors when subErrors emits values', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'group', message: 'Group invalid' },
    ];
    subErrors$.next(errors);
    fixture.detectChanges();

    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(component.getForm.group.hasError('incorrect')).toBeTrue();
    expect(component.errors()['name']).toBe('Name required');
    expect(component.errors()['group']).toBe('Group invalid');
  });

  it('should filter groups correctly using filteredGroupSignal', () => {
    allGroups$.next([mockGroup, { id: '2', name: 'Another Group' }]);
    (component.getForm.group as any).setValue('A');
    fixture.detectChanges();

    const filtered = component.filteredGroupSignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('Another Group');
  });

  it('should update form values correctly on submit', () => {
    const nameControl = component.getForm.name;
    nameControl.setValue('New Name');
    nameControl.markAsDirty();
    const homeControl = component.getForm.home;
    homeControl.setValue(true);
    homeControl.markAsDirty();
    const catalogControl = component.getForm.catalog;
    catalogControl.setValue(true);
    catalogControl.markAsDirty();
    const groupControl = component.getForm.group;
    groupControl.setValue(mockGroup);
    groupControl.markAsDirty();
    fixture.detectChanges();

    component.submit();

    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      catalogue: jasmine.objectContaining({
        name: 'New Name',
        home: true,
        catalog: true,
      }),
      type: '[Catalogue] Create catalogue',
    }));
  });

  it('displayFnGroup should return group name', () => {
    const group = { name: 'Test Group' } as ITreatmentGroup;
    expect(component.displayFnGroup(group)).toBe('Test Group');
    expect(component.displayFnGroup(null as any)).toBe('');
  });

  it('keyDownGroup should clear group on Backspace', () => {
    component.getForm.group.setValue(mockGroup);
    component.keyDownGroup({ code: 'Backspace' } as KeyboardEvent);
    expect(component.getForm.group.value).toBeUndefined();
  });

  it('onFileDropped should set file and start upload', () => {
    spyOn(component as any, 'uploadFilesSimulator');
    const mockFile = new File(['test content'], 'file.jpg', { type: 'image/jpeg' });
    const files = [mockFile] as any as FileList;

    component.onFileDropped(files);

    expect(component.file()).toEqual(jasmine.objectContaining({
      name: 'file.jpg',
      size: jasmine.any(Number),
      progress: 0,
      raw: mockFile,
    }));
    expect(component['uploadFilesSimulator']).toHaveBeenCalled();
  });

  it('fileBrowseHandler should set file and start upload', () => {
    spyOn(component as any, 'uploadFilesSimulator');
    const mockFile = new File(['test content'], 'file.jpg', { type: 'image/jpeg' });
    const mockTarget = {
      files: [mockFile],
    } as any as EventTarget;

    component.fileBrowseHandler(mockTarget);

    expect(component.file()).toEqual(jasmine.objectContaining({
      name: 'file.jpg',
      size: jasmine.any(Number),
      progress: 0,
      raw: mockFile,
    }));
    expect(component['uploadFilesSimulator']).toHaveBeenCalled();
  });

  it('should set resizedImageDataUrl when catalogue emits an image', () => {
    const imageCatalogue: ICatalogueAll = {
      ...mockCatalogue,
      blob: 'AAA',
      contentType: 'image/jpeg',
      treatmentGroup: mockGroup,
    };
    selectedCatalogue$.next(imageCatalogue);
    fixture.detectChanges();

    expect(component.resizedImageDataUrl()).toContain('data:image/jpeg;base64,AAA');
  });

  it('should delete file and reset resizedImageDataUrl in add mode', () => {
    component.file.set({ name: 'file.jpg', size: 1000, progress: 100, raw: new File([''], 'file.jpg') });
    component.resizedImageDataUrl.set('data:image/jpeg;base64,AAA');

    component.deleteImg();
    fixture.detectChanges();

    expect(component.file()).toBeUndefined();
    expect(component.resizedImageDataUrl()).toBeUndefined();
  });

  it('should show toast, clear image and undo in edit mode', () => {
    catalogueId$.next(mockCatalogue.id);
    selectedCatalogue$.next({ ...mockCatalogue, blob: 'AAA', contentType: 'image/jpeg' });
    fixture.detectChanges();

    component.deleteImg();

    expect(toastServiceSpy.warning).toHaveBeenCalledWith('CATALOGUE.DELETE.MESSAGE', 5000, 'button', 'undo');
    expect(component.resizedImageDataUrl()).toBe(undefined);

    action$.next();

    expect(component.resizedImageDataUrl()).toBe('data:image/jpeg;base64,AAA');
  });
});
