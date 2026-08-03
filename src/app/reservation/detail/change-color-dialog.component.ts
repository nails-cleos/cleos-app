import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IColorAll } from '../../color/color';
import { combineLatestWith } from 'rxjs';
import { requireMatch } from '../../util/validators';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ColorStore } from '../../store/color.store';

type ChangeColorForm = {
  color: FormControl<IColorAll | undefined>,
}

type ChangeColorDialogData = {
  treatmentId: string,
  small: boolean;
  colorId?: string,
}

@Component({
  selector: 'app-change-color-dialog-component',
  templateUrl: './change-color-dialog.component.html',
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, TranslatePipe, MatAutocomplete, MatError,
    MatAutocompleteTrigger, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeColorDialogComponent {
  private readonly colorStore = inject(ColorStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<ChangeColorDialogComponent> = inject(
    MatDialogRef<ChangeColorDialogComponent>);
  readonly data = inject<ChangeColorDialogData>(MAT_DIALOG_DATA);

  readonly colorsSignal = computed(() => {
    const data = this.colorStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });

  form: FormGroup<ChangeColorForm> = this.formBuilder.group<ChangeColorForm>({
    color: this.formBuilder.control<IColorAll | undefined>(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  filteredColorSignal = toSignal(
    this.getForm.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.colorsSignal)),
      map(([name, colorList]) => {
        if (name) {
          return this.filterColor(name, colorList);
        } else {
          return colorList ? colorList.slice() : colorList;
        }
      }),
    ),
  );

  private readonly treatmentId = computed(() => this.data.treatmentId);

  constructor() {
    effect(() => {
      const treatmentId = this.treatmentId();
      this.colorStore.loadByExternalId(treatmentId);
    });

    effect(() => {
      const colors = this.colorsSignal();
      if (colors && this.data.colorId) {
        this.getForm.color.setValue(colors.find(color => color.id === this.data.colorId));
      }
    });
  }

  get getForm(): ChangeColorForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close({ colorId: this.getForm.color.value?.id });
  }

  displayFnColor = (color: IColorAll): string => color ? color.name : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.color.setValue(undefined);
    }
  };

  private filterColor = (name: string, colors?: IColorAll[]): IColorAll[] | undefined => colors?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
