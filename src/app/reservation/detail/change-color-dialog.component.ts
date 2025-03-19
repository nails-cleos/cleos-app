import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IColorAll } from '../../interfaces/color';
import { Observable, Subscription } from 'rxjs';
import { requireMatch } from '../../util/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { map, startWith } from 'rxjs/operators';
import * as fromActionsReservation from '../../store/reservation.actions';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-change-color-dialog-component',
  templateUrl: './change-color-dialog.component.html',
  standalone: true,
  imports: [SharedModule]
})
export class ChangeColorDialogComponent implements OnInit, OnDestroy {
  colorForm!: UntypedFormGroup;
  colors?: IColorAll[];
  filteredColor?: Observable<IColorAll[] | undefined>;
  color: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly treatmentId: string;

  constructor(public dialogRef: MatDialogRef<ChangeColorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private formBuilder: UntypedFormBuilder) {
    this.getState = this.store.select(selectReservationState);
    this.treatmentId = data.treatmentId;
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ colorId: this.color.value.id });
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
    this.subscribe();
    this.getColors();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnColor = (color: IColorAll): string => color ? color.name : '';

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.color.setValue('');
    }
  }

  private createForm = (): void => {
    this.colorForm = this.formBuilder.group({
      color: this.color
    });
  }

  private createFilters = (): void => {
    this.filteredColor = this.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterColor(name) : this.colors ? this.colors.slice() : this.colors)
    );
  }

  private filterColor = (name: string): IColorAll[] | undefined => this.colors?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0)

  private getColors = (): void => this.store.dispatch(
    new fromActionsReservation.GetAllColorsByTreatmentId(this.treatmentId)
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.colors = state.colors;
      this.color.setValue(this.colors?.find(color => color.id === this.data.colorId));
    });
  }
}
