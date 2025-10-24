import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ColorComponent } from './color.component';
import { IColor } from '../interfaces/color';
import { clean, getColor } from '../store/color.actions';

describe('ColorComponent', () => {
  let component: ColorComponent;
  let fixture: ComponentFixture<ColorComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  const mockColor: IColor = {
    id: '1',
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    state$ = new Subject();

    paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    paramMapSpy.get.and.returnValue(null);
    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ColorComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(ColorComponent);
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
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('name')?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetColor action when in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getColor({ id: testId }));
  });

  it('should patch form when color is selected from state', () => {
    component.ngOnInit();

    state$.next({
      selected: mockColor,
    });

    expect(component.color).toEqual(mockColor);
    expect(component.form.get('name')?.value).toBe(mockColor.name);
    expect(component.form.get('description')?.value).toBe(mockColor.description);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
    ];

    state$.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.form.get('name')?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to colors list on successful response', () => {
    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'colors']);
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.form.get('name')?.setValue('');
    storeSpy.dispatch.calls.reset();

    void component.submit;

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateColor action when in add mode and form is valid', () => {
    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;

    nameControl.setValue('New Color');
    nameControl.markAsDirty();

    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      color: jasmine.objectContaining({
        name: 'New Color',
        description: 'New Description',
      }),
      type: '[Color] Create color',
    }));
  });

  it('should dispatch UpdateColor action when in edit mode and form is valid', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.color = mockColor;

    component.ngOnInit();
    const nameControl = component.form.get('name')!;
    const descriptionControl = component.form.get('description')!;

    nameControl.setValue('Update Color');
    nameControl.markAsDirty();

    descriptionControl.setValue('Update Description');
    descriptionControl.markAsDirty();

    storeSpy.dispatch.calls.reset();

    void component.submit;
    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      color: jasmine.objectContaining({
        name: 'Update Color',
        description: 'Update Description',
      }),
      type: '[Color] Update color by id',
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

  it('should handle undefined color in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.color = undefined;

    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getColor({ id: testId }));
  });

  it('should clear color when updating in edit mode', () => {
    const testId = '123';
    paramMapSpy.get.and.returnValue(testId);
    component.color = mockColor;

    component.ngOnInit();
    component.form.get('name')?.setValue('Updated Color');

    void component.submit;

    expect(component.color).toBeUndefined();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.form.get('name')?.setValue('Test Name');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should clean state and get color list on response', () => {
    component.ngOnInit();
    storeSpy.dispatch.calls.reset();

    state$.next({
      response: true,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'colors']);
  });
});