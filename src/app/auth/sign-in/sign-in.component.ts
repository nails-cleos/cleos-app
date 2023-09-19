import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromActionsLogin from '../../store/auth.actions';
import { IUser } from '../../interfaces/user';
import { AppState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AppCheck, getToken } from '@angular/fire/app-check';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  hide = true;
  form!: UntypedFormGroup;
  user?: IUser;

  constructor(private formBuilder: UntypedFormBuilder, private store: Store<AppState>, private route: ActivatedRoute,
              private appCheck: AppCheck) {
  }

  get signIn(): void {
    if (this.form.invalid) {
      return;
    }
    const username: string = this.form.get('username')?.value.trim();
    const password: string = this.form.get('password')?.value.trim();

    getToken(this.appCheck).then(appCheckToken => {
      if (appCheckToken.token) {
        this.store.dispatch(
          new fromActionsLogin.Login({
            username, password,
            queryParams: this.route.snapshot.queryParams
          })
        );
      }
    });

    return;
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
}
