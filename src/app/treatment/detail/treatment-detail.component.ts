import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectTreatmentState } from '../../store/app.states';
import * as fromActionsTreatment from '../../store/treatment.actions';
import { fieldChange, valueChange } from '../../util/validators';
import { ITreatment, ITreatmentGroup, Treatment, TreatmentGroup } from '../../interfaces/treatment';
import { createNewDate, formatDuration, getNow, getTime, getTimeNumber } from '../../util/dates';
import { IColorAll } from '../../interfaces/color';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { areEquals } from '../../util/helper';

@Component({
  selector: 'app-treatment-detail',
  templateUrl: './treatment-detail.component.html',
  styleUrls: ['./treatment-detail.component.scss']
})
export class TreatmentDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputName') inputName?: ElementRef<HTMLInputElement>;
  @ViewChild('colorInput') colorInput!: ElementRef<HTMLInputElement>;
  @Input() group?: ITreatmentGroup;

  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  selected = new UntypedFormControl(0);
  treatments: ITreatment[] = [];

  color = new UntypedFormControl();
  filteredColors?: Observable<IColorAll[] | undefined>;
  colors: IColorAll[] = [];
  allColors?: IColorAll[];

  errors: any = [];

  private subscription?: Subscription;
  private getState: Observable<any>;
  private currentColorIds: string[] = [];

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectTreatmentState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    let hasError = false;
    this.treatments = this.treatments.map((tab: ITreatment) => {
      const errors: any = {};
      if (!tab.name || tab.name.trim().length === 0) {
        errors.name = 'REQUIRED';
        hasError = true;
      }
      if (!tab.time || tab.time.trim().length === 0) {
        errors.time = 'REQUIRED';
        hasError = true;
      }
      return Object.assign({}, tab, { errors });
    });

    if (hasError) {
      return;
    }

    const group: ITreatmentGroup = new TreatmentGroup();
    group.id = this.group?.id;
    group.name = fieldChange(this.name, this.group?.name);
    group.description = valueChange(this.form.value?.description, this.group?.description);
    group.durabilityMin = valueChange(this.form.value?.durabilityMin, this.group?.durabilityMin);
    group.durabilityMax = valueChange(this.form.value?.durabilityMax, this.group?.durabilityMax);
    group.treatments = this.treatments;

    const newColorIds = this.colors.map(({ id }) => id);
    if (!areEquals(newColorIds, this.currentColorIds)) {
      group.colors = newColorIds;
    }

    return this.store.dispatch(new fromActionsTreatment.TreatmentUpdate(group));
  }

  get addTab(): void {
    if (this.inputName) {
      const treatment: ITreatment = new Treatment(this.inputName.nativeElement.value);
      this.inputName.nativeElement.value = '';

      this.treatments.push(treatment);
      this.selected.setValue(this.treatments.length - 1);
    }
    return;
  }

  ngOnInit(): void {
    this.getColors();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getTreatment();
  }

  removeTab(index: number): void {
    this.treatments.splice(index, 1);
  }

  setValue(treatment: ITreatment, attribute: string, $event: any): void {
    // @ts-ignore
    treatment[attribute] = $event.target.value;
  }

  setTime(treatment: ITreatment, $event: any): void {
    const time = getTimeNumber($event);
    const date = createNewDate(getNow(), time?.hour, time?.minute);
    treatment.time = getTime(date);
  }

  setPrimary(tab: ITreatment): void {
    this.treatments = this.treatments.map(t => {
      t.primary = false;
      return t;
    });

    tab.primary = true;
  }

  remove(color: IColorAll): void {
    const index = this.colors.indexOf(color);
    if (index >= 0) {
      this.colors.splice(index, 1);
      this.allColors?.push(color);
      this.color.setValue(null);
    }
  }

  selectedColor(event: MatAutocompleteSelectedEvent): void {
    const color = event.option.value;
    this.colors.push(color);
    this.allColors = this.allColors?.filter(c => c.id !== color.id);
    this.colorInput.nativeElement.value = '';
    this.color.setValue(null);
  }

  sortColors(data: any): IColorAll[] {
    return data.sort((a: any, b: any) => {
      const aName = a.name.toUpperCase();
      const bName = b.name.toUpperCase();
      return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new UntypedFormControl(),
      durabilityMin: new UntypedFormControl(),
      durabilityMax: new UntypedFormControl(),
      color: this.color
    });

    this.filteredColors = this.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(
        name => name ? this.filter(name) : (this.allColors ? this.allColors.slice() : this.allColors))
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.allColors = state.colors;
      if (state.selected) {
        this.group = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          durabilityMin: state.selected.durabilityMin,
          durabilityMax: state.selected.durabilityMax
        } as ITreatmentGroup;
        this.colors = [];
        state.selected.colors?.forEach((color: IColorAll) => {
          this.colors.push(color);
          this.allColors = this.allColors?.filter(c => c.id !== color.id);
        });
        this.currentColorIds = this.colors.map(({ id }) => id);

        this.form.patchValue(this.group);

        this.treatments = [...state.selected.treatments?.map(
          (p: ITreatment) => Object.assign({}, p, { time: formatDuration(p.duration!!), errors: {} }))];
      }
      this.cdRef.detectChanges();
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['treatments']);
      }
    });
  }

  private getColors(): void {
    this.store.dispatch(
      new fromActionsTreatment.GetColors()
    );
  }

  private getTreatment(): void {
    if (!this.group) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsTreatment.TreatmentFind({ id, path: 'edit' })
      );
    }
  }

  private filter(name: string): IColorAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allColors?.filter(option => option?.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
