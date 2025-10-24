import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { IUser } from '../interfaces/user';
import { TranslateModule } from '@ngx-translate/core';

describe('SelectProfessionalDialogComponent', () => {
  let component: SelectProfessionalDialogComponent;
  let fixture: ComponentFixture<SelectProfessionalDialogComponent>;

  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SelectProfessionalDialogComponent>>;

  const mockProfessionals: IUser[] = [
    { displayName: 'Alice', id: '1' } as IUser,
    { displayName: 'Bob', id: '2' } as IUser,
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SelectProfessionalDialogComponent, TranslateModule.forRoot()],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { professionals: mockProfessionals } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProfessionalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and filters on ngOnInit', () => {
    component.ngOnInit();
    expect(component.professionalForm).toBeDefined();
    expect(component.filteredProfessional).toBeDefined();
  });

  it('should close dialog on onNoClick', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should close dialog with professional on doAction', () => {
    component.professional.setValue(mockProfessionals[0]);
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ professional: mockProfessionals[0] });
  });

  it('should display user name correctly', () => {
    const user: IUser = { displayName: 'Alice' } as IUser;
    expect(component.displayFnUser(user)).toBe('Alice');
    expect(component.displayFnUser({} as IUser)).toBe('');
  });

  it('should clear professional input on Backspace', () => {
    component.professional.setValue('test');
    const event = { code: 'Backspace' };
    component.keyDownHandler(event);
    expect(component.professional.value).toBe('');
  });

  it('should filter professionals correctly', (done) => {
    let emissionCount = 0;
    component.filteredProfessional?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered?.length).toBe(1);
        expect(filtered).toEqual([
          { displayName: 'Alice', id: '1' } as IUser,
        ]);
        done();
      }
    });

    component.professional.setValue('A');
  });
});
