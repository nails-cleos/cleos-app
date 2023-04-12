import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromActionsTreatment from '../store/treatment.actions';
import { AppState, selectTreatmentState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ITreatment, ITreatmentGroup, Treatment, TreatmentGroup } from '../interfaces/treatment';
import { createNewDate, getNow, getTime } from '../util/dates';
import { Router } from '@angular/router';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss']
})
export class TreatmentComponent implements OnInit, OnDestroy {
  @ViewChild('inputName') inputName: ElementRef<HTMLInputElement> | undefined;

  form!: UntypedFormGroup;
  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  selected = new UntypedFormControl(0);
  treatments: ITreatment[] = [];

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
      return Object.assign({}, tab, {errors});
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
    const time = $event.split(':');
    const date = createNewDate(getNow(), time[0], time[1]);
    treatment.time = getTime(date);
  }

  setPrimary(tab: ITreatment): void {
    this.treatments = this.treatments.map(t => {
      t.primary = false;
      return t;
    });

    tab.primary = true;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new UntypedFormControl(),
      durabilityMin: new UntypedFormControl(),
      durabilityMax: new UntypedFormControl()
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsTreatment.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['treatments']);
      }
    });
  }
}
