import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectAuthState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../../store/auth.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  getState: Observable<any>;
  subscription: Subscription | undefined;

  form!: FormGroup;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private snackBar: MatSnackBar,
              private router: Router) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  forgotPassword(): void {
    this.store.dispatch(
      new fromActionsLogin.ForgotPassword(this.form.get('username')?.value.trim())
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required]
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigate(['auth']);
          });
        }
      }
    });
  }
}
