import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  createTreatment,
  getAllTreatmentsHistory,
  getTreatmentGroup,
  treatmentSelected,
  updateTreatmentGroup,
} from '../store/actions/treatment.actions';
import { Store } from '@ngrx/store';
import { combineLatestWith } from 'rxjs';
import { ITreatment, ITreatmentGroup, Treatment, TreatmentGroup } from '../interfaces/treatment';
import { createNewDate, formatDuration, getNowTimeZone, getTime, getTimeNumber } from '../util/dates';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IColorAll } from '../interfaces/color';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { fieldChange } from '../util/validators';
import { areEquals } from '../util/helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackButtonDirective } from '../directives/back-button.directive';
import { TreatmentState } from '../store/reducers/treatment.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import { getColorsPipe, getHistoriesPipe, getSelectedTreatmentPipe, getSubErrorsPipe } from '../store/selectors/treatment.selectors';
import { IError, isString } from '../interfaces/common';
import { DurationTimePipe } from '../pipes/durationTime.pipe';
import { TreatmentTableComponent } from './table/treatment-table.component';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChip, MatChipGrid, MatChipInput, MatChipListbox, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';

type TreatmentMode = 'add' | 'edit' | 'view';

type TreatmentForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  priceFrom: FormControl<string | undefined>;
  color: FormControl<IColorAll | undefined>;
};

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatIconButton, MatButton, ReactiveFormsModule,
    TranslatePipe, RouterLink, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix, BackButtonDirective,
    BackButtonDirective, DurationTimePipe, TreatmentTableComponent, MatHint, MatChipGrid, MatChipRow, MatChipInput,
    MatTabGroup, MatTab, TimepickerDirective, TimepickerComponent, MatChipListbox, MatChip, MatChipRemove,
    MatSuffix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentComponent {
  id = input<string>();
  mode = input<TreatmentMode>();

  private readonly store: Store<TreatmentState> = inject(Store<TreatmentState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly translate: TranslateService = inject(TranslateService);

  private selectedTreatment$ = this.store.pipe(getSelectedTreatmentPipe);
  private allColors$ = this.store.pipe(getColorsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private histories$ = this.store.pipe(getHistoriesPipe);

  private selectedTreatmentSignal = toSignal(this.selectedTreatment$);
  private allColorsSignal = toSignal(this.allColors$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private historiesSignal = toSignal(this.histories$);
  private routeModeSignal = toSignal(
    this.route.url.pipe(map(segments => segments.at(-1)?.path ?? 'add')),
    { initialValue: this.route.snapshot.url.at(-1)?.path ?? 'add' },
  );

  private selectedHistoryTreatmentId = signal<string | undefined>(undefined);

  resolvedMode = computed<TreatmentMode>(() => {
    const mode = this.mode();
    if (mode) {
      return mode;
    }
    if (this.routeModeSignal() === 'view') {
      return 'view';
    }
    return this.id() ? 'edit' : 'add';
  });
  treatmentSignal = computed(() => this.selectedTreatmentSignal());
  viewTreatmentSignal = computed(() => {
    const group = this.selectedTreatmentSignal();
    const histories = this.historiesSignal();
    const selectedHistoryTreatmentId = this.selectedHistoryTreatmentId();

    if (!group) {
      return group;
    }

    return {
      ...group,
      treatments: group.treatments?.map(treatment => {
        if (treatment.id === selectedHistoryTreatmentId) {
          return { ...treatment, showHistory: true, history: histories };
        }
        return treatment;
      }),
    };
  });

  form: FormGroup<TreatmentForm> = this.formBuilder.group<TreatmentForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
    priceFrom: this.formBuilder.control(undefined),
    color: this.formBuilder.control(undefined),
  });

  filteredColorSignal: Signal<IColorAll[] | undefined> = toSignal(
    this.getForm.color.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.name),
      combineLatestWith(this.allColors$),
      map(([name, colors]) => {
        if (name) {
          return this.filter(name, colors);
        } else {
          return colors ? colors.slice() : colors;
        }
      }),
    ),
  );
  isAddModeSignal = computed(() => this.resolvedMode() === 'add');
  isViewModeSignal = computed(() => this.resolvedMode() === 'view');
  colorsSignal = signal<IColorAll[]>([]);
  allColorsWritableSignal = signal<IColorAll[] | undefined>(undefined);
  errors = signal<Record<string, unknown>>({});

  colorInput = viewChild<ElementRef<HTMLInputElement>>('colorInput');
  nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  selected = new FormControl(0);

  treatmentsSignal = signal<ITreatment[]>([]);

  language: string = this.translate.getCurrentLang();

  private currentColorIds: string[] = [];

  constructor() {
    effect(() => {
      const treatment = this.selectedTreatmentSignal();
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
      return treatment;
    });

    effect(() => {
      const id = this.id();
      const mode = this.resolvedMode();
      if (id) {
        this.store.dispatch(getTreatmentGroup({ id, path: mode }));
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
      const treatment = this.selectedTreatmentSignal();
      const allColors = this.allColorsSignal();

      // Update allColors from store
      this.allColorsWritableSignal.set(allColors);

      if (treatment) {
        // Reset treatments
        this.colorsSignal.set([]);

        // Create a fresh copy of allColors to filter
        let filteredColors = allColors ? [...allColors] : undefined;

        // Process selected treatments
        const selectedColors: IColorAll[] = [];
        treatment.colors?.forEach((color: IColorAll) => {
          selectedColors.push(color);
          filteredColors = filteredColors?.filter(c => c.id !== color.id);
        });

        this.colorsSignal.set(selectedColors);
        this.allColorsWritableSignal.set(filteredColors);
        this.currentColorIds = selectedColors.map(({ id }) => id).filter(isString);
      }
    });
  }

  get getForm(): TreatmentForm {
    return this.form.controls;
  }

  submit() {
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

    const groupSignal = this.treatmentSignal();
    const treatmentGroup: ITreatmentGroup = new TreatmentGroup();
    treatmentGroup.name = fieldChange(this.getForm.name, groupSignal?.name);
    treatmentGroup.description = fieldChange(this.getForm.description, groupSignal?.description);
    treatmentGroup.priceFrom = fieldChange(this.getForm.priceFrom, groupSignal?.priceFrom);
    treatmentGroup.treatments = this.treatmentsSignal();

    const newColorIds = this.colorsSignal().map(({ id }) => id);
    if (!areEquals(newColorIds, this.currentColorIds)) {
      treatmentGroup.colorIds = newColorIds;
    }

    const id = this.id();
    if (!id) {
      this.store.dispatch(createTreatment({ treatmentGroup }));
    } else {
      this.store.dispatch(updateTreatmentGroup({ id, treatmentGroup }));
    }
  }

  addTab() {
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
    const index = colors.indexOf(color);
    if (index >= 0) {
      this.colorsSignal.update(current => current.filter((_, i) => i !== index));
      this.allColorsWritableSignal.update(current => current ? [...current, color] : [color]);
      this.getForm.color.setValue(undefined);
    }
  };

  selectedColor = (event: MatAutocompleteSelectedEvent): void => {
    const color = event.option.value;
    this.colorsSignal.update(current => [...current, color]);
    this.allColorsWritableSignal.update(current => current?.filter(c => c.id !== color.id));
    const input = this.colorInput();
    if (input) {
      input.nativeElement.value = '';
    }
    this.getForm.color.setValue(undefined);
  };

  edit = (): void => {
    this.store.dispatch(treatmentSelected({ selected: this.selectedTreatmentSignal(), path: 'edit' }));
  };

  getHistory = (treatmentId?: string): void => {
    const id = this.selectedTreatmentSignal()?.id;
    if (!id || !treatmentId) {
      return;
    }

    this.selectedHistoryTreatmentId.set(treatmentId);
    this.store.dispatch(getAllTreatmentsHistory({ id, treatmentId }));
  };

  sortColors = (data?: IColorAll[]): IColorAll[] | undefined => data?.sort((a: any, b: any) => {
    const aName = a.name.toUpperCase();
    const bName = b.name.toUpperCase();
    return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private filter = (name: string, allColors?: IColorAll[]): IColorAll[] | undefined => allColors?.filter(
    option => option?.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
