import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../util/validators';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit {

  hideConfirm = true;
  hide = true;
  form!: FormGroup;
  getState: Observable<any>;

  password: FormControl = new FormControl('', [
    Validators.required
  ]);
  confirmPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

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
      password: this.password,
      confirmPassword: this.confirmPassword
    }, {
      validator: MustMatch('password', 'confirmPassword')
    } as AbstractControlOptions);
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

  recoveryPassword(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.store.dispatch(
      new fromActionsLogin.RecoveryPassword({token, password: this.password.value})
    );
  }
}
