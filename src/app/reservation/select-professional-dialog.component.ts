import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser, IUserAll } from '../interfaces/user';
import { combineLatestWith } from 'rxjs';
import { requireMatch } from '../util/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../util/app-material.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

type ProfessionalForm = {
  professional: FormControl<IUserAll | undefined>;
}

export type ProfessionalDialogData = {
  professionals?: IUserAll[],
  small: boolean;
}

@Component({
  selector: 'app-select-professional-dialog-component',
  templateUrl: './select-professional-dialog.component.html',
  imports: [AppMaterialModule, TranslatePipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectProfessionalDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<SelectProfessionalDialogComponent> = inject(
    MatDialogRef<SelectProfessionalDialogComponent>);
  readonly data = inject<ProfessionalDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<ProfessionalForm> = this.formBuilder.group<ProfessionalForm>({
    professional: this.formBuilder.control<IUserAll | undefined>(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  professionals = computed(() => this.data.professionals);
  filteredProfessionalSignal = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(undefined),
      map(value => typeof value === 'string' ? value : value?.displayName),
      combineLatestWith(toObservable(this.professionals)),
      map(([name, professionalList]) => {
        if (name) {
          return this.filterProfessional(name, professionalList);
        } else {
          return professionalList ? professionalList.slice() : professionalList;
        }
      }),
    ),
  );

  constructor() {
  }

  get getForm(): ProfessionalForm {
    return this.form.controls;
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    return this.dialogRef.close({ professional: this.getForm.professional.value });
  }

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.professional.setValue(undefined);
    }
  };

  private filterProfessional = (
    name: string,
    professionals?: IUserAll[],
  ): IUserAll[] | undefined => professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
