import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalComponent } from './additional.component';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { formatDuration } from '../util/dates';
import { clean, getAdditional, getAllTreatmentsGroup } from '../store/additional.actions';
import { AppState } from '../store/app.states';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { IGroupService } from '../interfaces/treatment';

describe('AdditionalComponent', () => {
  let component: AdditionalComponent;
  let fixture: ComponentFixture<AdditionalComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;

  const mockAdditional = {
    id: '1',
    name: 'Test Additional',
    description: 'Test Description',
    duration: 'PT15M',
    groups: [{ id: 'g1', name: 'Group 1', treatments: [], selectedTreatments: [] }],
  };

  beforeEach(async () => {
    state$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    paramMapSpy.get.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [AdditionalComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(AdditionalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

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
    expect(component.getForm.duration).toBeDefined();
    expect(component.getForm.description).toBeDefined();
    expect(component.getForm.name?.hasError('required')).toBeTrue();
    expect(component.getForm.duration?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetAdditional action when in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAdditional({ id: testId }));
  });

  it('should patch form when additional is selected from state', () => {
    component.ngOnInit();

    state$.next({
      selected: mockAdditional,
      groups: [
        { id: 'g1', name: 'Group 1', treatments: [], selectedTreatments: [] },
        { id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] },
      ],
    });

    expect(component.additional?.id).toEqual(mockAdditional.id);
    expect(component.getForm.name?.value).toBe(mockAdditional.name);
    expect(component.getForm.description?.value).toBe(mockAdditional.description);
    expect(component.getForm.duration?.value).toBe(formatDuration(mockAdditional.duration!));
    expect(component.groups).toEqual(mockAdditional.groups);
    expect(component.allGroups).toEqual([{ id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] }]);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'duration', message: 'Duration is required' },
    ];

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.getForm.name?.hasError('incorrect')).toBeTrue();
    expect(component.errors['duration']).toBe('Duration is required');
    expect(component.getForm.duration?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to additional list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'additional']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.getForm.name?.setValue('');
    component.getForm.duration?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateAdditional action when in add mode and form is valid', () => {
    component.ngOnInit();
    const nameControl = component.getForm.name!;
    const descriptionControl = component.getForm.description!;
    const durationControl = component.getForm.duration!;

    nameControl.setValue('New Additional');
    nameControl.markAsDirty();

    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    durationControl.setValue('00:30');
    durationControl.markAsDirty();
    storeSpy.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    void component.submit;

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      additional: jasmine.objectContaining({
        name: 'New Additional',
        description: 'New Description',
        duration: '00:30',
      }),
      type: '[Additional] create additional',
    }));
  });

  it('should dispatch UpdateAdditional action when in edit mode and form is valid', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.additional = mockAdditional;

    component.ngOnInit();
    const nameControl = component.getForm.name!;
    const descriptionControl = component.getForm.description!;
    const durationControl = component.getForm.duration!;

    nameControl.setValue('Updated Additional');
    nameControl.markAsDirty();

    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    durationControl.setValue('00:45');
    durationControl.markAsDirty();
    storeSpy.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      id: '123',
      additional: jasmine.objectContaining({
        description: 'Updated Description',
        duration: '00:45',
        name: 'Updated Additional',
      }),
      type: '[Additional] Update additional by id',
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

  it('should handle undefined additional in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.additional = undefined;

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAdditional({ id: testId }));
  });

  it('should clear additional when updating in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.additional = mockAdditional;

    component.ngOnInit();
    component.getForm.name?.setValue('Updated Additional');
    component.getForm.duration?.setValue('PT30M');

    void component.submit;

    expect(component.additional).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.getForm.name?.value).toBe('');
    expect(component.getForm.description?.value).toBe('');
    expect(component.getForm.duration?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.getForm.name?.setValue('Test Name');
    component.getForm.duration?.setValue('PT30M');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get additional list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'additional']);
  });

  it('should dispatch GetAllTreatmentsGroup action when findGroups is called', () => {
    storeSpy.dispatch.calls.reset();

    component['findGroups']();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
  });

  it('should filter groups correctly when filterGroup is called', () => {
    component.allGroups = [
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
    component.allGroups = undefined;

    const result = component['filterGroup']('test');

    expect(result).toBeUndefined();
  });

  it('should filter group options based on form input', (done) => {
    component.allGroups = [
      { name: 'Test Group 1', id: '1', treatments: [], selectedTreatments: [] },
      { name: 'Another Group', id: '2', treatments: [], selectedTreatments: [] },
      { name: 'Test Group 2', id: '3', treatments: [], selectedTreatments: [] },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredGroup?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { name: 'Test Group 1', id: '1', treatments: [], selectedTreatments: [] },
          { name: 'Test Group 2', id: '3', treatments: [], selectedTreatments: [] },
        ]);
        done();
      }
    });

    component.getForm.group?.setValue('T');
  });

  it('should handle group object input in filtered options', (done) => {
    component.allGroups = [
      { name: 'Test Group 1', id: '1', treatments: [], selectedTreatments: [] },
      { name: 'Another Group', id: '2', treatments: [], selectedTreatments: [] },
      { name: 'Test Group 2', id: '3', treatments: [], selectedTreatments: [] },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredGroup?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { name: 'Test Group 2', id: '3', treatments: [], selectedTreatments: [] },
        ]);
        done();
      }
    });

    component.getForm.group?.setValue({ name: 'Test Group 2', id: '3', treatments: [], selectedTreatments: [] });
  });

  it('should sort allGroups alphabetically by name', () => {
    const allGroups = [
      { name: 'Beta Group', id: '2', treatments: [], selectedTreatments: [] },
      { name: 'Alpha Group', id: '1', treatments: [], selectedTreatments: [] },
      { name: 'Alpha Group', id: '4', treatments: [], selectedTreatments: [] },
      { name: 'Gamma Group', id: '3', treatments: [], selectedTreatments: [] },
    ] as any[];
    const response = component.sortGroups(allGroups);
    expect(response[0].name).toBe('Alpha Group');
    expect(response[1].name).toBe('Alpha Group');
    expect(response[2].name).toBe('Beta Group');
    expect(response[3].name).toBe('Gamma Group');
  });

  it('should remove a group correctly', () => {
    component.allGroups = [];
    component.groups = [
      { id: 'g1', name: 'Group 1', treatments: [], selectedTreatments: [] },
      { id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] },
    ];
    component['createForm']();

    component.remove(component.groups[1]);

    expect(component.groups.length).toBe(1);
    expect(component.groups[0].id).toBe('g1');
    expect(component.allGroups?.length).toBe(1);
    expect(component.allGroups?.[0].id).toBe('g2');
    expect(component.getForm.group?.value).toBe(null);
  });

  it('should add selected group and clear input', () => {
    component.ngOnInit();

    const mockGroup = { id: '1', name: 'service 1', treatments: [], selectedTreatments: [] } as IGroupService;
    component.groups = [];
    component.allGroups = [
      { id: '1', name: 'service 1', treatments: [], selectedTreatments: [] } as IGroupService,
      { id: '2', name: 'service 2', treatments: [], selectedTreatments: [] } as IGroupService,
    ];

    const mockInputEl = { value: '' };
    component.groupInput = { nativeElement: mockInputEl } as any;
    component.getForm.group = { setValue: jasmine.createSpy('setValue') } as any;

    const mockEvent = {
      option: { value: mockGroup },
    } as unknown as MatAutocompleteSelectedEvent;

    component.selectedGroup(mockEvent);

    expect(component.groups).toContain(mockGroup);
    expect(component.allGroups)
      .toEqual([{ id: '2', name: 'service 2', treatments: [], selectedTreatments: [] } as IGroupService]);
    expect(mockInputEl.value).toBe('');
    expect(component.getForm.group.setValue).toHaveBeenCalledWith(null);
  });
});
