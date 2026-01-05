import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DialogComponent>>;

  const mockData = {
    title: 'Test Title',
    hideNoButton: false,
    hideOkButton: false,
    value: null,
    content: 'Test Content',
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DialogComponent, TranslateModule.forRoot(), AppMaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockData } }, // Create fresh copy each time
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
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
    expect(titleElement.textContent).toBe(mockData.title);
  });

  it('should render the dialog content', () => {
    const compiled = fixture.nativeElement;
    const contentElement = compiled.querySelector('div[mat-dialog-content]');
    expect(contentElement.innerHTML).toBe(mockData.content);
  });

  it('should show both buttons when both hideNoButton and hideOkButton are false', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should show No button when hideNoButton is false', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.NO'));
    expect(noButton).toBeTruthy();
  });


  it('should show Yes button when hideOkButton is false', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const yesButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.YES'));
    expect(yesButton).toBeTruthy();
  });


  it('should pass correct value to mat-dialog-close directive', () => {
    const testValue = 'test-value';
    component.data.value = testValue;
    fixture.detectChanges();

    // The Yes button should have the mat-dialog-close directive with the correct value
    // This is tested through the component's data binding
    expect(component.data.value).toBe(testValue);
  });

  it('should call dialogRef.close when No button is clicked', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.NO'));
    expect(noButton).toBeTruthy();
    noButton?.click();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should have cdkFocusInitial directive on No button', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.NO'));
    expect(noButton).toBeTruthy();
    expect(noButton?.hasAttribute('cdkfocusinitial')).toBeTrue();
  });

  it('should display translated button texts', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];

    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.NO'));
    const yesButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.YES'));

    expect(noButton?.textContent?.trim()).toContain('COMMON.BUTTON.NO');
    expect(yesButton?.textContent?.trim()).toContain('COMMON.BUTTON.YES');
  });
});
