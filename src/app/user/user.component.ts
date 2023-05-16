import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import * as fromActionsUser from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { flags, IFlag } from '../util/flags';
import { Color } from '@angular-material-components/color-picker';
import { lightenDarkenColor } from '../util/color';
import { API_LOCALE, backendFormatDate, newDate } from '../util/dates';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

  hide = false;
  form!: UntypedFormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];

  role: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
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
  dob: UntypedFormControl = new UntypedFormControl();
  darkColor: UntypedFormControl = new UntypedFormControl();
  lightColor: UntypedFormControl = new UntypedFormControl();

  flagList: IFlag[] = flags();

  extras: any;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectUserState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.role.setValue(this.extras.role);
    }
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = this.username.value;
    user.email = this.email.value;
    user.firstName = this.firstName.value;
    user.lang = this.lang.value.value;
    user.lastName = this.lastName.value;
    user.phone = this.phone.value;
    user.password = 'Ch4ng#';
    user.dob = this.dob.value ? backendFormatDate(newDate(this.dob.value)) : this.dob.value;

    if (this.lightColor.value) {
      const color = this.lightColor.value;
      user.lightColor = `${color.r},${color.g},${color.b}`;
    }

    if (this.darkColor.value) {
      const color = this.darkColor.value;
      user.darkColor = `${color.r},${color.g},${color.b}`;
    }

    return this.store.dispatch(
      new fromActionsUser.SaveUser({user, role: this.role.value})
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.cdRef.detectChanges();
  }

  lightenDarkenColor(color: Color, isDark: boolean): string {
    return lightenDarkenColor(`#${color.hex}`, isDark ? 50 : -50);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      role: this.role,
      username: this.username,
      email: this.email,
      lang: this.lang,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      dob: this.dob,
      darkColor: this.darkColor,
      lightColor: this.lightColor
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['users']);
      }
    });
  }
}
