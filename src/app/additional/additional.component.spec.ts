import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { AdditionalComponent } from './additional.component';
import { getAdditional } from '../store/additional.actions';
import { ITreatmentGroupAll } from '../interfaces/treatment';
import { IAdditionalAll } from '../interfaces/additional';
import { AdditionalState } from '../store/reducers/additional.reducers';

describe('AdditionalComponent', () => {
  let component: AdditionalComponent;
  let fixture: ComponentFixture<AdditionalComponent>;

  let storeSpy: jasmine.SpyObj<Store<AdditionalState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let additionalId$: BehaviorSubject<any>;
  let selectedAdditional$: BehaviorSubject<any>;
  let allGroups$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;

  const mockGroup = {
    id: 'g1',
    name: 'Group 1',
    treatments: [],
    selectedTreatments: [],
  };

  const mockAdditional: Partial<IAdditionalAll> = {
    id: '1',
    name: 'Test Additional',
    description: 'Test Description',
    duration: 'PT15M',
    groups: [mockGroup],
  };

  beforeEach(async () => {
    additionalId$ = new BehaviorSubject<any>(null);
    selectedAdditional$ = new BehaviorSubject<any>(undefined);
    allGroups$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
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
          return additionalId$.asObservable();
        case 2:
          return selectedAdditional$.asObservable();
        case 3:
          return allGroups$.asObservable();
        case 4:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [AdditionalComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture =
      TestBed.overrideTemplate(AdditionalComponent, '<input #groupInput />').createComponent(AdditionalComponent);
    component = fixture.componentInstance;

    // Make sure translate has a language so component.language is meaningful
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture.detectChanges(); // kick off effects / toSignal subscriptions
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getAdditional when additionalId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    additionalId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAdditional({ id: '123' }));
  });

  it('should patch form when selectedAdditional emits', () => {
    selectedAdditional$.next(mockAdditional);
    allGroups$.next([
      mockGroup,
      { id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] },
    ]);
    fixture.detectChanges();

    const additionalSignalValue: any = component.additionalSignal();
    expect(additionalSignalValue.id).toBe('1');
    expect(component.groupsSignal().length).toBe(1);
    expect(component.allGroupsWritableSignal()?.some?.((g: ITreatmentGroupAll) => g.id === 'g2')).toBeTrue();
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'duration', message: 'Duration required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(errs['duration']).toBe('Duration required');
    expect(component.getForm.duration.hasError('incorrect')).toBeTrue();
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    (component.getForm.duration as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createAdditional when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Additional');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();
    const durationControl = component.getForm.duration;
    durationControl.setValue('00:30');
    durationControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      additional: jasmine.objectContaining({
        name: 'New Additional',
        description: 'New Description',
        duration: '00:30',
      }),
      type: '[Additional] Create additional',
    }));
  });

  it('should dispatch updateAdditional when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    // simulate edit mode
    additionalId$.next('abc-123');
    fixture.detectChanges();
    selectedAdditional$.next({ name: 'Old', description: 'old', duration: 'PT15M' });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Additional');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();
    const durationControl = component.getForm.duration;
    durationControl.setValue('00:45');
    durationControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      additional: jasmine.objectContaining({
        description: 'Updated Description',
        duration: '00:45',
        name: 'Updated Additional',
      }),
      type: '[Additional] Update additional by id',
    }));
  });

  it('filteredGroupSignal should return groups when input empty and filter when value set', () => {
    const groups = [
      { id: '1', name: 'Test Group 1' },
      { id: '2', name: 'Another Group' },
      { id: '3', name: 'Test Group 2' },
    ];
    allGroups$.next(groups);
    fixture.detectChanges();

    // when group control empty -> return all
    component.getForm.group.setValue(undefined);
    fixture.detectChanges();
    expect(component.filteredGroupSignal()).toEqual(groups);

    // when group control has 'Test' -> filtered
    (component.getForm.group as any).setValue('Test');
    fixture.detectChanges();
    expect(component.filteredGroupSignal()).toEqual([
      { id: '1', name: 'Test Group 1' },
      { id: '3', name: 'Test Group 2' },
    ]);
  });

  it('remove should remove group and put it back to allGroupsWritableSignal', () => {
    // set initial groups
    component.groupsSignal.set([
      { id: 'g1', name: 'G1' } as any,
      { id: 'g2', name: 'G2' } as any,
    ]);
    component.allGroupsWritableSignal.set([
      { id: 'g3', name: 'G3' } as any,
    ]);
    fixture.detectChanges();

    component.remove(component.groupsSignal()[1]);
    fixture.detectChanges();

    expect(component.groupsSignal().length).toBe(1);
    expect(component.allGroupsWritableSignal()?.some?.((g: any) => g.id === 'g2')).toBeTrue();
    // group input control should be reset (undefined)
    expect(component.getForm.group.value).toBeUndefined();
  });

  it('selectedGroup should add selected group, remove it from allGroupsWritableSignal and clear input', () => {
    const g1 = { id: 'g1', name: 'G1' } as any;
    component.groupsSignal.set([]);
    component.allGroupsWritableSignal.set([g1, { id: 'g2', name: 'G2' } as any]);

    const event: any = { option: { value: g1 } };

    component.groupInput().nativeElement.value = 'something';

    component.selectedGroup(event);
    fixture.detectChanges();

    expect(component.groupsSignal().some((g: any) => g.id === 'g1')).toBeTrue();
    expect(component.allGroupsWritableSignal()?.some?.((g: any) => g.id === 'g1')).toBeFalse();
    expect(component.getForm.group.value).toBeUndefined();
  });

  it('sortGroups should sort alphabetically ignoring case', () => {
    const allGroups = [
      { name: 'Beta Group', id: '2' },
      { name: 'Alpha Group', id: '1' },
      { name: 'Alpha Group', id: '4' },
      { name: 'Gamma Group', id: '3' },
    ] as any[];
    const response = component.sortGroups(allGroups);
    expect(response[0].name).toBe('Alpha Group');
    expect(response[1].name).toBe('Alpha Group');
    expect(response[2].name).toBe('Beta Group');
    expect(response[3].name).toBe('Gamma Group');
  });
});
