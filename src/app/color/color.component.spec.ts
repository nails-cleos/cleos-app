import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { ColorComponent } from './color.component';
import { IColorAll } from '../interfaces/color';
import { ColorStore } from '../store/color.store';
import { NavigationService } from '../services/navigation.service';

describe('ColorComponent', () => {
  let component: ColorComponent;
  let fixture: ComponentFixture<ColorComponent>;

  let colorStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };

  const mockColor: Partial<IColorAll> = {
    id: '1',
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    colorStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [ColorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ColorStore, useValue: colorStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(ColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getColor when colorId emits a value', () => {
    colorStoreSpy.loadById.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(colorStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should patch form when selectedColor emits', () => {
    colorStoreSpy.selected.set(mockColor);
    fixture.detectChanges();

    const colorSignalValue: any = component.colorSignal();
    expect(colorSignalValue.id).toBe('1');
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
    ];

    colorStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
  });

  it('should not dispatch when form invalid on submit', () => {
    colorStoreSpy.create.calls.reset();
    colorStoreSpy.update.calls.reset();

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(colorStoreSpy.create).not.toHaveBeenCalled();
    expect(colorStoreSpy.update).not.toHaveBeenCalled();
  });

  it('should dispatch createColor when in add mode and form valid', () => {
    colorStoreSpy.create.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(colorStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Color',
      description: 'New Description',
    }));
  });

  it('should dispatch updateColor when in edit mode and form valid', () => {
    colorStoreSpy.update.calls.reset();

    fixture.componentRef.setInput('id', 'abc-123');
    fixture.detectChanges();
    colorStoreSpy.selected.set({ name: 'Old', description: 'old' });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(colorStoreSpy.update).toHaveBeenCalledWith('abc-123', jasmine.objectContaining({
      description: 'Updated Description',
      name: 'Updated Color',
    }));
  });
});
