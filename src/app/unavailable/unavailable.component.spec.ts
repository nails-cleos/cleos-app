import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { provideAppDateAdapter } from '../util/adapter/app-date.provider';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '../services/auth-user.service';
import { NavigationService } from '../services/navigation.service';
import { ICommon } from '../interfaces/common';
import { FrequencyEnum } from '../util/helper';
import { IAvailability, IRoomAll } from '../room/room';
import { IUnavailableAll } from './unavailable';
import { IUserAll } from '../user/user';
import {
  createEndDate,
  createNewDate,
  DEFAULT_LOCALE,
  formatDuration,
  getTime,
  zoneDateToDate,
} from '../util/dates';
import { UnavailableStore } from '../store/unavailable.store';
import { UnavailableComponent } from './unavailable.component';
import { UserStore } from '../store/user.store';
describe('UnavailableComponent', () => {
  let component: UnavailableComponent;
  let fixture: ComponentFixture<UnavailableComponent>;
  let dialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  const config: ICommon = {
    title: 'UNAVAILABLE.TITLE',
    button: { icon: 'calendar_lock', label: 'COMMON.BUTTON.CREATE' },
  };

  const unavailableStoreSpy = {
    navigationParams: signal<any>(undefined),
    subErrors: signal<any>(undefined),
  };

  const userStoreSpy = {
    professionals: signal<IUserAll[] | undefined>(undefined),
    rooms: signal<IRoomAll[] | undefined>(undefined),
    loadProfessionals: vi.fn().mockName('loadProfessionals'),
    loadRoomsByProfessionalId: vi.fn().mockName('loadRoomsByProfessionalId'),
  };

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
  const wednesday: IAvailability = {
    day: 'WEDNESDAY',
    start: '10:00',
    end: '19:00',
  };
  const thursday: IAvailability = {
    day: 'THURSDAY',
    start: '09:00',
    end: '18:00',
  };
  const friday: IAvailability = { day: 'FRIDAY' };
  const saturday: IAvailability = {
    day: 'SATURDAY',
    start: '10:00',
    end: '16:00',
  };
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
    availabilities: [
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    ],
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
  const nextMonday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + daysUntilMonday,
      12,
      0,
      0,
    ),
  );

  beforeEach(async () => {
    dialogSpy = {
      open: vi.fn().mockName('MatDialog.open'),
    };
    unavailableStoreSpy.navigationParams.set(undefined);
    userStoreSpy.professionals.set(undefined);
    userStoreSpy.rooms.set(undefined);
    unavailableStoreSpy.subErrors.set(undefined);
    userStoreSpy.loadProfessionals.mockClear();
    userStoreSpy.loadRoomsByProfessionalId.mockClear();
    authUserSignal.set(initialAuthUser);

    await TestBed.configureTestingModule({
      imports: [UnavailableComponent],
      providers: [
        provideTranslateService(),
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        {
          provide: AuthUserService,
          useValue: { authUser: authUserSignal.asReadonly() },
        },
        { provide: MatDialog, useValue: dialogSpy },
        {
          provide: NavigationService,
          useValue: { back: vi.fn().mockName('back') },
        },
        provideAppDateAdapter(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(UnavailableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load professionals on init', () => {
    expect(userStoreSpy.loadProfessionals).toHaveBeenCalled();
  });

  it('should patch form when selectedUnavailable emits', () => {
    fixture.componentRef.setInput('unavailable', mockUnavailable);
    fixture.detectChanges();

    expect(component.unavailable()?.id).toBe('1');
    expect(component.getForm.description.value).toBe('Test Description');
  });

  it('should create form with required fields', () => {
    expect(component.getForm.professional.hasError('required')).toBe(true);
    expect(component.getForm.startDate.hasError('required')).toBe(true);
  });

  it('should patch form when unavailable input is set', () => {
    userStoreSpy.professionals.set(mockProfessionals);
    fixture.componentRef.setInput('unavailable', mockUnavailable);
    fixture.detectChanges();

    const date = zoneDateToDate(mockUnavailable.timestamp);
    expect(component.getForm.professional.value?.id).toBe(
      mockUnavailable.professional.id,
    );
    expect(component.getForm.description.value).toBe(
      mockUnavailable.description,
    );
    expect(component.getForm.startDate.value).toEqual(date);
    expect(component.getForm.startTime.value).toBe(getTime(date));
    expect(component.getForm.allDay.value).toBe(mockUnavailable.allDay);
    expect(component.getForm.repeat.value).toBe(mockUnavailable.repeat);
    expect(component.getForm.endDate.value).toEqual(
      createEndDate(mockUnavailable.end),
    );
    expect(component.getForm.duration.value).toBe(
      formatDuration(mockUnavailable.duration),
    );
  });

  it('should handle form errors from store subErrors', () => {
    unavailableStoreSpy.subErrors.set([
      { field: 'professional', message: 'Professional is required' },
      { field: 'duration', message: 'Duration is required' },
    ]);
    fixture.detectChanges();

    expect(component.errors()['professional']).toBe('Professional is required');
    expect(component.getForm.professional.hasError('incorrect')).toBe(true);
    expect(component.errors()['duration']).toBe('Duration is required');
    expect(component.getForm.duration.hasError('incorrect')).toBe(true);
  });

  it('should set min and max when room is available', () => {
    userStoreSpy.rooms.set([mockRoom]);
    component.getForm.startDate.setValue(nextMonday);
    fixture.detectChanges();

    expect(component.minTime).toBe('11:00');
    expect(component.maxTime).toBe('20:00');
    expect(component.showDuration()).toBe(true);
    expect(component.durationMax).toBe('06:00');
  });

  it('should request rooms when professional changes', () => {
    component.getForm.professional.setValue(mockProfessionals[0]);
    fixture.detectChanges();

    expect(userStoreSpy.loadRoomsByProfessionalId).toHaveBeenCalledWith(
      mockProfessionals[0].id,
    );
  });

  it('should not emit submitData when form is invalid', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData for a timed unavailable', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.professional.setValue(mockProfessionals[0]);
    component.getForm.professional.markAsDirty();
    component.getForm.description.setValue('New Description');
    component.getForm.description.markAsDirty();
    component.getForm.startDate.setValue(nextMonday);
    component.getForm.startDate.markAsDirty();
    component.getForm.allDay.setValue(false);
    component.getForm.allDay.markAsDirty();
    component.getForm.startTime.setValue('10:30');
    component.getForm.startTime.markAsDirty();
    component.getForm.duration.setValue('00:30');
    component.getForm.duration.markAsDirty();
    component.getForm.repeat.setValue(FrequencyEnum.none);
    component.getForm.repeat.markAsDirty();
    component.getForm.endDate.setValue(nextMonday);
    component.getForm.endDate.markAsDirty();
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        time: '00:30',
        repeat: 'NONE',
        start: createNewDate(nextMonday, 10, 30).toLocaleString(DEFAULT_LOCALE),
        timeZone: 'Europe/Amsterdam',
        allDay: false,
        endString: createNewDate(nextMonday).toLocaleString(DEFAULT_LOCALE),
      }),
    );
  });

  it('should emit submitData for an all day unavailable', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.professional.setValue(mockProfessionals[0]);
    component.getForm.professional.markAsDirty();
    component.getForm.description.setValue('New Description');
    component.getForm.description.markAsDirty();
    component.getForm.startDate.setValue(nextMonday);
    component.getForm.startDate.markAsDirty();
    component.getForm.allDay.setValue(true);
    component.getForm.allDay.markAsDirty();
    component.getForm.repeat.setValue(FrequencyEnum.none);
    component.getForm.repeat.markAsDirty();
    component.getForm.endDate.setValue(nextMonday);
    component.getForm.endDate.markAsDirty();
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        professionalId: mockProfessionals[0].id,
        description: 'New Description',
        repeat: 'NONE',
        start: createNewDate(nextMonday).toLocaleString(DEFAULT_LOCALE),
        timeZone: 'Europe/Amsterdam',
        allDay: true,
      }),
    );
  });

  it('should emit deleteData when delete is confirmed', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.deleteData.subscribe(emitSpy);
    fixture.componentRef.setInput('unavailable', mockUnavailable);
    component.getForm.startDate.setValue(nextMonday);
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(mockUnavailable),
    } as any);

    component.delete();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should patch params when provided', () => {
    fixture.componentRef.setInput('params', {
      date: nextMonday,
      startTime: '10:30',
      showDuration: true,
      room: mockRoom,
    });
    fixture.detectChanges();

    expect(component.getForm.startDate.value).toEqual(nextMonday);
    expect(component.getForm.startTime.value).toBe('10:30');
    expect(component.showDuration()).toBe(true);
    expect(component.roomAvailability).toEqual(
      expect.objectContaining({
        availabilities: mockRoom.availabilities,
      }),
    );
  });
});
