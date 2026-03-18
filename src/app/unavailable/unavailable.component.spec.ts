import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableComponent } from './unavailable.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { API_LOCALE, createEndDate, createNewDate, formatDuration, getTime, zoneDateToDate } from '../util/dates';
import { deleteUnavailable, getUnavailable } from '../store/unavailable.actions';
import { IUnavailableAll } from '../interfaces/unavailable';
import { IUserAll } from '../interfaces/user';
import { IAvailability, IRoomAll } from '../interfaces/room';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { FrequencyEnum } from '../util/helper';
import { UnavailableState } from '../store/reducers/unavailable.reducers';

describe('UnavailableComponent', () => {
  let component: UnavailableComponent;
  let fixture: ComponentFixture<UnavailableComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let unavailableId$: BehaviorSubject<any>;
  let selectedUnavailable$: BehaviorSubject<any>;
  let allProfessionals$: BehaviorSubject<any>;
  let allRooms$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<UnavailableState>>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let dialogSpy: jasmine.SpyObj<any>;

  const mockProfessionals: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  const mockUnavailable: IUnavailableAll = {
    id: '1',
    description: 'Test Description',
    duration: 'PT15M',
    professional: { id: 'p1', displayName: 'Professional 1' } as IUserAll,
    start: '2024-01-01',
    end: '2024-02-01',
    endString: '2024-02-01',
    timestamp: new Date('2024-01-01T10:00:00Z').getTime() / 1000,
    repeat: FrequencyEnum.none,
    allDay: false,
  };

  const monday: IAvailability = { day: 'MONDAY', start: '09:00', end: '18:00' };
  const tuesday: IAvailability = { day: 'TUESDAY' };
  const wednesday: IAvailability = { day: 'WEDNESDAY', start: '10:00', end: '19:00' };
  const thursday: IAvailability = { day: 'THURSDAY', start: '09:00', end: '18:00' };
  const friday: IAvailability = { day: 'FRIDAY' };
  const saturday: IAvailability = { day: 'SATURDAY', start: '10:00', end: '16:00' };
  const sunday: IAvailability = { day: 'SUNDAY' };

  const mockRoom: IRoomAll = {
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
    office: {
      id: 'office-123',
      name: 'Head Office',
      manager: {
        id: 'manager-123',
      },
    },
    paymentTypes: [],
    primary: false,
    professionals: mockProfessionals,
  };

  const today = new Date();
  const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(12, 0, 0, 0);

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    unavailableId$ = new BehaviorSubject(undefined);
    selectedUnavailable$ = new BehaviorSubject(undefined);
    allProfessionals$ = new BehaviorSubject(undefined);
    allRooms$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return navigationParams$.asObservable();
        case 2:
          return unavailableId$.asObservable();
        case 3:
          return selectedUnavailable$.asObservable();
        case 4:
          return allProfessionals$.asObservable();
        case 5:
          return allRooms$.asObservable();
        case 6:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [UnavailableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(UnavailableComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    unavailableId$.next(undefined);
    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeTrue();
    expect(component['unavailableIdSignal']()).toBeUndefined();
  });

  it('should initialize in edit mode when id is provided', () => {
    const testId = '123';
    unavailableId$.next(testId);

    fixture.detectChanges();

    expect(component.isAddModeSignal()).toBeFalse();
    expect(component['unavailableIdSignal']()).toBe(testId);
  });

  it('should create form with required name field', () => {
    fixture.detectChanges();

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

  it('should dispatch GetUnavailable action when in edit mode', () => {
    const testId = '123';
    unavailableId$.next(testId);

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUnavailable({ id: testId }));
  });

  it('should patch form when unavailable is selected from state', () => {
    selectedUnavailable$.next(mockUnavailable);
    allProfessionals$.next(mockProfessionals);
    fixture.detectChanges();

    const unavailable = component.unavailableSignal();
    expect(unavailable?.id).toEqual(mockUnavailable.id);
    const date = zoneDateToDate(mockUnavailable.timestamp);
    expect(component.getForm.professional?.value?.id).toBe(mockUnavailable.professional.id);
    expect(component.getForm.description?.value).toBe(mockUnavailable.description);
    expect(component.getForm.startDate?.value).toEqual(date);
    expect(component.getForm.startTime?.value).toBe(getTime(date));
    expect(component.getForm.allDay?.value).toBe(mockUnavailable.allDay);
    expect(component.getForm.repeat?.value).toBe(mockUnavailable.repeat);
    expect(component.getForm.endDate?.value).toEqual(createEndDate(mockUnavailable.end!));
    expect(component.getForm.duration?.value).toBe(formatDuration(mockUnavailable.duration!));
    expect(component.allProfessionalsSignal()).toEqual(mockProfessionals);
  });

  it('should handle form errors from state', () => {
    const mockErrors = [
      { field: 'professional', message: 'Professional is required' },
      { field: 'duration', message: 'Duration is required' },
    ];

    subErrors$.next(mockErrors);
    fixture.detectChanges();

    expect(component.errors()['professional']).toBe('Professional is required');
    expect(component.getForm.professional?.hasError('incorrect')).toBeTrue();
    expect(component.errors()['duration']).toBe('Duration is required');
    expect(component.getForm.duration?.hasError('incorrect')).toBeTrue();
  });

  it('should set mix and max when room is set', () => {
    allRooms$.next([mockRoom]);
    component.getForm.startDate.setValue(nextMonday);

    fixture.detectChanges();

    expect(component.minTime).toBe('10:00');
    expect(component.maxTime).toBe('19:00');
    expect(component.roomAvailability).toEqual(
      {
        availabilities: mockRoom.availabilities.filter(av => av !== undefined),
      } as IRoomAll,
    );
    expect(component.showDuration()).toBeTrue();
    expect(component.durationMax).toBe('07:00');
  });

  it('should not dispatch action when form is invalid', () => {
    fixture.detectChanges();
    component.getForm.professional?.setValue(undefined);
    component.getForm.duration?.setValue('');
    storeSpy.dispatch.calls.reset();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch CreateUnavailable action when in add mode and form is valid for all day false', () => {
    const hours = 10;
    const minutes = 30;
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(nextMonday);
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(false);
    allDayControl.markAsDirty();

    const startTimeControl = component.getForm.startTime;
    startTimeControl.setValue(`${hours}:${minutes}`);
    startTimeControl.markAsDirty();

    fixture.detectChanges();

    const durationControl = component.getForm.duration;
    durationControl.setValue('00:30');
    durationControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.none);
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue(nextMonday);
    endDateControl.markAsDirty();

    fixture.detectChanges();

    storeSpy.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    component.submit();

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        time: '00:30',
        repeat: 'NONE',
        start: createNewDate(nextMonday, hours, minutes).toLocaleString(API_LOCALE),
        timeZone: 'Europe/Amsterdam',
        allDay: false,
        endString: createNewDate(nextMonday).toLocaleString(API_LOCALE),
      }),
      type: '[Unavailable] Create unavailable',
    }));
    expect(component.unavailableSignal()).toBeUndefined();
  });

  it('should dispatch CreateUnavailable action when in add mode and form is valid for all day true', () => {
    fixture.detectChanges();
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(nextMonday);
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(true);
    allDayControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.none);
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue(nextMonday);
    endDateControl.markAsDirty();

    fixture.detectChanges();

    storeSpy.dispatch.calls.reset();
    expect(component.form.valid).toBeTrue();

    component.submit();

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        repeat: 'NONE',
        start: createNewDate(nextMonday).toLocaleString(API_LOCALE),
        timeZone: 'Europe/Amsterdam',
        allDay: true,
      }),
      type: '[Unavailable] Create unavailable',
    }));
    expect(component.unavailableSignal()).toBeUndefined();
  });

  it('should dispatch UpdateUnavailable action when in edit mode and form is valid', () => {
    const testId = '123';
    unavailableId$.next(testId);
    selectedUnavailable$.next(mockUnavailable);

    fixture.detectChanges();
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[0]);
    professionalControl.markAsDirty();

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Update Description');
    descriptionControl.markAsDirty();

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(nextMonday);
    startDateControl.markAsDirty();

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(true);
    allDayControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.onceAWeek);
    repeatControl.markAsDirty();

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue(nextMonday);
    endDateControl.markAsDirty();
    storeSpy.dispatch.calls.reset();

    component.submit();

    const dispatchedAction = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatchedAction).toEqual(jasmine.objectContaining({
      id: '123',
      unavailable: jasmine.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'Update Description',
        repeat: 'ONCE_A_WEEK',
        start: createNewDate(nextMonday).toLocaleString(API_LOCALE),
        timeZone: 'Europe/Amsterdam',
        allDay: true,
      }),
      type: '[Unavailable] Update unavailable by id',
    }));
  });

  it('should return form controls from getForm getter', () => {
    fixture.detectChanges();

    const controls = component.getForm;

    expect(controls).toBe(component.form.controls);
  });

  it('should call detectChanges when needed', () => {
    expect(changeDetectorRefSpy.detectChanges).not.toHaveBeenCalled();
  });

  it('should handle undefined unavailable in edit mode', () => {
    const testId = '123';
    unavailableId$.next(testId);
    selectedUnavailable$.next(undefined);

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getUnavailable({ id: testId }));
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();

    expect(component.getForm.professional.value).toBeNull();
    expect(component.getForm.description.value).toBeNull();
    expect(component.getForm.startDate.value).toBeNull();
    expect(component.getForm.startTime.value).toBeNull();
    expect(component.getForm.allDay.value).toBe(false);
    expect(component.getForm.repeat.value).toBeNull();
    expect(component.getForm.endDate.value).toBeNull();
    expect(component.getForm.duration.value).toBeNull();
  });

  it('should validate form correctly', () => {
    fixture.detectChanges();

    expect(component.form.invalid).toBeTrue();

    component.getForm.professional.setValue(mockProfessionals[0]);
    component.getForm.description.setValue('New Description');
    component.getForm.startDate.setValue(nextMonday);
    component.getForm.allDay.setValue(false);
    component.getForm.startTime.setValue('10:00');
    component.getForm.duration.setValue('00:30');
    component.getForm.repeat.setValue(FrequencyEnum.none);
    component.getForm.endDate.setValue(nextMonday);
    expect(component.form.valid).toBeTrue();
  });

  it('should filter professionals correctly when filter is called', () => {
    const professionals = [
      { displayName: 'Test Professional 1', id: '1' },
      { displayName: 'Another Professional', id: '2' },
      { displayName: 'Test Professional 2', id: '3' },
    ] as IUserAll[];
    allProfessionals$.next(professionals);

    fixture.detectChanges();

    const result = component['filter']('test', professionals);

    expect(result?.length).toBe(2);
    expect(result?.[0].displayName).toBe('Test Professional 1');
    expect(result?.[1].displayName).toBe('Test Professional 2');
  });

  it('should return undefined when filter is called with no professionals', () => {
    allProfessionals$.next(undefined);
    fixture.detectChanges();

    const result = component['filter']('test', undefined);

    expect(result).toBeUndefined();
  });

  it('filteredProfessionalSignal should return Professional when input empty and filter when value set', () => {
    const professionals = [
      { displayName: 'Test Professional 1', id: '1' },
      { displayName: 'Another Professional', id: '2' },
      { displayName: 'Test Professional 2', id: '3' },
    ] as IUserAll[];
    allProfessionals$.next(professionals);
    fixture.detectChanges();

    // when group control empty -> return all
    component.getForm.professional.setValue(undefined);
    fixture.detectChanges();
    expect(component.filteredProfessionalSignal()).toEqual(professionals);

    // when group control has 'Test' -> filtered
    (component.getForm.professional as any).setValue('Test');
    fixture.detectChanges();
    expect(component.filteredProfessionalSignal()).toEqual([
      { id: '1', displayName: 'Test Professional 1' },
      { id: '3', displayName: 'Test Professional 2' },
    ] as IUserAll[]);
  });

  it('should test keyDownHandler with Backspace event', () => {
    fixture.detectChanges();
    const mockEvent = { code: 'Backspace' } as KeyboardEvent;
    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessionals[1]);

    const startDateControl = component.getForm.startDate;
    startDateControl.setValue(nextMonday);

    const startTimeControl = component.getForm.startTime;
    startTimeControl.setValue('10:00');

    const allDayControl = component.getForm.allDay;
    allDayControl.setValue(false);

    const durationControl = component.getForm.duration;
    durationControl.setValue('00:30');

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.none);

    const endDateControl = component.getForm.endDate;
    endDateControl.setValue(nextMonday);

    component.getForm.description.setValue('New Description');

    component.keyDownHandler(mockEvent);

    expect(professionalControl.value).toBeUndefined();
    expect(startDateControl.value).toBeUndefined();
    expect(startTimeControl.value).toBeUndefined();
    expect(durationControl.value).toBeUndefined();
    expect(endDateControl.value).toBeUndefined();
    expect(repeatControl.value).toBeUndefined();
    expect(allDayControl.value).toBeFalse();
  });

  it('should set date from extras when provided', () => {
    navigationParams$.next({
      room: mockRoom,
      date: nextMonday,
    });
    fixture.detectChanges();

    expect(component['rooms']()).toEqual([mockRoom]);
    expect(component.showDuration()).toBeTrue();
    expect(component.getForm.startDate.value).toBe(nextMonday);
    expect(component.getForm.startTime.value).toBe('12:00');
    expect(component.getForm.duration.value).toBeUndefined();
    expect(component.getForm.endDate.value).toBeUndefined();
    expect(component.getForm.repeat.value).toBeUndefined();
    expect(component.getForm.allDay.value).toBeFalse();
  });

  it('should dispatch deleteUnavailable when dialog returns a result', () => {
    selectedUnavailable$.next(mockUnavailable);
    fixture.detectChanges();
    dialogSpy.and.returnValue({
      afterClosed: () => of(mockUnavailable),
    } as any);

    component.delete();

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'UNAVAILABLE.DELETED.TITLE',
          content: 'UNAVAILABLE.DELETED.CONTENT',
          value: mockUnavailable,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteUnavailable({
      id: mockUnavailable.id!,
      timestamp: mockUnavailable.timestamp!,
      timeZone: mockUnavailable.timeZone,
    }));
  });
});
