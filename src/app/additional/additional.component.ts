import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Additional, IAdditional } from '../interfaces/additional';
import { createAdditional, getAdditional, updateAdditional } from '../store/additional.actions';
import { ITreatmentGroupAll } from '../interfaces/treatment';
import { fieldChange, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { formatDuration } from '../util/dates';
import { areEquals } from '../util/helper';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getCurrentAdditionalIdPipe,
  getGroupPipe,
  getSelectedAdditionalPipe,
  getSubErrorsPipe,
} from '../store/selectors/additional.selectors';
import { IError, isString } from '../interfaces/common';
import { AdditionalState } from '../store/reducers/additional.reducers';

type AdditionalForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  duration: FormControl<string>;
  group: FormControl<ITreatmentGroupAll | undefined>;
};

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalComponent {
  private readonly store: Store<AdditionalState> = inject(Store<AdditionalState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  private additionalId$ = this.store.pipe(getCurrentAdditionalIdPipe);
  private selectedAdditional$ = this.store.pipe(getSelectedAdditionalPipe);
  private allGroups$ = this.store.pipe(getGroupPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private additionalIdSignal = toSignal(this.additionalId$);
  private selectedAdditionalSignal = toSignal(this.selectedAdditional$);
  private allGroupsSignal = toSignal(this.allGroups$);
  private subErrorsSignal = toSignal(this.subErrors$);

  private additionalId = computed(() => this.additionalIdSignal());

  additionalSignal = computed(() => this.selectedAdditionalSignal());

  form: FormGroup<AdditionalForm> = this.formBuilder.group<AdditionalForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
    duration: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    group: this.formBuilder.control(undefined),
  });

  filteredGroupSignal: Signal<ITreatmentGroupAll[] | undefined> = toSignal(
    this.getForm.group.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.name),
      combineLatestWith(this.allGroups$),
      map(([name, groups]) => {
        if (name) {
          return this.filterGroup(name, groups);
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );
  isAddModeSignal = computed(() => !this.additionalId());
  groupsSignal = signal<ITreatmentGroupAll[]>([]);
  allGroupsWritableSignal = signal<ITreatmentGroupAll[] | undefined>(undefined);
  errors = signal<Record<string, unknown>>({});

  groupInput = viewChild.required<ElementRef<HTMLInputElement>>('groupInput');

  language: string = this.translate.currentLang;

  private currentGroupIds: string[] = [];

  constructor() {
    effect(() => {
      const selected = this.selectedAdditionalSignal();
      if (selected?.id) {
        const duration = formatDuration(selected.duration);
        const additional = Object.assign({}, selected, { duration });
        this.form.patchValue(additional);
        return additional;
      }
      return selected;
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof AdditionalForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.additionalId();
      if (id) {
        this.store.dispatch(getAdditional({ id }));
      }
    });

    effect(() => {
      const additional = this.selectedAdditionalSignal();
      const allGroups = this.allGroupsSignal();

      // Update allGroups from store
      this.allGroupsWritableSignal.set(allGroups);

      if (additional) {
        // Reset groups
        this.groupsSignal.set([]);

        // Create a fresh copy of allGroups to filter
        let filteredGroups = allGroups ? [...allGroups] : undefined;

        // Process selected groups
        const selectedGroups: ITreatmentGroupAll[] = [];
        additional.groups?.forEach((group: ITreatmentGroupAll) => {
          selectedGroups.push(group);
          filteredGroups = filteredGroups?.filter(c => c.id !== group.id);
        });

        this.groupsSignal.set(selectedGroups);
        this.allGroupsWritableSignal.set(filteredGroups);
        this.currentGroupIds = selectedGroups.map(({ id }) => id).filter(isString);
      }
    });
  }

  get getForm() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const additionalSignal = this.additionalSignal();
    const additional: IAdditional = new Additional();
    additional.name = fieldChange(this.getForm.name, additionalSignal?.name);
    additional.description = valueChange(this.getForm.description.value, additionalSignal?.description);
    additional.duration = fieldChange(this.getForm.duration, additionalSignal?.duration);

    const newGroupIds: string[] = this.groupsSignal().map(({ id }) => id).filter(isString);
    if (!areEquals(newGroupIds, this.currentGroupIds)) {
      additional.groupIds = newGroupIds;
    }

    if (this.isAddModeSignal()) {
      this.store.dispatch(createAdditional({ additional }));
    } else {
      const id = this.additionalId()!;
      this.store.dispatch(updateAdditional({ id, additional }));
    }
    return;
  }

  remove = (group: ITreatmentGroupAll): void => {
    const groups = this.groupsSignal();
    const index = groups.indexOf(group);
    if (index >= 0) {
      this.groupsSignal.update(current => current.filter((_, i) => i !== index));
      this.allGroupsWritableSignal.update(current => current ? [...current, group] : [group]);
      this.getForm.group.setValue(undefined);
    }
  };

  selectedGroup = (event: MatAutocompleteSelectedEvent): void => {
    const group = event.option.value;
    this.groupsSignal.update(current => [...current, group]);
    this.allGroupsWritableSignal.update(current => current?.filter(c => c.id !== group.id));
    this.groupInput().nativeElement.value = '';
    this.getForm.group.setValue(undefined);
  };

  sortGroups = (data: any): ITreatmentGroupAll[] => data.sort((a: any, b: any) => {
    const aName = a.name.toUpperCase();
    const bName = b.name.toUpperCase();
    return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private filterGroup = (
    name: string,
    groups: ITreatmentGroupAll[],
  ): ITreatmentGroupAll[] | undefined => groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
