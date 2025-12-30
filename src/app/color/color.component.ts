import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Color, IColor } from '../interfaces/color';
import { createColor, getColor, updateColor } from '../store/color.actions';
import { fieldChange, valueChange } from '../util/validators';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import { getCurrentColorIdPipe, getSelectedColorPipe, getSubErrorsPipe } from '../store/selectors/color.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { ColorState } from '../store/reducers/color.reducers';

type ColorForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}

@Component({
  selector: 'app-colors',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorComponent {
  private readonly store: Store<ColorState> = inject(Store<ColorState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private colorId$ = this.store.pipe(getCurrentColorIdPipe);
  private selectedColor$ = this.store.pipe(getSelectedColorPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private colorIdSignal = toSignal(this.colorId$);
  private subErrorsSignal = toSignal(this.subErrors$);

  colorSignal = toSignal(this.selectedColor$);
  isAddModeSignal = computed(() => !this.colorIdSignal());
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
      const id = this.colorIdSignal();
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

    if (this.isAddModeSignal()) {
      this.store.dispatch(createColor({ color }));
    } else {
      const id = this.colorIdSignal()!;
      this.store.dispatch(updateColor({ id, color }));
    }
    return;
  }
}
