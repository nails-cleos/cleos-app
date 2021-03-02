import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectUserState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsUser from '../store/user.actions';
import * as fromActionsLogin from '../store/auth.actions';
import { Location } from '@angular/common';
import { IUser } from '../interfaces/user';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  @ViewChild('passwordComponent') passwordComponent: any;

  showError = false;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  currentUser: IUser | undefined;
  getUserState: Observable<any>;

  oldPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder, private location: Location) {
    this.getState = this.store.select(selectAuthState);
    this.getUserState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: this.oldPassword
    });
  }

  changePassword(): void {
    if (this.form.invalid || this.passwordComponent.passwordFormControl.invalid
      || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    this.store.dispatch(
      new fromActionsUser.ChangePassword({
        username: this.currentUser?.username,
        oldPassword: this.oldPassword.value,
        password: this.passwordComponent.passwordFormControl.value
      })
    );
  }

  back(): void {
    this.location.back();
  }

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      this.currentUser = state.user;
    });
    this.getUserState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.store.dispatch(
              new fromActionsLogin.LogOut()
            );
          });
        }
      }
    });
  }
}
