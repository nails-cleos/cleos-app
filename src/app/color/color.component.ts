import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectColorState } from '../store/app.states';
import { Router } from '@angular/router';
import { Color, IColor } from '../interfaces/color';
import * as fromActionsColor from '../store/color.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-colors',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss']
})
export class ColorComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private language: string;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private translate: TranslateService) {
    this.getState = this.store.select(selectColorState);
    this.language = this.translate.currentLang;
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const color: IColor = new Color();
    color.name = this.name.value;
    color.description = this.form.value.description;

    return this.store.dispatch(
      new fromActionsColor.ColorSave(color)
    );
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
      name: this.name,
      description: new UntypedFormControl()
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsColor.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'colors']);
      }
    });
  }
}
