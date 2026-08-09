import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { IUserAll } from '../user/user';
import { provideTranslateService } from '@ngx-translate/core';

describe('SelectProfessionalDialogComponent', () => {
  let component: SelectProfessionalDialogComponent;
  let fixture: ComponentFixture<SelectProfessionalDialogComponent>;

  let dialogRefSpy: Pick<
    MatDialogRef<SelectProfessionalDialogComponent>,
    'close'
  > & {
    close: ReturnType<typeof vi.fn>;
  };

  const mockProfessionals: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  const mockProfessionalDialogData = {
    professionals: mockProfessionals,
    small: true,
  };

  beforeEach(async () => {
    dialogRefSpy = {
      close: vi.fn().mockName('MatDialogRef.close'),
    };

    await TestBed.configureTestingModule({
      imports: [SelectProfessionalDialogComponent],
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => mockProfessionalDialogData,
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProfessionalDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update customersWritableSignal when store emits', () => {
    expect(component.professionals()).toEqual(mockProfessionals);
  });

  it('should filter customers', () => {
    const result = component['filterProfessional']('Bo', mockProfessionals);
    expect(result!.length).toBe(1);
    expect(result![0].displayName).toBe('Bob');
  });

  it('should close dialog with selected customers', () => {
    component.getForm.professional.setValue(mockProfessionals[0]);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      professional: mockProfessionals[0],
    });
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should clear customer form control when keyDownHandler is called with Backspace', () => {
    component.getForm.professional.setValue(mockProfessionals[0]);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.professional.value).toBe(undefined);
  });
});
