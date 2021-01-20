import { Component, OnInit } from '@angular/core';
import { IUser, User } from '../interfaces/user';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MustMatch } from '../util/validators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  hideConfirm = true;
  hide = true;
  form!: FormGroup;
  user: IUser = new User();
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
  password: FormControl = new FormControl('', [
    Validators.required
  ]);
  confirmPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      confirmPassword: this.confirmPassword
    }, {
      validator: MustMatch('password', 'confirmPassword')
    } as AbstractControlOptions);
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      }
    });
  }

  register(): void {
    if (this.form.invalid) {
      return;
    }
    this.user.username = this.username.value;
    this.user.email = this.email.value;
    this.user.firstName = this.firstName.value;
    this.user.lastName = this.lastName.value;
    this.user.password = this.password.value;
    this.store.dispatch(new fromActionsLogin.SignUp(this.user));
  }
}
