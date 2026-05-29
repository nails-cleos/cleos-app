import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Color, IColor } from '../interfaces/color';
import { createColor, getColor, updateColor } from '../store/color.actions';
import { fieldChange, valueChange } from '../util/validators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { getSelectedColorPipe, getSubErrorsPipe } from '../store/selectors/color.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { ColorState } from '../store/reducers/color.reducers';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

type ColorForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}

@Component({
  selector: 'app-colors',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe, MatError,
    BackButtonDirective, BackButtonDirective, MatHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorComponent {
  id = input<string>();

  private readonly store: Store<ColorState> = inject(Store<ColorState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private selectedColor$ = this.store.pipe(getSelectedColorPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private subErrorsSignal = toSignal(this.subErrors$);

  colorSignal = toSignal(this.selectedColor$);
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
        this.store.dispatch(getColor({ id }));
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
      this.store.dispatch(createColor({ color }));
    } else {
      this.store.dispatch(updateColor({ id, color }));
    }
    return;
  }
}
