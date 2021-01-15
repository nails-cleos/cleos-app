import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectUserState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsUser from '../store/user.actions';
import { MustMatch } from '../util/validators';
import { Location } from '@angular/common';
import { IUser } from '../interfaces/user';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  hideConfirm = true;
  hide = true;
  form!: FormGroup;
  getState: Observable<any>;
  currentUser: IUser | undefined;
  getUserState: Observable<any>;

  oldPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

  password: FormControl = new FormControl('', [
    Validators.required
  ]);
  confirmPassword: FormControl = new FormControl('', [
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

  clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: this.oldPassword,
      password: this.password,
      confirmPassword: this.confirmPassword
    }, {
      validator: MustMatch('password', 'confirmPassword')
    } as AbstractControlOptions);
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      this.currentUser = state.user;
    });
    this.getUserState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.router.navigate(['dashboard', 'auth']);
          });
        }
      }
    });
  }

  changePassword(): void {
    if (this.form.invalid) {
      return;
    }
    this.store.dispatch(
      new fromActionsUser.ChangePassword({oldPassword: this.oldPassword.value, password: this.password.value})
    );
  }

  back(): void {
    this.location.back();
  }
}
