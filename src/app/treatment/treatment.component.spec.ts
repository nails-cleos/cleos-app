import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreatmentComponent } from './treatment.component';
import { IColorAll } from '../color/color';
import { ITreatmentGroupAll } from './treatment';
import { TreatmentStore } from '../store/treatment.store';
import { DEFAULT_LOCALE } from '../util/dates';

describe('TreatmentComponent', () => {
  let component: TreatmentComponent;
  let fixture: ComponentFixture<TreatmentComponent>;

  let treatmentStoreSpy: {
    colors: ReturnType<typeof signal<any>>;
    subErrors: ReturnType<typeof signal<any>>;
    loadColors: jasmine.Spy;
  };

  const mockColor = {
    id: 'g1',
    name: 'Color 1',
  };

  const config = {
    title: 'TREATMENT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  const mockTreatment: Partial<ITreatmentGroupAll> = {
    id: '1',
    name: 'Test Treatment',
    description: 'Test Description',
    colors: [mockColor],
  };

  beforeEach(async () => {
    treatmentStoreSpy = {
      colors: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      loadColors: jasmine.createSpy('loadColors'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
      ],
    }).compileComponents();

    fixture =
      TestBed.overrideTemplate(TreatmentComponent, '<input #colorInput /> <input #nameInput />')
        .createComponent(TreatmentComponent);
    component = fixture.componentInstance;

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when treatment input emits', () => {
    treatmentStoreSpy.colors.set([
      mockColor,
      { id: 'g2', name: 'Color 2' },
    ] as IColorAll[]);
    fixture.componentRef.setInput('treatment', mockTreatment as ITreatmentGroupAll);
    fixture.detectChanges();
    expect(component.colorsSignal().length).toBe(1);
    expect(component.allColorsWritableSignal()?.some((g: IColorAll) => g.id === 'g2')).toBeTrue();
  });

  it('should handle form errors from subErrors signal', () => {
    treatmentStoreSpy.subErrors.set([
      { field: 'name', message: 'Name required' },
    ]);
    fixture.detectChanges();

    expect(component.errors()['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
  });

  it('should not emit when form invalid on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('');
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData when in add mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('New Treatment');
    component.getForm.name.markAsDirty();
    component.getForm.description.setValue('New Description');
    component.getForm.description.markAsDirty();

    component.nameInput()!.nativeElement.value = 'treatment1';
    component.addTab();
    fixture.detectChanges();
    component.treatmentsSignal()[0].time = '10:00';

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Treatment',
      description: 'New Description',
    }));
  });

  it('should emit submitData when in edit mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    fixture.componentRef.setInput('treatment', {
      id: 'abc-123',
      name: 'Old',
      description: 'old',
      treatments: [{ name: 't1', duration: 'PT10M', primary: true }],
    } as ITreatmentGroupAll);
    fixture.detectChanges();

    component.getForm.name.setValue('Updated Treatment');
    component.getForm.name.markAsDirty();
    component.getForm.description.setValue('Updated Description');
    component.getForm.description.markAsDirty();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'Updated Description',
      name: 'Updated Treatment',
    }));
  });

  it('filteredColorSignal should return colors when input empty and filter when value set', () => {
    const colors = [
      { id: '1', name: 'Test Color 1' },
      { id: '2', name: 'Another Color' },
      { id: '3', name: 'Test Color 2' },
    ] as IColorAll[];
    treatmentStoreSpy.colors.set(colors);
    fixture.detectChanges();

    component.getForm.color.setValue(undefined);
    fixture.detectChanges();
    expect(component.filteredColorSignal()).toEqual(colors);

    component.getForm.color.setValue('Test' as any);
    fixture.detectChanges();
    expect(component.filteredColorSignal()).toEqual([
      { id: '1', name: 'Test Color 1' },
      { id: '3', name: 'Test Color 2' },
    ]);
  });

  it('remove should remove color and put it back to allColorsWritableSignal', () => {
    treatmentStoreSpy.colors.set([
      { id: 'g1', name: 'G1' },
      { id: 'g2', name: 'G2' },
      { id: 'g3', name: 'G3' },
    ] as any);
    component.colorsSignal.set([
      { id: 'g1', name: 'G1' } as any,
      { id: 'g2', name: 'G2' } as any,
    ]);
    component.allColorsWritableSignal.set([
      { id: 'g3', name: 'G3' } as any,
    ]);
    fixture.detectChanges();

    component.remove(component.colorsSignal()[1]);
    fixture.detectChanges();

    expect(component.colorsSignal().length).toBe(1);
    expect(component.allColorsWritableSignal()?.some((g: any) => g.id === 'g2')).toBeTrue();
    expect(component.getForm.color.value).toBeUndefined();
  });

  it('selectedColor should add selected color, remove it from allColorsWritableSignal and clear input', () => {
    const g1 = { id: 'g1', name: 'G1' } as any;
    treatmentStoreSpy.colors.set([g1, { id: 'g2', name: 'G2' } as any]);
    component.colorsSignal.set([]);
    component.allColorsWritableSignal.set([g1, { id: 'g2', name: 'G2' } as any]);

    const event: any = { option: { value: g1 } };
    component.colorInput()!.nativeElement.value = 'something';

    component.selectedColor(event);
    fixture.detectChanges();

    expect(component.colorsSignal().some((g: any) => g.id === 'g1')).toBeTrue();
    expect(component.allColorsWritableSignal()?.some((g: any) => g.id === 'g1')).toBeFalse();
    expect(component.getForm.color.value).toBeUndefined();
  });

  it('should not show selected colors in filteredColorSignal', () => {
    const colors = [
      { id: 'g1', name: 'Blue' },
      { id: 'g2', name: 'Black' },
      { id: 'g3', name: 'White' },
    ] as IColorAll[];
    treatmentStoreSpy.colors.set(colors);
    component.colorsSignal.set([colors[0]]);
    fixture.detectChanges();

    expect(component.filteredColorSignal()).toEqual([colors[1], colors[2]]);

    component.getForm.color.setValue('Bl' as any);
    fixture.detectChanges();

    expect(component.filteredColorSignal()).toEqual([colors[1]]);
  });

  it('selectedColor should ignore duplicate selected events', () => {
    const color = { id: 'g1', name: 'Blue' } as any;
    treatmentStoreSpy.colors.set([color]);
    component.colorsSignal.set([color]);
    component.allColorsWritableSignal.set([]);

    component.selectedColor({ option: { value: color } } as any);
    fixture.detectChanges();

    expect(component.colorsSignal().filter(({ id }) => id === color.id).length).toBe(1);
  });

  it('sortColors should sort alphabetically ignoring case', () => {
    const allColors = [
      { name: 'Beta Color', id: '2' },
      { name: 'Alpha Color', id: '1' },
      { name: 'Alpha Color', id: '4' },
      { name: 'Gamma Color', id: '3' },
    ] as any[];
    const response = component.sortColors(allColors);
    expect(response?.[0].name).toBe('Alpha Color');
    expect(response?.[1].name).toBe('Alpha Color');
    expect(response?.[2].name).toBe('Beta Color');
    expect(response?.[3].name).toBe('Gamma Color');
  });
});
