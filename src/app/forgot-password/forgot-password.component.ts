import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  form!: FormGroup;
  getState: Observable<any>;

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required]
    });
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
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

  forgotPassword(): void {
    this.store.dispatch(
      new fromActionsLogin.ForgotPassword(this.form.get('username')?.value.trim())
    );
  }
}
