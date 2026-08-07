import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UpdateTrackingDialogComponent } from './update-tracking-dialog.component';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { provideTranslateService } from '@ngx-translate/core';

describe('UpdateTrackingDialogComponent', () => {
  let component: UpdateTrackingDialogComponent;
  let fixture: ComponentFixture<UpdateTrackingDialogComponent>;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpdateTrackingDialogComponent>>;

  const mockTimestamps = {
    startedTimestamp: new Date('2024-10-05T10:00:00Z').getTime(),
    completedTimestamp: new Date('2024-10-05T12:00:00Z').getTime(),
  };

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UpdateTrackingDialogComponent],
      providers: [
        provideTranslateService(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockTimestamps },
        provideAppDateAdapter(),
      ],
    });

    fixture = TestBed.createComponent(UpdateTrackingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with no data on onNoClick', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close the dialog with no data if no date changed', () => {
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close the dialog with started/completed data when dates changed', () => {
    const newStarted = new Date(component.getForm.startedDate.value!.getTime() + 1000 * 60); // +1 min
    const newCompleted = new Date(component.getForm.completedDate.value!.getTime() + 2000 * 60); // +2 min

    component.getForm.startedDate.setValue(newStarted);
    component.getForm.completedDate.setValue(newCompleted);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        started: jasmine.any(String),
        completed: jasmine.any(String),
      }),
    );
  });

  it('should update the FormControl time via timeChange()', () => {
    const originalDate = new Date('2024-10-05T00:00:00');
    const formControl = new FormControl<Date | null>(originalDate);

    // Change time to 12:30
    component.timeChange('12:30', formControl);

    const updated = formControl.value!;
    expect(updated.getHours()).toBe(12);
    expect(updated.getMinutes()).toBe(30);
  });

  it('should correctly parse PM time in timeChange()', () => {
    const originalDate = new Date('2024-10-05T08:00:00');
    const formControl = new FormControl<Date | null>(originalDate);

    // 2:30 PM should be converted to 14:30
    component.timeChange('2:30 PM', formControl);

    const updated = formControl.value!;
    expect(updated.getHours()).toBe(14);
    expect(updated.getMinutes()).toBe(30);
  });

  it('should correctly parse p.m. time in timeChange()', () => {
    const originalDate = new Date('2024-10-05T08:00:00');
    const formControl = new FormControl<Date | null>(originalDate);

    // 3:15 p.m. should be converted to 15:15
    component.timeChange('3:15 p.m.', formControl);

    const updated = formControl.value!;
    expect(updated.getHours()).toBe(15);
    expect(updated.getMinutes()).toBe(15);
  });
});
