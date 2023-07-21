import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { requireMatch } from '../util/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFullUserName, getUserName } from '../util/helper';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-select-professional-dialog-component',
  templateUrl: './select-professional-dialog.component.html'
})
export class SelectProfessionalDialogComponent implements OnInit {
  professionalForm!: UntypedFormGroup;
  professionals?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  constructor(public dialogRef: MatDialogRef<SelectProfessionalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    this.professionals = data.professionals;
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ professional: this.professional.value });
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
  }

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.professional.setValue('');
    }
  }

  private createForm(): void {
    this.professionalForm = this.formBuilder.group({
      professional: this.professional
    });
  }

  private createFilters(): void {
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProfessional(
        name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
  }

  private filterProfessional(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}
