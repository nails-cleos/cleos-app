import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Color, IColor } from '../interfaces/color';
import { createColor, getColor, updateColor } from '../store/color.actions';
import { TranslateService } from '@ngx-translate/core';
import { fieldChange, valueChange } from '../util/validators';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  getCurrentColorIdPipe,
  getColorResponsePipe,
  getSelectedColorPipe,
  getSubErrorsPipe,
} from '../store/selectors/color.selectors';
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
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private colorId$ = this.store.pipe(getCurrentColorIdPipe);
  private selectedColor$ = this.store.pipe(getSelectedColorPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getColorResponsePipe);

  private colorIdSignal = toSignal(this.colorId$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  colorSignal = toSignal(this.selectedColor$);
  isAddModeSignal = computed(() => !this.colorIdSignal());
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<ColorForm> = this.formBuilder.group<ColorForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
  });

  private readonly language: string = this.translate.currentLang;

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
      if (this.responseSignal()) {
        this.router.navigate([this.language, 'colors']);
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
