import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
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

  password: FormControl = new FormControl('', [
    Validators.required
  ]);
  confirmPassword: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
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

  recoveryPassword(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.store.dispatch(
      new fromActionsLogin.RecoveryPassword({token, password: this.password.value})
    );
  }
}
