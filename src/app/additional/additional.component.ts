import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../store/app.states';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Additional, IAdditional } from '../interfaces/additional';
import { Router } from '@angular/router';
import * as fromActionsAdditional from '../store/additional.actions';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss']
})
export class AdditionalComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  duration: FormControl = new FormControl('', [
    Validators.required
  ]);

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectAdditionalState);
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const additional: IAdditional = new Additional();
    additional.name = this.name.value;
    additional.description = this.form.value.description;
    additional.duration = this.duration.value;

    this.store.dispatch(
      new fromActionsAdditional.AdditionalSave(additional)
    );

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

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: new FormControl(),
      name: this.name,
      duration: this.duration
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsAdditional.Clean()
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
        this.router.navigate(['additional']);
      }
    });
  }
}
