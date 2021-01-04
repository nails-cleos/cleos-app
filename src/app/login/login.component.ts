import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { AppState, selectAuthState } from '../store/app.states';
import { IUser } from '../interfaces/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  user: IUser | undefined;
  getState: Observable<any>;

  constructor(private formBuilder: FormBuilder, private socialService: SocialAuthService, private store: Store<AppState>,
              private snackBar: MatSnackBar, private router: Router) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.getState.subscribe((state) => {
      if (state.isAuthenticated) {
        this.router.navigate(['dashboard', 'main']);
      }
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });

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
      new fromActionsLogin.Login({username, password})
    );
  }

  signOut(): void {
    this.store.dispatch(
      new fromActionsLogin.LogOut()
    );
  }

  socialSignIn(provider: string): void {
    let id = '';
    if (provider === 'google') {
      id = GoogleLoginProvider.PROVIDER_ID;
    } else if (provider === 'facebook') {
      id = FacebookLoginProvider.PROVIDER_ID;
    }

    this.socialService.signIn(id).then(socialUser => {
      this.store.dispatch(
        new fromActionsLogin.SocialLogin(socialUser)
      );
    });
  }
}
