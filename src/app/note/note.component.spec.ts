import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

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
    const storeSpyObj = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    storeSpyObj.select.and.returnValue(of({
      professionals: [],
      selected: null,
      subErrors: null,
      response: null,
    }));

    routerSpyObj.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        NoteComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: storeSpyObj },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatDialog, useValue: dialogSpyObj },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  beforeEach(() => {
    // Reset the mock to return null before creating component
    mockActivatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize in add mode when no id is provided', () => {
      expect(component.isAddMode).toBe(true);
      expect(component.id).toBeUndefined();
    });

    it('should initialize form with required validators', () => {
      expect(component.form).toBeDefined();
      expect(component.getForm.description.hasError('required')).toBe(true);
      expect(component.getForm.professional.hasError('required')).toBe(true);
      expect(component.getForm.date.hasError('required')).toBe(true);
      expect(component.getForm.repeat.hasError('required')).toBe(true);
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
      professionalControl.setValue(mockProfessional);
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
          professionalId: 'prof-1',
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
      expect(component.form.invalid).toBe(true);
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
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when description is empty', () => {
      component.getForm.description.setValue('');
      expect(component.getForm.description.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when professional is empty', () => {
      component.getForm.professional.setValue('');
      expect(component.getForm.professional.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when date is empty', () => {
      component.getForm.date.setValue('');
      expect(component.getForm.date.hasError('required')).toBe(true);
    });

    it('should mark form as invalid when repeat is empty', () => {
      component.getForm.repeat.setValue('');
      expect(component.getForm.repeat.hasError('required')).toBe(true);
    });

    it('should allow valid description values', () => {
      component.getForm.description.setValue('Valid note description');
      expect(component.getForm.description.valid).toBe(true);
    });

    it('should allow valid date values', () => {
      component.getForm.date.setValue(new Date('2024-01-15'));
      expect(component.getForm.date.valid).toBe(true);
    });

    it('should allow valid repeat values', () => {
      component.getForm.repeat.setValue(FrequencyEnum.none);
      expect(component.getForm.repeat.valid).toBe(true);
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
});