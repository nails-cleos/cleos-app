import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { ToastService } from '@app/services/toast.service';
import { FirebaseService } from '@app/services/firebase.service';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AuthStore } from '@app/store/auth.store';
import { NavigationService } from '@app/services/navigation.service';

type ForgotPasswordForm = {
  email: FormControl<string>;
};

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    MatError,
    BackButtonDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly authStore = inject(AuthStore);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly firebaseService = inject(FirebaseService);

  private errorSignal = this.authStore.error;
  private responseSignal = this.authStore.response;

  form: FormGroup<ForgotPasswordForm> =
    this.formBuilder.group<ForgotPasswordForm>({
      email: this.formBuilder.control('', {
        validators: [Validators.required],
      }),
    });

  constructor() {
    this.authStore.clean();
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
        const toastRef = this.toastService.show(
          response.message,
          response.toastType,
          5000,
          { actionType },
        );
        toastRef
          .onAction()
          .subscribe(() => this.navigationService.navigate(['auth']));
      }
    });
  }

  get getForm() {
    return this.form.controls;
  }

  forgotPassword(): void {
    this.firebaseService
      .sendPasswordResetEmail(this.getForm.email.value.trim())
      .then(() => {
        const message = this.translateService.instant(
          'AUTH.FORGOT_PASSWORD.MESSAGE',
        );
        this.authStore.signupSuccess({ message });
      })
      .catch((e) => console.error(`Error sending reset password. ${e}`));
  }
}
