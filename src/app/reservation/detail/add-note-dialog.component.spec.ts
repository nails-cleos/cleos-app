import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AddNoteDialogComponent } from './add-note-dialog.component';
import { AppMaterialModule } from '../../util/app-material.module';

describe('AddNoteDialogComponent', () => {
  let component: AddNoteDialogComponent;
  let fixture: ComponentFixture<AddNoteDialogComponent>;

  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AddNoteDialogComponent>>;

  const mockData = {
    isCustomer: false,
    note: undefined,
    customerNote: undefined,
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddNoteDialogComponent, TranslateModule.forRoot(), AppMaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockData } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddNoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    expect(component.data).toEqual(mockData);
  });

  it('onNoClick should close the dialog', () => {
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should render the dialog title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1[mat-dialog-title]');
    expect(titleElement.textContent).toBe('RESERVATION.NOTE.ADD');
  });

  it('should show both buttons when both hideNoButton and hideOkButton are false', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should pass correct value to mat-dialog-close directive', () => {
    component.data.isCustomer = true;
    fixture.detectChanges();

    expect(component.getForm.note.value).toBeNull();
  });

  it('should call dialogRef.close when No button is clicked', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    expect(noButton).toBeTruthy();
    noButton?.click();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display translated button texts', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];

    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    const yesButton = buttons.find(btn => btn.textContent?.includes('Ok'));

    expect(noButton?.textContent?.trim()).toContain('COMMON.BUTTON.CANCEL');
    expect(yesButton?.textContent?.trim()).toContain('Ok');
  });

  it('should initialize form with empty values', () => {
    expect(component.getForm.note.value).toBeNull();
    expect(component.getForm.customerNote.value).toBeNull();
  });

  it('onNoClick should close the dialog', () => {
    const note = '';
    const customerNote = 'Customer Note';
    component.getForm.note?.setValue(note);
    component.getForm.customerNote?.setValue(customerNote);

    component.doAction();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ note: undefined, customerNote });
  });
});
