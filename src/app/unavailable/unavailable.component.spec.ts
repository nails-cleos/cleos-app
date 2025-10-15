import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableComponent } from './unavailable.component';
import { Subject } from 'rxjs';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createEndDate, formatDuration, getTime, zoneDateToDate } from '../util/dates';
import { clean, getAllProfessional, getUnavailable } from '../store/unavailable.actions';
import { IUnavailable } from '../interfaces/unavailable';
import { IUserAll } from '../interfaces/user';
import { IAvailability, IRoomAll } from '../interfaces/room';

describe('UnavailableComponent', () => {
  let component: UnavailableComponent;
  let fixture: ComponentFixture<UnavailableComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let stateSubject: Subject<any>;

  const mockProfessionals: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  const mockUnavailable: IUnavailable = {
    id: '1',
    description: 'Test Description',
    duration: 'PT15M',
    professional: { id: 'p1', displayName: 'Professional 1' },
    start: '2024-01-01',
    end: '2024-02-01',
    endString: '2024-02-01',
    timestamp: new Date('2024-01-01T10:00:00Z').getTime() / 1000,
    repeat: 'NONE',
    allDay: false,
  };

  const monday: IAvailability = { day: 'MONDAY', start: '09:00', end: '18:00' };
  const tuesday: IAvailability = { day: 'TUESDAY' };
  const wednesday: IAvailability = { day: 'WEDNESDAY', start: '10:00', end: '19:00' };
  const thursday: IAvailability = { day: 'THURSDAY', start: '09:00', end: '18:00' };
  const friday: IAvailability = { day: 'FRIDAY' };
  const saturday: IAvailability = { day: 'SATURDAY', start: '10:00', end: '16:00' };
  const sunday: IAvailability = { day: 'SUNDAY' };

  const mockRoom = {
    id: 'room-123',
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: {
      id: 'currency-id',
      code: 'EUR',
      icon: 'EUR',
      name: 'Euro',
    },
    timeZone: 'UTC',
    availabilities: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
    office: {},
    paymentTypes: [],
    primary: false,
    professional: mockProfessionals[0],
  };

  const today = new Date();
  const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(12, 0, 0, 0);

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockStore.select.and.returnValue(stateSubject.asObservable());
    mockRouter.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        UnavailableComponent,
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

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(UnavailableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(component.isAddMode).toBeTrue();
    expect(component.id).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(component.isAddMode).toBeFalse();
    expect(component.id).toBe(testId);
  });

  it('should create form with required name field', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.getForm.professional).toBeDefined();
    expect(component.getForm.description).toBeDefined();
    expect(component.getForm.startDate).toBeDefined();
    expect(component.getForm.startTime).toBeDefined();
    expect(component.getForm.allDay).toBeDefined();
    expect(component.getForm.duration).toBeDefined();
    expect(component.getForm.repeat).toBeDefined();
    expect(component.getForm.endDate).toBeDefined();
    expect(component.getForm.professional?.hasError('required')).toBeTrue();
    expect(component.getForm.startDate?.hasError('required')).toBeTrue();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetUnavailable action when in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getUnavailable({ id: testId }));
  });

  it('should patch form when unavailable is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockUnavailable,
      professionals: mockProfessionals,
    });

    expect(component.unavailable?.id).toEqual(mockUnavailable.id);
    const date = zoneDateToDate(mockUnavailable.timestamp);
    expect(component.getForm.professional?.value).toBe(mockUnavailable.professional);
    expect(component.getForm.description?.value).toBe(mockUnavailable.description);
    expect(component.getForm.startDate?.value).toEqual(date);
    expect(component.getForm.startTime?.value).toBe(getTime(date));
    expect(component.getForm.allDay?.value).toBe(mockUnavailable.allDay);
    expect(component.getForm.repeat?.value).toBe(mockUnavailable.repeat);
    expect(component.getForm.endDate?.value).toEqual(createEndDate(mockUnavailable.end!));
    expect(component.getForm.duration?.value).toBe(formatDuration(mockUnavailable.duration!));
    expect(component.professionals).toEqual(mockProfessionals);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'professional', message: 'Professional is required' },
      { field: 'duration', message: 'Duration is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['professional']).toBe('Professional is required');
    expect(component.getForm.professional?.hasError('incorrect')).toBeTrue();
    expect(component.errors['duration']).toBe('Duration is required');
    expect(component.getForm.duration?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to unavailable list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'unavailable']);
  });

  it('should set mix and max when room is set', () => {
    component.ngOnInit();

    component.getForm.startDate.setValue(nextMonday);

    stateSubject.next({
      rooms: [mockRoom],
    });

    expect(component.minTime).toBe('11:00');
    expect(component.maxTime).toBe('20:00');
    expect(component.roomAvailability).toEqual(
      {
        availabilities: mockRoom.availabilities.filter(av => av !== undefined),
      } as IRoomAll,
    );
    expect(component.showDuration).toBeTrue();
    expect(component.durationMax).toBe('08:00');
  });

  it('should not dispatch action when form is invalid', () => {
    component.ngOnInit();
    component.getForm.professional?.setValue('');
    component.getForm.duration?.setValue('');
    mockStore.dispatch.calls.reset();

    void component.submit;

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateUnavailable action when in add mode and form is valid for all day false', () => {
    component.ngOnInit();
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(new Date('2024-06-01'));
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(false);
    allDayControl.markAsDirty();

    const startTimeControl = component.getForm.startTime;
    startTimeControl.setValue('10:00');
    startTimeControl.markAsDirty();

    const durationControl = component.getForm.duration;
    durationControl.setValue('00:30');
    durationControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue('NONE');
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue('2024-06-01');
    endDateControl.markAsDirty();

    mockStore.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        time: '00:30',
        repeat: 'NONE',
        start: '01/06/2024, 10:00:00',
        timeZone: 'Europe/Amsterdam',
        allDay: false,
        endString: '01/06/2024, 00:00:00',
      }),
      type: '[Unavailable] Create unavailable',
    }));
    expect(component.unavailable).toBeUndefined();
  });

  it('should dispatch CreateUnavailable action when in add mode and form is valid for all day true', () => {
    component.ngOnInit();
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(new Date('2024-06-01'));
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(true);
    allDayControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue('NONE');
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue('2024-06-01');
    endDateControl.markAsDirty();

    mockStore.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        repeat: 'NONE',
        start: '01/06/2024, 00:00:00',
        timeZone: 'Europe/Amsterdam',
        allDay: true,
      }),
      type: '[Unavailable] Create unavailable',
    }));
    expect(component.unavailable).toBeUndefined();
  });

  it('should dispatch UpdateUnavailable action when in edit mode and form is valid', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.unavailable = mockUnavailable;

    component.ngOnInit();
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Update Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(new Date('2024-06-01'));
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(true);
    allDayControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue('ONCE_A_WEEK');
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue('2024-06-01');
    endDateControl.markAsDirty();
    mockStore.dispatch.calls.reset();

    void component.submit;

    const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      id: '123',
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'Update Description',
        repeat: 'ONCE_A_WEEK',
        start: '01/06/2024, 00:00:00',
        timeZone: 'Europe/Amsterdam',
        allDay: true,
      }),
      type: '[Unavailable] Update unavailable by id',
    }));
    expect(component.unavailable).toBeUndefined();
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

  it('should handle undefined unavailable in edit mode', () => {
    const testId = '123';
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
    component.unavailable = undefined;

    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getUnavailable({ id: testId }));
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.getForm.professional?.value).toBe('');
    expect(component.getForm.description?.value).toBe('');
    expect(component.getForm.startDate?.value).toEqual('');
    expect(component.getForm.startTime?.value).toBe('');
    expect(component.getForm.allDay?.value).toBe('');
    expect(component.getForm.repeat?.value).toBe('');
    expect(component.getForm.endDate?.value).toEqual('');
    expect(component.getForm.duration?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.form.invalid).toBeTrue();

    component.getForm.professional.setValue(mockProfessionals[0]);
    component.getForm.description.setValue('New Description');
    component.getForm.startDate.setValue(new Date('2024-06-01'));
    component.getForm.allDay.setValue(false);
    component.getForm.startTime.setValue('10:00');
    component.getForm.duration.setValue('00:30');
    component.getForm.repeat.setValue('NONE');
    component.getForm.endDate.setValue('2024-06-01');
    expect(component.form.valid).toBeTrue();
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should clean state and get unavailable list on response', () => {
    component.ngOnInit();
    mockStore.dispatch.calls.reset();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'unavailable']);
  });

  it('should dispatch GetAllTreatmentsGroup action when getProfessionals is called', () => {
    mockStore.dispatch.calls.reset();

    component['getProfessionals']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(getAllProfessional());
  });

  it('should filter professionals correctly when filter is called', () => {
    component.professionals = [
      { displayName: 'Test Group 1', id: '1' },
      { displayName: 'Another Group', id: '2' },
      { displayName: 'Test Group 2', id: '3' },
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

  it('should filter professionals options based on form input', (done) => {
    component.professionals = [
      { displayName: 'Test Professional 1', id: '1' },
      { displayName: 'Another Professional', id: '2' },
      { displayName: 'Test Professional 2', id: '3' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredOptions?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { displayName: 'Test Professional 1', id: '1' },
          { displayName: 'Test Professional 2', id: '3' },
        ]);
        done();
      }
    });

    component.getForm.professional?.setValue('T');
  });

  it('should test keyDownHandler with Backspace event', () => {
    component.ngOnInit();
    const mockEvent = { code: 'Backspace' };
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[1]);

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(new Date('2024-06-01'));

    const startTimeControl = component.getForm.startTime;
    startTimeControl.setValue('10:00');

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(false);

    const durationControl = component.getForm.duration;
    durationControl.setValue('00:30');

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue('NONE');

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue('2024-06-01');

    component.getForm.description.setValue('New Description');

    component.keyDownHandler(mockEvent);

    expect(professionalControl.value).toBe('');
    expect(startDateControl.value).toBeUndefined();
    expect(startTimeControl.value).toBeUndefined();
    expect(durationControl.value).toBeUndefined();
    expect(endDateControl.value).toBeUndefined();
    expect(repeatControl.value).toBeUndefined();
    expect(allDayControl.value).toBeFalse();
  });it('should set date from extras when provided', () => {
    const mockExtras = {
      room: mockRoom,
      date: nextMonday,
    };
    mockRouter.getCurrentNavigation.and.returnValue({ extras: { state: mockExtras } } as any);

    const newFixture = TestBed.createComponent(UnavailableComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    newComponent.ngOnInit();

    expect(newComponent.rooms).toEqual([mockRoom]);
    expect(newComponent.showDuration).toBeFalse();
    expect(newComponent.getForm.professional.value).toEqual(mockRoom.professional);
    expect(newComponent.getForm.startDate.value).toBe(nextMonday);
    expect(newComponent.getForm.startTime.value).toBe('12:00');
    expect(newComponent.getForm.duration.value).toBeUndefined();
    expect(newComponent.getForm.endDate.value).toBeUndefined();
    expect(newComponent.getForm.repeat.value).toBeUndefined();
    expect(newComponent.getForm.allDay.value).toBe('');
  });
});
