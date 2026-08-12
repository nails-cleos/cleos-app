import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationCloneDialogComponent } from './reservation-clone-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { addMonths } from 'date-fns';
import { getCurrentTimeZone, getNowTimeZone } from '@app/util/dates';
import { MAX_RESERVATION_MONTH } from '../reservation';
import { IRoomAll } from '@app/room/room';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { provideTranslateService } from '@ngx-translate/core';

describe('ReservationCloneDialogComponent', () => {
  let component: ReservationCloneDialogComponent;
  let fixture: ComponentFixture<ReservationCloneDialogComponent>;
  let dialogRef: Pick<
    MatDialogRef<ReservationCloneDialogComponent>,
    'close'
  > & {
    close: ReturnType<typeof vi.fn>;
  };

  const mockRoom: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: { code: 'EUR', name: 'Euro', id: 'eur', icon: '€' },
    office: {
      id: 'office-id',
      name: 'Main Office',
      manager: {
        id: 'manager-id',
      },
    },
    timeZone: getCurrentTimeZone(),
    paymentTypes: ['CASH'],
    primary: true,
  };

  const dialogData = {
    room: mockRoom,
    small: false,
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn().mockName('MatDialogRef.close'),
    };

    await TestBed.configureTestingModule({
      imports: [ReservationCloneDialogComponent],
      providers: [
        provideTranslateService(),
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRef },
        provideAppDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationCloneDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // triggers effect()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.getForm.date.value).toBeNull();
    expect(component.getForm.time.value).toBe('09:00');
    expect(component.getForm.date.valid).toBe(false);
  });

  it('should compute maxCalendarDate correctly', () => {
    const expected = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
    expect(component.maxCalendarDate.toDateString()).toEqual(
      expected.toDateString(),
    );
  });

  it('should set minDate and maxDate signals from availability', () => {
    expect(component.minDate()).toBe('09:00');
    expect(component.maxDate()).toBe('17:00');
  });

  it('should set time control to min time', () => {
    expect(component.getForm.time.value).toBe('09:00');
  });

  it('onNoClick should close dialog without data', () => {
    component.onNoClick();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('doAction should close dialog with form values', () => {
    const date = new Date('2025-01-10');

    component.getForm.date.setValue(date);
    component.getForm.time.setValue('10:30');

    component.doAction();

    expect(dialogRef.close).toHaveBeenCalledWith({
      date,
      time: '10:30',
    });
  });

  it('myFilter should delegate to filterDateRoom', () => {
    const today = new Date();
    const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(12, 0, 0, 0);

    const result = component.myFilter(nextMonday);

    expect(result).toBe(true);
  });

  it('myFilter should not delegate to filterDateRoom', () => {
    const today = new Date();

    const daysUntilTuesday = (2 + 7 - today.getDay()) % 7 || 7;

    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    nextTuesday.setHours(12, 0, 0, 0);

    const result = component.myFilter(nextTuesday);

    expect(result).toBe(false);
  });
});
