import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IUser, User } from '../interfaces/user';
import { AppState, selectAuthState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../store/auth.actions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { flags, IFlag } from '../util/flags';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  @Output() codeEvent = new EventEmitter<string>();

  @ViewChild('passwordComponent') passwordComponent: any;
  showError = false;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];
  code: string | undefined | null;

  username: FormControl = new FormControl('', [
    Validators.required
  ]);
  email: FormControl = new FormControl('', [
    Validators.required, Validators.email
  ]);
  lang: FormControl = new FormControl('', [
    Validators.required
  ]);

  firstName: FormControl = new FormControl();
  lastName: FormControl = new FormControl();
  phone: FormControl = new FormControl();
  codeForm: FormControl = new FormControl();

  flagList: IFlag[] = flags();

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef, private snackBar: MatSnackBar, private router: Router ) {
    this.getState = this.store.select(selectAuthState);
    this.codeForm.valueChanges.subscribe(value => {
      this.codeEvent.emit(value);
    });
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParamMap.get('code');
    this.codeForm.setValue(this.code);
    this.createForm();
    this.subscribe();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  register(): void {
    if (this.form.invalid || this.passwordComponent.passwordFormControl.invalid
      || this.passwordComponent.passwordConfirmationFormControl.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value;
    user.password = this.passwordComponent.passwordFormControl.value;
    user.lang = this.lang.value.value;
    user.firstName = this.firstName.value;
    user.lastName = this.lastName.value;
    user.phone = this.phone.value;
    user.code = this.codeForm.value;

    this.store.dispatch(new fromActionsLogin.SignUp(user));
  }

  onStrengthChanged(): void {
    this.showError = true;
    this.passwordComponent.passwordConfirmationFormControl.updateValueAndValidity();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      lang: this.lang,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field]?.setErrors({incorrect: true});
        });
      } else if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigate(['auth']);
          });
        }
      }
    });
  }
}
