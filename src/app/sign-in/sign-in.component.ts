import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as fromActionsLogin from '../store/auth.actions';
import { IUser } from '../interfaces/user';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  hide = true;
  form!: FormGroup;
  user: IUser | undefined;

  constructor(private formBuilder: FormBuilder, private store: Store<AppState>, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  signIn(): void {
    if (this.form.invalid) {
      return;
    }
    const username: string = this.form.get('username')?.value.trim();
    const password: string = this.form.get('password')?.value.trim();

    this.store.dispatch(
      new fromActionsLogin.Login({username, password, queryParams: this.route.snapshot.queryParams})
    );
  }
}
