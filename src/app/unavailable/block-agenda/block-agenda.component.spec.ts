import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { provideAppDateAdapter } from '../../util/adapter/app-date.provider';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { NavigationService } from '../../services/navigation.service';
import { ICommon } from '../../interfaces/common';
import { FrequencyEnum } from '../../util/helper';
import { IAvailability, IRoomAll } from '../../interfaces/room';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { IUserAll } from '../../interfaces/user';
import { API_LOCALE, createNewDate, formatDuration, getTime, zoneDateToDate } from '../../util/dates';
import { UnavailableStore } from '../../store/unavailable.store';
import { BlockAgendaComponent } from './block-agenda.component';

describe('BlockAgendaComponent', () => {
  let component: BlockAgendaComponent;
  let fixture: ComponentFixture<BlockAgendaComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);
  const config: ICommon = {
    title: 'UNAVAILABLE.BLOCK_AGENDA.TITLE',
    button: { icon: 'calendar_lock', label: 'COMMON.BUTTON.CREATE' },
  };

  const unavailableStoreSpy = {
    navigationParams: signal<any>(undefined),
    professionals: signal<IUserAll[] | undefined>(undefined),
    rooms: signal<IRoomAll[] | undefined>(undefined),
    subErrors: signal<any>(undefined),
    loadProfessionals: jasmine.createSpy('loadProfessionals'),
    loadRoomsByProfessionalId: jasmine.createSpy('loadRoomsByProfessionalId'),
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
  const nextMonday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysUntilMonday, 12, 0, 0),
  );

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    unavailableStoreSpy.navigationParams.set(undefined);
    unavailableStoreSpy.professionals.set(undefined);
    unavailableStoreSpy.rooms.set(undefined);
    unavailableStoreSpy.subErrors.set(undefined);
    unavailableStoreSpy.loadProfessionals.calls.reset();
    unavailableStoreSpy.loadRoomsByProfessionalId.calls.reset();
    authUserSignal.set(initialAuthUser);

    await TestBed.configureTestingModule({
      imports: [BlockAgendaComponent, TranslateModule.forRoot()],
      providers: [
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: AuthUserService, useValue: { authUser: authUserSignal.asReadonly() } },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
        provideAppDateAdapter(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(BlockAgendaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load professionals on init', () => {
    expect(unavailableStoreSpy.loadProfessionals).toHaveBeenCalled();
  });

  it('should patch form when unavailable input is set', () => {
    unavailableStoreSpy.professionals.set(mockProfessionals);
    fixture.componentRef.setInput('unavailable', mockUnavailable);
    fixture.detectChanges();

    const date = zoneDateToDate(mockUnavailable.timestamp);
    expect(component.getForm.professional.value?.id).toBe(mockUnavailable.professional.id);
    expect(component.getForm.startDate.value).toEqual(date);
    expect(component.getForm.startTime.value).toBe(getTime(date));
    expect(component.getForm.duration.value).toBe(formatDuration(mockUnavailable.duration));
  });

  it('should handle form errors from store subErrors', () => {
    unavailableStoreSpy.subErrors.set([
      { field: 'professional', message: 'Professional is required' },
      { field: 'duration', message: 'Duration is required' },
    ]);
    fixture.detectChanges();

    expect(component.errors()['professional']).toBe('Professional is required');
    expect(component.getForm.professional.hasError('incorrect')).toBeTrue();
    expect(component.errors()['duration']).toBe('Duration is required');
    expect(component.getForm.duration.hasError('incorrect')).toBeTrue();
  });

  it('should set min and max when room is available', () => {
    unavailableStoreSpy.rooms.set([mockRoom]);
    component.getForm.startDate.setValue(nextMonday);
    fixture.detectChanges();

    expect(component.minTime).toBe('11:00');
    expect(component.maxTime).toBe('20:00');
    expect(component.showDuration()).toBeTrue();
    expect(component.durationMax).toBe('06:00');
  });

  it('should request rooms when professional changes', () => {
    component.getForm.professional.setValue(mockProfessionals[0]);
    fixture.detectChanges();

    expect(unavailableStoreSpy.loadRoomsByProfessionalId).toHaveBeenCalledWith(mockProfessionals[0].id);
  });

  it('should not emit submitData when form is invalid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData when form is valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.professional.setValue(mockProfessionals[0]);
    component.getForm.professional.markAsDirty();
    component.getForm.startDate.setValue(nextMonday);
    component.getForm.startDate.markAsDirty();
    component.getForm.startTime.setValue('10:30');
    component.getForm.startTime.markAsDirty();
    component.getForm.duration.setValue('00:30');
    component.getForm.duration.markAsDirty();
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      professionalId: mockProfessionals[0].id,
      time: '00:30',
      start: createNewDate(nextMonday, 10, 30).toLocaleString(API_LOCALE),
      timeZone: 'Europe/Amsterdam',
    }));
  });

  it('should emit deleteData when delete is confirmed', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.deleteData.subscribe(emitSpy);
    fixture.componentRef.setInput('unavailable', mockUnavailable);
    component.getForm.startDate.setValue(nextMonday);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(mockUnavailable) } as any);

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
    expect(component.showDuration()).toBeTrue();
  });
});
