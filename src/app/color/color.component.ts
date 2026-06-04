import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Color, IColor, IColorAll } from '../interfaces/color';
import { fieldChange, valueChange } from '../util/validators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon, IError } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ColorStore } from '../store/color.store';

type ColorForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe, MatError,
    BackButtonDirective, BackButtonDirective, MatHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorComponent {
  config = input.required<ICommon>();
  color = input<IColorAll | undefined>();

  submitData = output<IColor>();

  private readonly colorStore = inject(ColorStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private subErrorsSignal = this.colorStore.subErrors;
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<ColorForm> = this.formBuilder.group<ColorForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
  });

  constructor() {
    effect(() => {
      const selected = this.color();
      if (selected) {
        this.form.patchValue(selected);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof ColorForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });
  }
  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): ColorForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const colorInput = this.color();
    const color: IColor = new Color();
    color.name = fieldChange(this.getForm.name, color?.name);
    color.description = valueChange(this.getForm.description.value, colorInput?.description);

    this.submitData.emit(color);
  }
}
