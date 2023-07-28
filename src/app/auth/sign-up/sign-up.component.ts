import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { IUser, User } from '../../interfaces/user';
import { AppState, selectAuthState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsLogin from '../../store/auth.actions';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { flags, IFlag } from '../../util/flags';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { Theme, THEME } from '../../util/theme';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  @Output() codeEvent = new EventEmitter<string>();

  form!: UntypedFormGroup;
  passwordFormGroup!: UntypedFormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];
  code: string | undefined | null;

  username: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  email: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, Validators.email
  ]);
  lang: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  firstName: UntypedFormControl = new UntypedFormControl();
  lastName: UntypedFormControl = new UntypedFormControl();
  phone: UntypedFormControl = new UntypedFormControl();
  codeForm: UntypedFormControl = new UntypedFormControl();

  flagList: IFlag[] = flags();

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef, private snackBar: MatSnackBar, private router: Router,
              private cookieService: CookieService) {
    this.getState = this.store.select(selectAuthState);
    this.codeForm.valueChanges.subscribe(value => {
      this.codeEvent.emit(value);
    });
  }

  get register(): void {
    if (this.form.invalid || this.passwordFormGroup.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value.trim();
    user.password = this.passwordFormGroup.get('password')?.value;
    user.lang = this.lang.value.value;
    user.firstName = this.firstName.value;
    user.lastName = this.lastName.value;
    user.phone = this.phone.value;
    user.code = this.codeForm.value;
    user.theme = this.cookieService.get(THEME) as Theme;
    return this.store.dispatch(new fromActionsLogin.SignUp(user));
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

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      lang: this.lang,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    });
    this.passwordFormGroup = this.formBuilder.group({
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field]?.setErrors({ incorrect: true });
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
