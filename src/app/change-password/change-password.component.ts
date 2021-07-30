import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectUserState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsUser from '../store/user.actions';
import * as fromActionsLogin from '../store/auth.actions';
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
  userSubscription: Subscription | undefined;
  getUserState: Observable<any>;

  oldPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder) {
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
    this.userSubscription?.unsubscribe();
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

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: this.oldPassword
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      this.currentUser = state.user;
    });
    this.userSubscription = this.getUserState.subscribe((state) => {
      if (state.message) {
        this.store.dispatch(
          new fromActionsLogin.ReLogin()
        );
      }
    });
  }
}
