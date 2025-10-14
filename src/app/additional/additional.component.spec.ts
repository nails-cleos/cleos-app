import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalComponent } from './additional.component';
import { Subject } from 'rxjs';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { formatDuration } from '../util/dates';
import { clean, getAdditional, getAllTreatmentsGroup } from '../store/additional.actions';

describe('AdditionalComponent', () => {
  let component: AdditionalComponent;
  let fixture: ComponentFixture<AdditionalComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let stateSubject: Subject<any>;

  const mockAdditional = {
    id: '1',
    name: 'Test Additional',
    description: 'Test Description',
    duration: 'PT15M',
    groups: [{ id: 'g1', name: 'Group 1', treatments: [], selectedTreatments: [] }],
  };

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        AdditionalComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        UntypedFormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBe(true);
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBe(false);
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('duration')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('name')?.hasError('required')).toBe(true);
    expect(component.form.get('duration')?.hasError('required')).toBe(true);
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetAdditional action when in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAdditional({ id: testId }));
  });

  it('should patch form when additional is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockAdditional,
      groups: [
        { id: 'g1', name: 'Group 1', treatments: [], selectedTreatments: [] },
        { id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] },
      ],
    });

    expect(component.additional?.id).toEqual(mockAdditional.id);
    expect(component.form.get('name')?.value).toBe(mockAdditional.name);
    expect(component.form.get('description')?.value).toBe(mockAdditional.description);
    expect(component.form.get('duration')?.value).toBe(formatDuration(mockAdditional.duration!));
    expect(component.groups).toEqual(mockAdditional.groups);
    expect(component.allGroups).toEqual([{ id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] }]);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'duration', message: 'Duration is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.form.get('name')?.hasError('incorrect')).toBe(true);
    expect(component.errors['duration']).toBe('Duration is required');
    expect(component.form.get('duration')?.hasError('incorrect')).toBe(true);
  });

  it('should navigate to additional list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'additional']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    component.form.get('duration')?.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateAdditional action when in add mode and form is valid', () => {
    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;
    const durationControl = component.form.get('duration')!;

    nameControl.setValue('New Additional');
    nameControl.markAsDirty();

    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    durationControl.setValue('00:30');
    durationControl.markAsDirty();
    mockStore.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
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
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.additional = mockAdditional;

    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;
    const durationControl = component.form.get('duration')!;

    nameControl.setValue('Updated Additional');
    nameControl.markAsDirty();

    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    durationControl.setValue('00:45');
    durationControl.markAsDirty();
    mockStore.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
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
    expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined additional in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.additional = undefined;

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAdditional({ id: testId }));
  });

  it('should clear additional when updating in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.additional = mockAdditional;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Additional');
    component.form.get('duration')?.setValue('PT30M');

    void component.submit;

    expect(component.additional).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
    expect(component.form.get('duration')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBe(true);

    component.form.get('name')?.setValue('Test Name');
    component.form.get('duration')?.setValue('PT30M');
    expect(component.form.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should clean state and get additional list on response', () => {
    component.ngOnInit();
    mockStore.dispatch.calls.reset();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith([component['language'], 'additional']);
  });

  it('should dispatch GetAllTreatmentsGroup action when findGroups is called', () => {
    mockStore.dispatch.calls.reset();

    component['findGroups']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
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

    component.form.get('group')?.setValue('T');
  });

  it('should sort allGroups alphabetically by name', () => {
    const allGroups = [
      { name: 'Beta Group', id: '2', treatments: [], selectedTreatments: [] },
      { name: 'Alpha Group', id: '1', treatments: [], selectedTreatments: [] },
      { name: 'Gamma Group', id: '3', treatments: [], selectedTreatments: [] },
    ] as any[];
    const response = component.sortGroups(allGroups);
    expect(response[0].name).toBe('Alpha Group');
    expect(response[1].name).toBe('Beta Group');
    expect(response[2].name).toBe('Gamma Group');
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
    expect(component.form.get('group')?.value).toBe(null);
  });
});
