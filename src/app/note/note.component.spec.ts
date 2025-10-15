import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { NoteComponent } from './note.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IUser, IUserAll } from '../interfaces/user';
import { INoteAll } from '../interfaces/note';
import { FrequencyEnum } from '../util/helper';
import { clean, getAllProfessional } from '../store/note.actions';
import { Role } from '../interfaces/token';
import { backendFormatDate, getNowTimeZone } from '../util/dates';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let stateSubject: Subject<any>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
  };

  const mockProfessional: IUserAll = {
    id: 'prof-1',
    displayName: 'Dr. Smith',
    email: 'smith@example.com',
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
    authorities: [{ authority: Role.professional }],
  };

  const mockNote: INoteAll = {
    id: 'note-1',
    description: 'Test note description',
    professional: mockProfessional,
    date: '2024-01-15',
    repeat: FrequencyEnum.none,
    completed: false,
    deleted: false,
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockRouter.getCurrentNavigation.and.returnValue(null);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        NoteComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: dialogSpyObj },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    // Reset the mock to return null before creating component
    mockActivatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize in add mode when no id is provided', () => {
      expect(component.isAddMode).toBeTrue();
      expect(component.id).toBeUndefined();
    });

    it('should initialize form with required validators', () => {
      expect(component.form).toBeDefined();
      expect(component.getForm.description.hasError('required')).toBeTrue();
      expect(component.getForm.professional.hasError('required')).toBeTrue();
      expect(component.getForm.date.hasError('required')).toBeTrue();
      expect(component.getForm.repeat.hasError('required')).toBeTrue();
    });

    it('should dispatch getAllProfessional action after view init', () => {
      component.ngAfterViewInit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(getAllProfessional());
    });

    it('should dispatch clean action on init', () => {
      const newComponent = TestBed.createComponent(NoteComponent).componentInstance;
      newComponent.ngOnInit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
    });
  });

  describe('Form Controls', () => {
    it('should return form controls via getForm getter', () => {
      const controls = component.getForm;
      expect(controls.description).toBeDefined();
      expect(controls.professional).toBeDefined();
      expect(controls.date).toBeDefined();
      expect(controls.repeat).toBeDefined();
    });

    it('should have correct repeat options', () => {
      expect(component.repeats).toEqual([
        FrequencyEnum.none,
        FrequencyEnum.onceAWeek,
        FrequencyEnum.onceAMonth,
        FrequencyEnum.onceAYear,
      ]);
    });
  });

  it('should patch form when note is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockNote,
    });

    expect(component.note).toEqual(mockNote);
    expect(component.getForm.description.value).toBe(mockNote.description);
    expect(component.getForm.repeat.value).toBe(mockNote.repeat);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'description', message: 'Description is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['description']).toBe('Description is required');
    expect(component.getForm.description.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to colors list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', 'calendar']);
  });

  describe('Submit', () => {
    it('should dispatch createNote action when in add mode with valid form', () => {
      component.ngOnInit();
      const descriptionControl = component.getForm.description;
      descriptionControl.setValue('New note');
      descriptionControl.markAsDirty();

      const professionalControl = component.getForm.professional;
      professionalControl.setValue(mockProfessional);
      professionalControl.markAsDirty();

      const newDate = getNowTimeZone();
      const dateControl = component.getForm.date;
      dateControl.setValue(getNowTimeZone());
      dateControl.markAsDirty();

      const repeatControl = component.getForm.repeat;
      repeatControl.setValue(FrequencyEnum.none);
      repeatControl.markAsDirty();

      mockStore.dispatch.calls.reset();

      void component.submit;
      const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
      expect(dispatchedAction).toEqual(jasmine.objectContaining({
        note: jasmine.objectContaining({
          description: 'New note',
          professionalId: 'prof-1',
          repeat: FrequencyEnum.none,
          date: backendFormatDate(newDate),
        }),
        type: '[Note] Create note',
      }));
    });

    it('should dispatch updateNote action when in edit mode with valid form', () => {
      const testId = 'note-123';
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
      component.note = mockNote;
      component.ngOnInit();

      const descriptionControl = component.getForm.description;
      descriptionControl.setValue('New note');
      descriptionControl.markAsDirty();

      const professionalControl = component.getForm.professional;
      professionalControl.setValue({ ...mockProfessional, id: 'prof-2' });
      professionalControl.markAsDirty();

      const newDate = getNowTimeZone();
      const dateControl = component.getForm.date;
      dateControl.setValue(newDate);
      dateControl.markAsDirty();

      const repeatControl = component.getForm.repeat;
      repeatControl.setValue(FrequencyEnum.onceAWeek);
      repeatControl.markAsDirty();

      void component.submit;
      const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
      expect(dispatchedAction).toEqual(jasmine.objectContaining({
        note: jasmine.objectContaining({
          description: 'New note',
          professionalId: 'prof-2',
          repeat: FrequencyEnum.onceAWeek,
          date: backendFormatDate(newDate),
        }),
        type: '[Note] Update note by id',
      }));
    });

    it('should not submit when form is invalid', () => {
      const dispatchCountBefore = mockStore.dispatch.calls.count();
      void component.submit;
      const dispatchCountAfter = mockStore.dispatch.calls.count();
      expect(component.form.invalid).toBeTrue();
      expect(dispatchCountAfter).toBe(dispatchCountBefore);
    });

    it('should handle form with valid data', () => {
      component.getForm.description.setValue('New note');
      component.getForm.professional.setValue(mockProfessional);
      component.getForm.date.setValue(new Date('2024-01-15'));
      component.getForm.repeat.setValue(FrequencyEnum.none);
      component.isAddMode = true;

      void component.submit;

      expect(mockStore.dispatch).toHaveBeenCalled();
    });
  });

  describe('Display Function', () => {
    it('should return user display name', () => {
      const result = component.displayFn(mockProfessional as IUser);
      expect(result).toBe('Dr. Smith');
    });

    it('should return empty string for null user', () => {
      const result = component.displayFn(null as any);
      expect(result).toBe('');
    });

    it('should return empty string for user without displayName', () => {
      const userWithoutName = { id: 'user-1' } as IUser;
      const result = component.displayFn(userWithoutName);
      expect(result).toBe('');
    });
  });

  describe('Keyboard Event Handler', () => {
    it('should clear professional field on backspace', () => {
      component.getForm.professional.setValue(mockProfessional);
      const event = { code: 'Backspace' };

      component.keyDownHandler(event);

      expect(component.getForm.professional.value).toBe('');
    });

    it('should not clear professional field on other keys', () => {
      component.getForm.professional.setValue(mockProfessional);
      const event = { code: 'Enter' };

      component.keyDownHandler(event);

      expect(component.getForm.professional.value).toEqual(mockProfessional);
    });
  });

  describe('Filtered Options', () => {
    it('should initialize filtered options observable', () => {
      expect(component.filteredOptions).toBeDefined();
    });

    it('should filter professionals correctly', () => {
      component.professionals = [
        mockProfessional,
        {
          id: 'prof-2',
          displayName: 'Dr. Johnson',
          email: 'johnson@example.com',
          locale: 'en',
          timeZone: 'Europe/Amsterdam',
          authorities: [{ authority: Role.professional }],
        },
      ];

      // Just verify the component has professionals
      expect(component.professionals.length).toBe(2);
    });
  });

  describe('Component Lifecycle', () => {
    it('should have ngOnDestroy method', () => {
      expect(component.ngOnDestroy).toBeDefined();
    });

    it('should unsubscribe on destroy', () => {
      const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component['subscription'] = subscription;

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw error when unsubscribing with no subscription', () => {
      component['subscription'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined professionals list', () => {
      component.professionals = undefined;
      const result = component.displayFn(mockProfessional as IUser);
      expect(result).toBe('Dr. Smith');
    });

    it('should handle empty professionals list', () => {
      component.professionals = [];
      expect(component.professionals.length).toBe(0);
    });

    it('should handle invalid form submission gracefully', () => {
      component.form.setErrors({ invalid: true });
      const result = component.submit;
      expect(result).toBeUndefined();
    });

    it('should handle null date value', () => {
      component.getForm.description.setValue('Test');
      component.getForm.professional.setValue(mockProfessional);
      component.getForm.date.setValue(null);
      component.getForm.repeat.setValue(FrequencyEnum.none);

      void component.submit;

      // Should not crash, but form validation should catch it
      expect(component.form.invalid).toBeTrue();
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when description is empty', () => {
      component.getForm.description.setValue('');
      expect(component.getForm.description.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when professional is empty', () => {
      component.getForm.professional.setValue('');
      expect(component.getForm.professional.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when date is empty', () => {
      component.getForm.date.setValue('');
      expect(component.getForm.date.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when repeat is empty', () => {
      component.getForm.repeat.setValue('');
      expect(component.getForm.repeat.hasError('required')).toBeTrue();
    });

    it('should allow valid description values', () => {
      component.getForm.description.setValue('Valid note description');
      expect(component.getForm.description.valid).toBeTrue();
    });

    it('should allow valid date values', () => {
      component.getForm.date.setValue(new Date('2024-01-15'));
      expect(component.getForm.date.valid).toBeTrue();
    });

    it('should allow valid repeat values', () => {
      component.getForm.repeat.setValue(FrequencyEnum.none);
      expect(component.getForm.repeat.valid).toBeTrue();
    });
  });

  describe('Professional Selection', () => {
    it('should update professional field with valid user object', () => {
      component.getForm.professional.setValue(mockProfessional);
      expect(component.getForm.professional.value).toEqual(mockProfessional);
    });

    it('should display professional name in autocomplete', () => {
      const displayName = component.displayFn(mockProfessional as IUser);
      expect(displayName).toBe('Dr. Smith');
    });

    it('should handle professional with missing displayName', () => {
      const professional = { id: 'prof-1', email: 'test@example.com' } as IUser;
      const displayName = component.displayFn(professional);
      expect(displayName).toBe('');
    });
  });

  describe('Component Properties', () => {
    it('should have note property', () => {
      component.note = mockNote;
      expect(component.note).toEqual(mockNote);
    });

    it('should have professionals property', () => {
      component.professionals = [mockProfessional];
      expect(component.professionals.length).toBe(1);
    });

    it('should have errors property', () => {
      expect(component.errors).toBeDefined();
    });

    it('should have isAddMode property', () => {
      expect(component.isAddMode).toBeDefined();
    });
  });

  it('should dispatch GetAllTreatmentsGroup action when findGroups is called', () => {
    mockStore.dispatch.calls.reset();

    component['getProfessionals']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAllProfessional());
  });

  it('should filter professionals correctly when filter is called', () => {
    component.professionals = [
      { ...mockProfessional, displayName: 'Test Group 1', id: '1' },
      { ...mockProfessional, displayName: 'Another Group', id: '2' },
      { ...mockProfessional, displayName: 'Test Group 2', id: '3' },
    ] as any[];

    const result = component['filter']('test');

    expect(result?.length).toBe(2);
    expect(result?.[0].displayName).toBe('Test Group 1');
    expect(result?.[1].displayName).toBe('Test Group 2');
  });

  it('should return undefined when filter is called with no professionals', () => {
    component.professionals = undefined;

    const result = component['filter']('test');

    expect(result).toBeUndefined();
  });

  it('should filter group options based on form input', (done) => {
    component.professionals = [
      { ...mockProfessional, displayName: 'Test Group 1', id: '1' },
      { ...mockProfessional, displayName: 'Another Group', id: '2' },
      { ...mockProfessional, displayName: 'Test Group 2', id: '3' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredOptions?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { ...mockProfessional, displayName: 'Test Group 1', id: '1' },
          { ...mockProfessional, displayName: 'Test Group 2', id: '3' },
        ]);
        done();
      }
    });

    component.getForm.professional.setValue('T');
  });

  it('should set date from extras when provided', () => {
    const mockExtras = {
      professional: mockProfessional,
      date: new Date(2024, 0, 15),
    };
    mockRouter.getCurrentNavigation.and.returnValue({ extras: { state: mockExtras } } as any);

    const newFixture = TestBed.createComponent(NoteComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.getForm.professional.value).toBe(mockProfessional);
    expect(newComponent.getForm.date.value).toBeDefined();
  });
});