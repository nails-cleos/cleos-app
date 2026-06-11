import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject, input,
  output,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Additional, AdditionalForm, IAdditional, IAdditionalAll } from './additional';
import { ITreatmentGroupAll } from '../treatment/treatment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError, isString } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatOption } from '@angular/material/core';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { AdditionalStore } from '../store/additional.store';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, TranslatePipe,
    RouterLink, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix,
    ReactiveFormsModule, TimepickerDirective, TimepickerComponent, MatHint, MatChipGrid, MatChipRow, MatChipInput,
    MatChipRemove, BackButtonDirective, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalComponent {
  config = input.required<ICommon>();
  additional = input<IAdditionalAll | undefined>();
  submitData = output<IAdditional>();

  private readonly additionalStore = inject(AdditionalStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  private allGroupsSignal = this.additionalStore.groups;
  private subErrorsSignal = this.additionalStore.subErrors;

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
      combineLatestWith(toObservable(this.allGroupsSignal)),
      map(([name, groups]) => {
        if (name) {
          return this.filterGroup(name, groups ?? []);
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );
  groupsSignal = signal<ITreatmentGroupAll[]>([]);
  allGroupsWritableSignal = signal<ITreatmentGroupAll[] | undefined>(this.allGroupsSignal());
  errors = signal<Record<string, unknown>>({});

  groupInput = viewChild.required<ElementRef<HTMLInputElement>>('groupInput');

  language: string = this.translate.getCurrentLang();

  private currentGroupIds: string[] = [];

  constructor() {
    this.additionalStore.loadGroups();

    effect(() => {
      const selected = this.additional();
      if (selected) {
        this.form.patchValue(selected);
      }
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
      const additional = this.additional();
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

  get getConfig(): ICommon {
    return this.config();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const newGroupIds: string[] = this.groupsSignal().map(({ id }) => id).filter(isString);
    this.submitData.emit(Additional.fromForm(this.getForm, this.additional(), newGroupIds, this.currentGroupIds));
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
