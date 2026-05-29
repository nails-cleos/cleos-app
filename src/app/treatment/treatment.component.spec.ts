import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { TreatmentComponent } from './treatment.component';
import { IColorAll } from '../interfaces/color';
import { ITreatmentGroupAll } from '../interfaces/treatment';
import { TreatmentState } from '../store/reducers/treatment.reducers';
import { getTreatmentGroup } from '../store/treatment.actions';

describe('TreatmentComponent', () => {
  let component: TreatmentComponent;
  let fixture: ComponentFixture<TreatmentComponent>;

  let storeSpy: jasmine.SpyObj<Store<TreatmentState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let selectedTreatment$: BehaviorSubject<any>;
  let allColors$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let histories$: BehaviorSubject<any>;
  let routeUrl$: BehaviorSubject<any>;

  const mockColor = {
    id: 'g1',
    name: 'Color 1',
  };

  const mockTreatment: Partial<ITreatmentGroupAll> = {
    id: '1',
    name: 'Test Treatment',
    description: 'Test Description',
    colors: [mockColor],
  };

  beforeEach(async () => {
    selectedTreatment$ = new BehaviorSubject<any>(undefined);
    allColors$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    histories$ = new BehaviorSubject<any>(undefined);
    routeUrl$ = new BehaviorSubject<any>([{ path: 'add' }]);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
        url: [{ path: 'add' }],
      },
      url: routeUrl$.asObservable(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return selectedTreatment$.asObservable();
        case 2:
          return allColors$.asObservable();
        case 3:
          return subErrors$.asObservable();
        case 4:
          return histories$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [TreatmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture =
      TestBed.overrideTemplate(TreatmentComponent, '<input #colorInput /> <input #nameInput />')
        .createComponent(TreatmentComponent);
    component = fixture.componentInstance;

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive mode from route and treatment id', () => {
    expect(component.mode()).toBe('add');

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
    expect(component.mode()).toBe('edit');

    routeUrl$.next([{ path: 'view' }]);
    fixture.detectChanges();
    expect(component.mode()).toBe('view');
  });

  it('should dispatch getTreatment when treatmentId emits a value', () => {
    storeSpy.dispatch.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getTreatmentGroup({ id: '123', path: 'edit' }));
  });

  it('should patch form when selectedTreatment emits', () => {
    selectedTreatment$.next(mockTreatment);
    allColors$.next([
      mockColor,
      { id: 'g2', name: 'Color 2', colors: [] },
    ]);
    fixture.detectChanges();

    const treatmentSignalValue: any = component.treatmentSignal();
    expect(treatmentSignalValue.id).toBe('1');
    expect(component.colorsSignal().length).toBe(1);
    expect(component.allColorsWritableSignal()?.some?.((g: IColorAll) => g.id === 'g2')).toBeTrue();
  });

  it('should include history on the selected treatment in view mode', () => {
    selectedTreatment$.next({
      id: 'group-1',
      treatments: [{ id: 't1', name: 'Treatment 1' }, { id: 't2', name: 'Treatment 2' }],
    });
    histories$.next([{ id: 'history-1' }]);
    component['selectedHistoryTreatmentId'].set('t2');
    fixture.detectChanges();

    const treatments = component.viewTreatmentSignal()?.treatments as any[];
    expect(treatments[0].showHistory).toBeUndefined();
    expect(treatments[1].showHistory).toBeTrue();
    expect(treatments[1].history).toEqual([{ id: 'history-1' }]);
  });

  it('should return undefined view treatment when no selected treatment exists', () => {
    selectedTreatment$.next(undefined);
    fixture.detectChanges();

    expect(component.viewTreatmentSignal()).toBeUndefined();
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createTreatment when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Treatment');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const input = component.nameInput();
    if (input) {
      input.nativeElement.value = 'treatment1';
    }

    component.addTab();
    fixture.detectChanges();
    component.treatmentsSignal()[0].time = '10:00';
    fixture.detectChanges();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      treatmentGroup: jasmine.objectContaining({
        name: 'New Treatment',
        description: 'New Description',
      }),
      type: '[Treatment] Create treatment',
    }));
  });

  it('should dispatch updateTreatment when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    fixture.componentRef.setInput('id', 'abc-123');
    selectedTreatment$.next(
      { id: 'abc-123', name: 'Old', description: 'old', treatments: [{ name: 't1', duration: 'PT10M' }] },
    );
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Treatment');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      treatmentGroup: jasmine.objectContaining({
        description: 'Updated Description',
        name: 'Updated Treatment',
      }),
      type: '[Treatment] Update treatment group by id',
    }));
  });

  it('filteredColorSignal should return colors when input empty and filter when value set', () => {
    const colors = [
      { id: '1', name: 'Test Color 1' },
      { id: '2', name: 'Another Color' },
      { id: '3', name: 'Test Color 2' },
    ];
    allColors$.next(colors);
    fixture.detectChanges();

    // when color control empty -> return all
    component.getForm.color.setValue(undefined);
    fixture.detectChanges();
    expect(component.filteredColorSignal()).toEqual(colors);

    // when color control has 'Test' -> filtered
    (component.getForm.color as any).setValue('Test');
    fixture.detectChanges();
    expect(component.filteredColorSignal()).toEqual([
      { id: '1', name: 'Test Color 1' },
      { id: '3', name: 'Test Color 2' },
    ]);
  });

  it('remove should remove color and put it back to allColorsWritableSignal', () => {
    // set initial colors
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
    expect(component.allColorsWritableSignal()?.some?.((g: any) => g.id === 'g2')).toBeTrue();
    // color input control should be reset (undefined)
    expect(component.getForm.color.value).toBeUndefined();
  });

  it('selectedColor should add selected color, remove it from allColorsWritableSignal and clear input', () => {
    const g1 = { id: 'g1', name: 'G1' } as any;
    component.colorsSignal.set([]);
    component.allColorsWritableSignal.set([g1, { id: 'g2', name: 'G2' } as any]);

    const event: any = { option: { value: g1 } };

    component.colorInput()!.nativeElement.value = 'something';

    component.selectedColor(event);
    fixture.detectChanges();

    expect(component.colorsSignal().some((g: any) => g.id === 'g1')).toBeTrue();
    expect(component.allColorsWritableSignal()?.some?.((g: any) => g.id === 'g1')).toBeFalse();
    expect(component.getForm.color.value).toBeUndefined();
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

  it('should dispatch treatmentSelected on edit', () => {
    selectedTreatment$.next(mockTreatment);
    fixture.detectChanges();

    component.edit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      path: 'edit',
      selected: mockTreatment,
      type: '[Treatment] Selected',
    }));
  });

  it('should dispatch getAllTreatmentsHistory when treatment ids are available', () => {
    selectedTreatment$.next({ id: 'group-1' });
    fixture.detectChanges();

    component.getHistory('treatment-1');

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 'group-1',
      treatmentId: 'treatment-1',
      type: '[Treatment] Get all treatments history',
    }));
  });

  it('should not dispatch getHistory when ids are missing', () => {
    storeSpy.dispatch.calls.reset();

    component.getHistory(undefined);
    expect(storeSpy.dispatch).not.toHaveBeenCalled();

    selectedTreatment$.next(undefined);
    fixture.detectChanges();
    component.getHistory('treatment-1');
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });
});
