import { Component, OnInit } from '@angular/core';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  form!: FormGroup;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
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
}
