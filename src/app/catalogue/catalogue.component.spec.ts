import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  let storeSpy: jasmine.SpyObj<Store<CatalogueState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

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

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
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

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

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

    component.file.set({ name: 'test', size: 100, progress: 100, image: 'data:image/jpeg;base64,AAA' });

    expect(component.form.valid).toBeTrue();
    component.submit();

    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual({
      catalogue: jasmine.objectContaining({
        name: 'New Name',
        home: true,
        catalog: true,
      }),
      resizedImageDataUrl: 'data:image/jpeg;base64,AAA',
      type: '[Catalogue] Create catalogue',
    });
  });

  it('should not submit when form is invalid', () => {
    expect(component.form.valid).toBeFalse();
    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should not submit when image is missing', () => {
    expect(component.form.valid).toBeFalse();

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

    expect(component.form.valid).toBeTrue();
    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
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
});
