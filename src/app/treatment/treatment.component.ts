import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { combineLatestWith } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IColorAll } from '../color/color';
import { ICommon, IError, isString } from '../interfaces/common';
import {
  ITreatment,
  ITreatmentGroup,
  ITreatmentGroupAll,
  Treatment,
  TreatmentForm,
  TreatmentGroup,
} from './treatment';
import { createNewDate, formatDuration, getNowTimeZone, getTime, getTimeNumber } from '../util/dates';
import { BackButtonDirective } from '../directives/back-button.directive';
import { TreatmentStore } from '../store/treatment.store';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatIconButton, MatButton, ReactiveFormsModule,
    TranslatePipe, RouterLink, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix, BackButtonDirective,
    BackButtonDirective, MatHint, MatChipGrid, MatChipRow, MatChipInput, MatTabGroup, MatTab, TimepickerDirective,
    TimepickerComponent, MatChipRemove, MatSuffix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentComponent {
  config = input.required<ICommon>();
  treatment = input<ITreatmentGroupAll>();

  submitData = output<ITreatmentGroup>();

  private readonly treatmentStore = inject(TreatmentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  private subErrorsSignal = this.treatmentStore.subErrors;

  form: FormGroup<TreatmentForm> = this.formBuilder.group<TreatmentForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
    priceFrom: this.formBuilder.control(undefined),
    color: this.formBuilder.control(undefined),
  });

  colors = computed(() => this.treatmentStore.colors());
  colorsSignal = signal<IColorAll[]>([]);
  allColorsWritableSignal = signal<IColorAll[] | undefined>(undefined);
  filteredColorSignal: Signal<IColorAll[] | undefined> = toSignal(
    this.getForm.color.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.name),
      combineLatestWith(toObservable(this.allColorsWritableSignal)),
      map(([name, colors]) => {
        if (name) {
          return this.filter(name, colors);
        } else {
          return colors ? colors.slice() : colors;
        }
      }),
    ),
  );
  errors = signal<Record<string, unknown>>({});

  colorInput = viewChild<ElementRef<HTMLInputElement>>('colorInput');
  nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  selected = new FormControl(0);

  treatmentsSignal = signal<ITreatment[]>([]);

  language: string = this.translate.getCurrentLang();
  private currentColorIds: string[] = [];

  constructor() {
    this.treatmentStore.loadColors();

    effect(() => {
      const treatment = this.treatment();
      if (treatment?.id) {
        this.form.patchValue(treatment);
        this.treatmentsSignal.set(
          treatment.treatments?.map(t => Object.assign({}, t, {
            time: formatDuration(t.duration),
            errors: {},
            primary: t.primary ?? false,
          })) || [],
        );
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof TreatmentForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const treatment = this.treatment();
      const allColors = this.colors();

      if (treatment) {
        const selectedColors: IColorAll[] = [];
        treatment.colors?.forEach((color: IColorAll) => {
          selectedColors.push(color);
        });

        this.colorsSignal.set(selectedColors);
        this.allColorsWritableSignal.set(this.excludeSelectedColors(allColors, selectedColors));
        this.currentColorIds = selectedColors.map(({ id }) => id).filter(isString);
        return;
      }

      this.allColorsWritableSignal.set(this.excludeSelectedColors(allColors, this.colorsSignal()));
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): TreatmentForm {
    return this.form.controls;
  }

  submit(): void {
    let hasError = false;
    const treatments = this.treatmentsSignal();
    if (!treatments.length) {
      hasError = true;
      this.errors.update(prev => ({ ...prev, treatments: 'REQUIRED' }));
    }
    this.treatmentsSignal.set(treatments.map((tab: ITreatment, i) => {
      const errors: any = {};
      if (!tab.name || tab.name.trim().length === 0) {
        errors.name = 'REQUIRED';
        hasError = true;
      }
      if (!tab.time || tab.time.trim().length === 0) {
        errors.time = 'REQUIRED';
        hasError = true;
      }
      return Object.assign({}, tab, { errors, order: i });
    }));

    if (hasError || this.form.invalid) {
      return;
    }

    const newColorIds = this.colorsSignal().map(({ id }) => id);
    const treatmentGroup: ITreatmentGroup = TreatmentGroup.fromForm(
      this.getForm,
      this.treatment(),
      this.treatmentsSignal(),
      newColorIds,
      this.currentColorIds,
    );

    this.submitData.emit(treatmentGroup);
  }

  addTab(): void {
    const input = this.nameInput();
    if (input) {
      const treatment: ITreatment = new Treatment(input.nativeElement.value, !this.treatmentsSignal().length);
      input.nativeElement.value = '';

      this.treatmentsSignal.update(current => [...current, treatment]);
      this.selected.setValue(this.treatmentsSignal().length - 1);
    }
  }

  removeTab = (index: number): void => {
    this.treatmentsSignal.update(current => current.filter((_, i) => i !== index));
  };

  setValue = (treatment: ITreatment, attribute: string, $event: any): void => {
    // @ts-expect-error assign value in treatment[attribute]
    treatment[attribute] = $event.target.value;
  };

  setTime = (treatment: ITreatment, $event: any): void => {
    const time = getTimeNumber($event);
    const date = createNewDate(getNowTimeZone(), time?.hour, time?.minute);
    treatment.time = getTime(date);
  };

  remove = (color: IColorAll): void => {
    const colors = this.colorsSignal();
    const index = colors.findIndex(({ id }) => id === color.id);
    if (index >= 0) {
      this.colorsSignal.update(current => current.filter((_, i) => i !== index));
      this.allColorsWritableSignal.update(current => this.addAvailableColor(current, color));
      this.getForm.color.setValue(undefined);
    }
  };

  selectedColor = (event: MatAutocompleteSelectedEvent): void => {
    const color = event.option.value;
    this.colorsSignal.update(current => current.some(({ id }) => id === color.id) ? current : [...current, color]);
    this.allColorsWritableSignal.update(current => current?.filter(c => c.id !== color.id));
    const input = this.colorInput();
    if (input) {
      input.nativeElement.value = '';
    }
    this.getForm.color.setValue(undefined);
  };

  sortColors = (data?: IColorAll[]): IColorAll[] | undefined => data?.sort((a: any, b: any) => {
    const aName = a.name.toUpperCase();
    const bName = b.name.toUpperCase();
    return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private filter = (name: string, allColors?: IColorAll[]): IColorAll[] | undefined => allColors?.filter(
    option => option?.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private excludeSelectedColors(
    allColors: IColorAll[] | undefined,
    selectedColors: IColorAll[],
  ): IColorAll[] | undefined {
    const selectedIds = new Set(selectedColors.map(({ id }) => id).filter(isString));
    return allColors?.filter(({ id }) => !id || !selectedIds.has(id));
  }

  private addAvailableColor(current: IColorAll[] | undefined, color: IColorAll): IColorAll[] {
    const colors = current ?? [];
    return colors.some(({ id }) => id === color.id) ? colors : [...colors, color];
  }
}
