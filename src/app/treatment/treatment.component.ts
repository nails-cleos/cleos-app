import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromActionsTreatment from '../store/treatment.actions';
import { AppState, selectTreatmentState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ITreatment, ITreatmentGroup, Treatment, TreatmentGroup } from '../interfaces/treatment';
import { createNewDate, getNow, getTime, getTimeNumber } from '../util/dates';
import { Router } from '@angular/router';
import { IColorAll } from '../interfaces/color';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { IUserAll } from '../interfaces/user';
import { getFullUserName } from '../util/helper';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss']
})
export class TreatmentComponent implements OnInit, OnDestroy {
  @ViewChild('inputName') inputName: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('colorInput') colorInput!: ElementRef<HTMLInputElement>;

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

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectTreatmentState);
  }

  get create(): void {
    let hasError = false;
    if (!this.treatments.length) {
      hasError = true;
      this.errors.treatments = 'REQUIRED';
    }
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

    if (hasError || this.form.invalid) {
      return;
    }

    const group: ITreatmentGroup = new TreatmentGroup();
    group.name = this.name.value;
    group.description = this.form.value.description;
    group.durabilityMin = this.form.value.durabilityMin;
    group.durabilityMax = this.form.value.durabilityMax;
    group.treatments = this.treatments;
    group.colors = this.colors.map(c => c.id);

    return this.store.dispatch(
      new fromActionsTreatment.TreatmentSave(group)
    );
  }

  get addTab(): void {
    if (this.inputName) {
      const treatment: ITreatment = new Treatment(this.inputName.nativeElement.value, !this.treatments.length);
      this.inputName.nativeElement.value = '';

      this.treatments.push(treatment);
      this.selected.setValue(this.treatments.length - 1);
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.getColors();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  removeTab(index: number): void {
    this.treatments.splice(index, 1);
  }

  setValue(treatment: ITreatment, attribute: string, $event: any): void {
    // @ts-ignore
    treatment[attribute] = $event.target.value;
  }

  setTime(treatment: ITreatment, $event: any): void {
    const time = getTimeNumber($event)!;
    const date = createNewDate(getNow(), time.hour, time.minute);
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

  private getColors(): void {
    this.store.dispatch(
      new fromActionsTreatment.GetColors()
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsTreatment.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.allColors = state.colors;
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

  private filter(name: string): IColorAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allColors?.filter(option => option?.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
