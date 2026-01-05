import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { ColorComponent } from './color.component';
import { getColor } from '../store/color.actions';
import { IColorAll } from '../interfaces/color';
import { ColorState } from '../store/reducers/color.reducers';

describe('ColorComponent', () => {
  let component: ColorComponent;
  let fixture: ComponentFixture<ColorComponent>;

  let storeSpy: jasmine.SpyObj<Store<ColorState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  let colorId$: BehaviorSubject<any>;
  let selectedColor$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;

  const mockColor: Partial<IColorAll> = {
    id: '1',
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    colorId$ = new BehaviorSubject<any>(null);
    selectedColor$ = new BehaviorSubject<any>(undefined);
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
          return colorId$.asObservable();
        case 2:
          return selectedColor$.asObservable();
        case 3:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ColorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(ColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getColor when colorId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    colorId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getColor({ id: '123' }));
  });

  it('should patch form when selectedColor emits', () => {
    selectedColor$.next(mockColor);
    fixture.detectChanges();

    const colorSignalValue: any = component.colorSignal();
    expect(colorSignalValue.id).toBe('1');
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

  it('should dispatch createColor when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      color: jasmine.objectContaining({
        name: 'New Color',
        description: 'New Description',
      }),
      type: '[Color] Create color',
    }));
  });

  it('should dispatch updateColor when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    // simulate edit mode
    colorId$.next('abc-123');
    fixture.detectChanges();
    selectedColor$.next({ name: 'Old', description: 'old' });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Color');
    nameControl.markAsDirty();
    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Description');
    descriptionControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      color: jasmine.objectContaining({
        description: 'Updated Description',
        name: 'Updated Color',
      }),
      type: '[Color] Update color by id',
    }));
  });
});
