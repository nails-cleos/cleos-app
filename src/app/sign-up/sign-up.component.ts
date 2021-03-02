import { Component, ContentChild, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IUser, User } from '../interfaces/user';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {

  @ViewChild('passwordComponent') passwordComponent: any;
  showError = false;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];

  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  email: FormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
  firstName: FormControl = new FormControl('', [
    Validators.required
  ]);
  lastName: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    });
  }

  subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field]?.setErrors({incorrect: true});
        });
      }
    });
  }

  register(): void {
    if (this.form.invalid || this.passwordComponent.passwordFormControl.invalid
    || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value;
    user.firstName = this.firstName.value;
    user.lastName = this.lastName.value;
    user.password = this.passwordComponent.passwordFormControl.value;
    this.store.dispatch(new fromActionsLogin.SignUp(user));
  }

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }
}
