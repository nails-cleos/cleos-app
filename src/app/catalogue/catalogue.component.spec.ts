import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { ICatalogueAll } from '../interfaces/catalogue';
import { ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { NavigationService } from '../services/navigation.service';
import { CatalogueStore } from '../store/catalogue.store';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;

  let catalogueStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    groups: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadGroups: jasmine.Spy;
    loadById: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };

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
    catalogueStoreSpy = {
      selected: signal<ICatalogueAll | undefined>(undefined),
      subErrors: signal<any>(undefined),
      groups: signal<ITreatmentGroupAll[] | undefined>([]),
      clean: jasmine.createSpy('clean'),
      loadGroups: jasmine.createSpy('loadGroups'),
      loadById: jasmine.createSpy('loadById'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
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
    expect(component.isAddModeSignal()).toBeTrue();
  });

  it('should be in edit mode when catalogueId is set', () => {
    catalogueStoreSpy.loadById.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeFalse();
    expect(catalogueStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should patch form when selectedCatalogue emits a value', () => {
    catalogueStoreSpy.selected.set(mockCatalogue);
    fixture.detectChanges();

    expect(component.getForm.name.value).toBe(mockCatalogue.name!);
    expect(component.getForm.description.value).toBe(mockCatalogue.description);
  });

  it('should set form errors when subErrors emits values', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'group', message: 'Group invalid' },
    ];
    catalogueStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(component.getForm.group.hasError('incorrect')).toBeTrue();
    expect(component.errors()['name']).toBe('Name required');
    expect(component.errors()['group']).toBe('Group invalid');
  });

  it('should filter groups correctly using filteredGroupSignal', () => {
    catalogueStoreSpy.groups.set([mockGroup, { id: '2', name: 'Another Group' }]);
    (component.getForm.group as any).setValue('A');
    fixture.detectChanges();

    const filtered = component.filteredGroupSignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('Another Group');
  });

  it('should update form values correctly on submit', () => {
    catalogueStoreSpy.create.calls.reset();
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

    expect(catalogueStoreSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'New Name',
        home: true,
        catalog: true,
      }),
      'data:image/jpeg;base64,AAA',
    );
  });

  it('should not submit when form is invalid', () => {
    catalogueStoreSpy.create.calls.reset();
    catalogueStoreSpy.update.calls.reset();
    expect(component.form.valid).toBeFalse();
    component.submit();

    expect(catalogueStoreSpy.create).not.toHaveBeenCalled();
    expect(catalogueStoreSpy.update).not.toHaveBeenCalled();
  });

  it('should not submit when image is missing', () => {
    catalogueStoreSpy.create.calls.reset();
    catalogueStoreSpy.update.calls.reset();
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

    expect(catalogueStoreSpy.create).not.toHaveBeenCalled();
    expect(catalogueStoreSpy.update).not.toHaveBeenCalled();
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
