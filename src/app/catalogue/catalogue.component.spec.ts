import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueComponent } from './catalogue.component';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { ICatalogueAll } from './catalogue';
import { ICommon } from '../interfaces/common';
import { ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { NavigationService } from '../services/navigation.service';
import { CatalogueStore } from '../store/catalogue.store';
import { TreatmentStore } from '../store/treatment.store';

describe('CatalogueComponent', () => {
  let component: CatalogueComponent;
  let fixture: ComponentFixture<CatalogueComponent>;

  let catalogueStoreSpy: {
    subErrors: ReturnType<typeof signal>;
  };

  let treatmentStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllGroups: jasmine.Spy;
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
  const config: ICommon = {
    title: 'CATALOGUE.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    catalogueStoreSpy = {
      subErrors: signal<any>(undefined),
    };
    treatmentStoreSpy = {
      data: signal<any>([]),
      loadAllGroups: jasmine.createSpy('loadGroups'),
    };

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedCatalogue emits a value', () => {
    fixture.componentRef.setInput('catalogue', mockCatalogue);
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
    treatmentStoreSpy.data.set({
      kind: 'list',
      value: [mockGroup, { id: '2', name: 'Another Group' }],
    });
    (component.getForm.group as any).setValue('A');
    fixture.detectChanges();

    const filtered = component.filteredGroupSignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('Another Group');
  });

  it('should update form values correctly on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
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

    expect(emitSpy).toHaveBeenCalledWith(
      {
        catalogue: jasmine.objectContaining({
          name: 'New Name',
          home: true,
          catalog: true,
        }),
        resizedImageDataUrl: 'data:image/jpeg;base64,AAA',
      },
    );
  });

  it('should not submit when form is invalid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
    expect(component.form.valid).toBeFalse();
    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not submit when image is missing', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
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

    expect(emitSpy).not.toHaveBeenCalled();
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
