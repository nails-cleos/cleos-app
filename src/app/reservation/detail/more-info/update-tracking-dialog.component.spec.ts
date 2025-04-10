import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateTrackingDialogComponent } from './update-tracking-dialog.component';
import { SharedModule } from '../../../shared/shared.module';

describe('UpdateTrackingDialogComponent', () => {
  let component: UpdateTrackingDialogComponent;
  let fixture: ComponentFixture<UpdateTrackingDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UpdateTrackingDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SharedModule, ReactiveFormsModule, UpdateTrackingDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { startedTimestamp: Date.now(), completedTimestamp: Date.now() } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTrackingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with no data on onNoClick', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    component.onNoClick;
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close the dialog with data on doAction', () => {
    component.startedDate.setValue(new Date());
    component.completedDate.setValue(new Date());
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    component.doAction;
    expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
      started: jasmine.any(String),
      completed: jasmine.any(String),
    }));
  });
});
