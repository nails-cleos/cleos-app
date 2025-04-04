import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectAuthState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../../store/auth.actions';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { sendPasswordResetEmail } from '@firebase/auth';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [SharedModule, BackButtonDirective]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  getState: Observable<any>;
  subscription?: Subscription;

  form!: UntypedFormGroup;
  language: string;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private snackBar: MatSnackBar,
              private router: Router, private auth: Auth, private translate: TranslateService) {
    this.getState = this.store.select(selectAuthState);
    this.language = this.translate.currentLang;
  }

  get forgotPassword(): void {
    sendPasswordResetEmail(this.auth, this.form.get('email')?.value.trim()).then(() => {
      const message = this.translate.instant('AUTH.FORGOT_PASSWORD.MESSAGE');
      this.store.dispatch(
        new fromActionsLogin.SignUpSuccess({ message })
      );
    }).catch(e => console.error(`Error sending reset password. ${ e }`));
    return;
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private clean = (): void => this.store.dispatch(new fromActionsLogin.Clean());

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      email: ['', Validators.required]
    });
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigate([this.language, 'auth']);
          });
        }
      }
    });
  };
}
