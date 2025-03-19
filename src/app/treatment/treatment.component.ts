import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import * as fromActionsTreatment from '../store/treatment.actions';
import { AppState, selectTreatmentState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ITreatment, ITreatmentAll, ITreatmentGroup, Treatment, TreatmentGroup } from '../interfaces/treatment';
import { createNewDate, formatDuration, getNowTimeZone, getTime, getTimeNumber } from '../util/dates';
import { ActivatedRoute, Router } from '@angular/router';
import { IColorAll } from '../interfaces/color';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { fieldChange } from '../util/validators';
import { areEquals } from '../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from "../shared/shared.module";
import { BackButtonDirective } from "../directives/back-button.directive";

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective]
})
export class TreatmentComponent implements OnInit, OnDestroy {
  @ViewChild('inputName') inputName: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('colorInput') colorInput!: ElementRef<HTMLInputElement>;
  @Input() group?: ITreatmentGroup;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  selected = new UntypedFormControl(0);

  treatments: ITreatment[] = [];
  filteredColors?: Observable<IColorAll[] | undefined>;
  colors: IColorAll[] = [];
  allColors?: IColorAll[];

  errors: any = [];
  language: string;

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private currentColorIds: string[] = [];

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private translate: TranslateService) {
    this.isAddMode = true;
    this.getState = this.store.select(selectTreatmentState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    let hasError = false;
    if (!this.treatments.length) {
      hasError = true;
      this.errors.treatments = 'REQUIRED';
    }
    this.treatments = this.treatments.map((tab: ITreatment, i) => {
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
    });

    if (hasError || this.form.invalid) {
      return;
    }

    const group: ITreatmentGroup = new TreatmentGroup();
    group.name = fieldChange(this.getForm.name as UntypedFormControl, this.group?.name);
    group.description = fieldChange(this.getForm.description as UntypedFormControl, this.group?.description);
    group.priceFrom = fieldChange(this.getForm.priceFrom as UntypedFormControl, this.group?.priceFrom);
    group.treatments = this.treatments;

    const newColorIds = this.colors.map(({ id }) => id);
    if (!areEquals(newColorIds, this.currentColorIds)) {
      group.colorIds = newColorIds;
    }

    if (this.isAddMode) {
      return this.store.dispatch(new fromActionsTreatment.TreatmentSave(group));
    } else {
      group.id = this.id;
      return this.store.dispatch(new fromActionsTreatment.TreatmentUpdate(group));
    }
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.createForm();
    this.subscribe();
    this.getColors();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getTreatment();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  removeTab = (index: number): void => {
    this.treatments.splice(index, 1);
  }

  setValue = (treatment: ITreatment, attribute: string, $event: any): void => {
    // @ts-ignore
    treatment[attribute] = $event.target.value;
  }

  setTime = (treatment: ITreatment, $event: any): void => {
    const time = getTimeNumber($event);
    const date = createNewDate(getNowTimeZone(), time?.hour, time?.minute);
    treatment.time = getTime(date);
  }

  remove = (color: IColorAll): void => {
    const index = this.colors.indexOf(color);
    if (index >= 0) {
      this.colors.splice(index, 1);
      this.allColors?.push(color);
      this.getForm.color.setValue(null);
    }
  }

  selectedColor = (event: MatAutocompleteSelectedEvent): void => {
    const color = event.option.value;
    this.colors.push(color);
    this.allColors = this.allColors?.filter(c => c.id !== color.id);
    this.colorInput.nativeElement.value = '';
    this.getForm.color.setValue(null);
  }

  sortColors = (data: any): IColorAll[] => data.sort((a: any, b: any) => {
    const aName = a.name.toUpperCase();
    const bName = b.name.toUpperCase();
    return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      priceFrom: [''],
      color: ['']
    });

    this.filteredColors = this.getForm.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(
        name => name ? this.filter(name) : (this.allColors ? this.allColors.slice() : this.allColors))
    );
  }

  private filter = (name: string): IColorAll[] | undefined => this.allColors?.filter(
    option => option?.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private getColors = (): void => this.store.dispatch(new fromActionsTreatment.GetColors());

  private clean = (): void => this.store.dispatch(new fromActionsTreatment.Clean());

  private getTreatment = (): void => {
    if (!this.group) {
      this.store.dispatch(
        new fromActionsTreatment.TreatmentFind({ id: this.id, path: 'edit' })
      );
    }
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.allColors = state.colors;
      if (state.selected) {
        this.group = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          priceFrom: state.selected.priceFrom
        } as ITreatmentGroup;
        this.colors = [];
        state.selected.colors?.forEach((color: IColorAll) => {
          this.colors.push(color);
          this.allColors = this.allColors?.filter(c => c.id !== color.id);
        });
        this.currentColorIds = this.colors.map(({ id }) => id);

        this.form.patchValue(this.group);

        this.treatments = [...state.selected.treatments?.map(
          (p: ITreatmentAll) => Object.assign({}, p, { time: formatDuration(p.duration), errors: {} }))];
        this.cdRef.detectChanges();
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.translate.currentLang, 'treatments']);
      }
    });
  }
}
