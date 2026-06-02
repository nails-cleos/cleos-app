import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Color, IColor } from '../interfaces/color';
import { fieldChange, valueChange } from '../util/validators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { IError } from '../interfaces/common';
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
  id = input<string>();

  private readonly colorStore = inject(ColorStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private subErrorsSignal = this.colorStore.subErrors;
  colorSignal = this.colorStore.selected;
  isAddModeSignal = computed(() => !this.id());
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<ColorForm> = this.formBuilder.group<ColorForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
  });

  constructor() {
    effect(() => {
      const selected = this.colorSignal();
      if (selected?.id) {
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

    effect(() => {
      const id = this.id();
      if (id) {
        this.colorStore.loadById(id);
      } else {
        this.colorStore.clean();
      }
    });
  }

  get getForm(): ColorForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const colorSignal = this.colorSignal();
    const color: IColor = new Color();
    color.name = fieldChange(this.getForm.name, colorSignal?.name);
    color.description = valueChange(this.getForm.description.value, colorSignal?.description);

    const id = this.id();
    if (!id) {
      this.colorStore.create(color);
    } else {
      this.colorStore.update(id, color);
    }
    return;
  }
}
