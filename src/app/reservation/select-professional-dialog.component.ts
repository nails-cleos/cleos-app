import { Component, Inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { requireMatch } from '../util/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../util/app-material.module';

@Component({
  selector: 'app-select-professional-dialog-component',
  templateUrl: './select-professional-dialog.component.html',
  imports: [AppMaterialModule, AsyncPipe, TranslatePipe, ReactiveFormsModule],
})
export class SelectProfessionalDialogComponent implements OnInit {
  professionalForm!: UntypedFormGroup;
  professionals?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);

  constructor(public dialogRef: MatDialogRef<SelectProfessionalDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: UntypedFormBuilder) {
    this.professionals = data.professionals;
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    return this.dialogRef.close({ professional: this.professional.value });
  }

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.professional.setValue('');
    }
  };

  private createForm = (): void => {
    this.professionalForm = this.formBuilder.group({
      professional: this.professional,
    });
  };

  private createFilters = (): void => {
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProfessional(
        name) : this.professionals ? this.professionals.slice() : this.professionals),
    );
  };

  private filterProfessional = (name: string): IUser[] | undefined => this.professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
