import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ClockTimepickerDialogComponent, ClockTimepickerDialogData } from './clock-timepicker-dialog.component';

describe('ClockTimepickerDialogComponent', () => {
  let fixture: ComponentFixture<ClockTimepickerDialogComponent>;
  let component: ClockTimepickerDialogComponent;
  let dialogData: ClockTimepickerDialogData;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ClockTimepickerDialogComponent>>;

  const createComponent = (data: ClockTimepickerDialogData): void => {
    dialogData = data;
    fixture = TestBed.createComponent(ClockTimepickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ClockTimepickerDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefSpy,
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    createComponent({ format: 24, initialTime: '10:00' });

    expect(component).toBeTruthy();
  });

  it('should parse and round initial time based on minutes gap', () => {
    createComponent({ format: 24, initialTime: '14:20', minutesGap: 15 });

    expect(component.hour).toBe(14);
    expect(component.minute).toBe(15);
    expect(component.displayHour).toBe('14');
    expect(component.displayMinute).toBe('15');
  });

  it('should parse 12-hour initial format and meridiem', () => {
    createComponent({ format: 12, initialTime: '09:30 PM', minutesGap: 5 });

    expect(component.hour).toBe(21);
    expect(component.meridiem).toBe('PM');
    expect(component.displayHour).toBe('09');
    expect(component.displayMinute).toBe('30');
  });

  it('should build minute dial from minutes gap', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 15 });

    component.setView('minute');
    const values = component.dialOptions.map(option => option.value);

    expect(component.view).toBe('minute');
    expect(values).toEqual([0, 15, 30, 45]);
  });

  it('should switch to minute view after selecting an hour', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 15 });

    const hourOption = component.dialOptions.find(option => option.value === 13 && !option.disabled)
      || component.dialOptions.find(option => !option.disabled);

    expect(hourOption).toBeDefined();
    if (!hourOption) {
      return;
    }

    component.selectDialOption(hourOption);

    expect(component.hour).toBe(hourOption.value);
    expect(component.view).toBe('minute');
  });

  it('should update minute when selecting minute option', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 15 });
    component.setView('minute');

    const minuteOption = component.dialOptions.find(option => option.value === 30 && !option.disabled);
    expect(minuteOption).toBeDefined();
    if (!minuteOption) {
      return;
    }

    component.selectDialOption(minuteOption);

    expect(component.minute).toBe(30);
    expect(component.view).toBe('minute');
  });

  it('should toggle hour when switching AM/PM in 12-hour format', () => {
    createComponent({ format: 12, initialTime: '03:00 AM', minutesGap: 15 });

    component.setMeridiem('PM');
    expect(component.hour).toBe(15);
    expect(component.meridiem).toBe('PM');

    component.setMeridiem('AM');
    expect(component.hour).toBe(3);
    expect(component.meridiem).toBe('AM');
  });

  it('should disable hour and minute options outside min/max range', () => {
    createComponent({
      format: 24,
      initialTime: '10:00',
      min: '10:00',
      max: '10:30',
      minutesGap: 15,
    });

    const hourNine = component.dialOptions.find(option => option.value === 9);
    const hourTen = component.dialOptions.find(option => option.value === 10);
    expect(hourNine?.disabled).toBeTrue();
    expect(hourTen?.disabled).toBeFalse();

    component.setView('minute');
    const minuteFortyFive = component.dialOptions.find(option => option.value === 45);
    const minuteFifteen = component.dialOptions.find(option => option.value === 15);
    expect(minuteFortyFive?.disabled).toBeTrue();
    expect(minuteFifteen?.disabled).toBeFalse();
  });

  it('should snap to nearest valid time when initial value is out of range', () => {
    createComponent({
      format: 24,
      initialTime: '09:00',
      min: '10:00',
      max: '10:30',
      minutesGap: 15,
    });

    expect(component.hour).toBe(10);
    expect(component.minute).toBe(0);
  });

  it('should confirm with 24-hour formatted output', () => {
    createComponent({ format: 24, initialTime: '10:00' });
    component.hour = 9;
    component.minute = 5;

    component.confirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith('09:05');
  });

  it('should confirm with 12-hour formatted output', () => {
    createComponent({ format: 12, initialTime: '01:10 PM' });
    component.hour = 13;
    component.minute = 10;
    component.meridiem = 'PM';
    dialogRefSpy.close.calls.reset();

    component.confirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith('01:10 PM');
  });

  it('should not confirm when no selectable time exists', () => {
    createComponent({
      format: 24,
      initialTime: '10:00',
      min: '12:00',
      max: '11:00',
      minutesGap: 15,
    });

    expect(component.isConfirmDisabled).toBeTrue();
    component.confirm();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel', () => {
    createComponent({ format: 24, initialTime: '10:00' });

    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should use inner and outer hand lengths correctly in 24-hour mode', () => {
    createComponent({ format: 24, initialTime: '03:00' });

    expect(component.handLength).toBe(28);
    component.hour = 13;
    expect(component.handLength).toBe(40);
  });

  it('should return minute hand length and angle when minute view is active', () => {
    createComponent({ format: 12, initialTime: '12:00 AM' });

    component.setView('minute');
    component.minute = 15;

    expect(component.handLength).toBe(40);
    expect(component.handAngle).toBe(90);
  });

  it('should keep current view when selecting the same view', () => {
    createComponent({ format: 24, initialTime: '10:00' });
    const refreshSpy = spyOn<any>(component, 'refreshDial').and.callThrough();

    component.setView('hour');
    expect(component.view).toBe('hour');
    expect(refreshSpy).not.toHaveBeenCalled();

    component.setView('minute');
    expect(component.view).toBe('minute');
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should ignore meridiem change in 24-hour format', () => {
    createComponent({ format: 24, initialTime: '14:00' });
    const refreshSpy = spyOn<any>(component, 'refreshDial').and.callThrough();

    component.setMeridiem('AM');

    expect(component.hour).toBe(14);
    expect(component.meridiem).toBe('PM');
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('should ignore meridiem change when same value is selected in 12-hour format', () => {
    createComponent({ format: 12, initialTime: '08:00 AM' });
    const refreshSpy = spyOn<any>(component, 'refreshDial').and.callThrough();

    component.setMeridiem('AM');

    expect(component.hour).toBe(8);
    expect(component.meridiem).toBe('AM');
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('should ignore disabled dial option selection', () => {
    createComponent({
      format: 24,
      initialTime: '10:00',
      min: '10:00',
      max: '10:30',
      minutesGap: 15,
    });
    component.setView('minute');
    const disabledMinute = component.dialOptions.find(option => option.value === 45 && option.disabled);
    expect(disabledMinute).toBeDefined();
    if (!disabledMinute) {
      return;
    }

    const previousMinute = component.minute;
    component.selectDialOption(disabledMinute);

    expect(component.minute).toBe(previousMinute);
    expect(component.view).toBe('minute');
  });

  it('should keep minute unchanged when selected hour has no selectable minute', () => {
    createComponent({
      format: 24,
      initialTime: '10:00',
      min: '10:00',
      max: '10:15',
      minutesGap: 15,
    });
    const customHourOption = {
      value: 9,
      label: '09',
      displayLabel: '09',
      top: 0,
      left: 0,
      active: false,
      disabled: false,
    } as any;

    component.selectDialOption(customHourOption);

    expect(component.hour).toBe(9);
    expect(component.minute).toBe(0);
    expect(component.view).toBe('minute');
  });

  it('should normalize minutes gap to 1 when invalid', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 0 });
    component.setView('minute');
    const values = component.dialOptions.map(option => option.value);

    expect(values.length).toBe(60);
    expect(values.slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('should keep every minute selectable but only display quarter labels', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 1 });
    component.setView('minute');

    const minuteSeven = component.dialOptions.find(option => option.value === 7);
    const minuteFifteen = component.dialOptions.find(option => option.value === 15);

    expect(minuteSeven?.label).toBe('07');
    expect(minuteSeven?.displayLabel).toBe('');
    expect(minuteSeven?.disabled).toBeFalse();
    expect(minuteFifteen?.displayLabel).toBe('15');
  });

  it('should floor and cap minutes gap to 30', () => {
    createComponent({ format: 24, initialTime: '10:00', minutesGap: 31.9 });
    component.setView('minute');

    expect(component.dialOptions.map(option => option.value)).toEqual([0, 30]);
  });

  it('should parse 12 AM correctly', () => {
    createComponent({ format: 12, initialTime: '12:05 AM' });

    expect(component.hour).toBe(0);
    expect(component.displayHour).toBe('12');
    expect(component.meridiem).toBe('AM');
  });

  it('should parse 12 PM correctly', () => {
    createComponent({ format: 12, initialTime: '12:05 PM' });

    expect(component.hour).toBe(12);
    expect(component.displayHour).toBe('12');
    expect(component.meridiem).toBe('PM');
  });

  it('should fallback to current time when initial time cannot be parsed', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 2, 19, 8, 59, 0));
      createComponent({ format: 24, initialTime: 'invalid-time', minutesGap: 15 });

      expect(component.hour).toBe(8);
      expect(component.minute).toBe(0);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should fallback to current time when initial hour is out of range', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 2, 19, 11, 22, 0));
      createComponent({ format: 24, initialTime: '25:10' });

      expect(component.hour).toBe(11);
      expect(component.minute).toBe(22);
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
