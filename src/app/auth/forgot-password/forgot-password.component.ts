import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { signupSuccess } from '../../store/auth.actions';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { ToastService } from '../../services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { getAuthErrorPipe, getAuthResponsePipe } from '../../store/selectors/auth.selectors';
import { AuthState } from '../../store/reducers/auth.reducers';
import { FirebaseService } from '../../services/firebase.service';

type ForgotPasswordForm = {
  email: FormControl<string>;
};

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly store: Store<AuthState> = inject(Store<AuthState>);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly firebaseService = inject(FirebaseService);

  private error$ = this.store.pipe(getAuthErrorPipe);
  private response$ = this.store.pipe(getAuthResponsePipe);

  private errorSignal = toSignal(this.error$);
  private responseSignal = toSignal(this.response$);

  form: FormGroup<ForgotPasswordForm> = this.formBuilder.group<ForgotPasswordForm>({
    email: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
  });
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const error = this.errorSignal();
      if (error?.message) {
        this.toastService.show(error.message, 'error');
      }
    });

    effect(() => {
      const response = this.responseSignal();
      if (response?.message) {
        const actionType = 'button';
        const toastRef = this.toastService.show(response.message, response.toastType, 5000, { actionType });
        toastRef.onAction().subscribe(() => this.router.navigate([this.language, 'auth']));
      }
    });
  }

  get getForm() {
    return this.form.controls;
  }

  forgotPassword(): void {
    this.firebaseService.sendPasswordResetEmail(this.getForm.email.value.trim()).then(() => {
      const message = this.translate.instant('AUTH.FORGOT_PASSWORD.MESSAGE');
      this.store.dispatch(signupSuccess({ message }));
    }).catch(e => console.error(`Error sending reset password. ${e}`));
  }
}
