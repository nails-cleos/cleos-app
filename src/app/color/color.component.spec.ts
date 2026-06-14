import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { ColorComponent } from './color.component';
import { IColorAll } from './color';
import { ICommon } from '../interfaces/common';
import { ColorStore } from '../store/color.store';
import { NavigationService } from '../services/navigation.service';
import { DEFAULT_LOCALE } from '../util/dates';

describe('ColorComponent', () => {
  let component: ColorComponent;
  let fixture: ComponentFixture<ColorComponent>;

  let colorStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
  };

  const config: ICommon = {
    title: 'COLOR.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
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
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(ColorComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedColor emits', () => {
    fixture.componentRef.setInput('color', mockColor);
    fixture.detectChanges();

    expect(component.color()?.id).toBe('1');
    expect(component.getForm.name.value).toBe('Test Color');
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
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData when form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    const nameControl = component.getForm.name;
    nameControl.setValue('New Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Color',
      description: 'New Description',
    }));
  });

  it('should emit changed fields when editing an existing color', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    fixture.componentRef.setInput('color', { id: 'abc-123', name: 'Old', description: 'old' });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'Updated Description',
      name: 'Updated Color',
    }));
  });
});
