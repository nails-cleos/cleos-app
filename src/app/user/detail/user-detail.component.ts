import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUser, User } from '../../interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import * as fromActionsUser from '../../store/user.actions';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { fieldChange, valueChange } from '../../util/validators';
import { findFlag, flags, IFlag } from '../../util/flags';
import { API_LOCALE, backendFormatDate, createDateFromString, formatDateTwoDigit, newDate } from '../../util/dates';
import { Color } from '@angular-material-components/color-picker';
import { lightenDarkenColor } from '../../util/color';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() user: IUser | undefined;
  form!: UntypedFormGroup;
  getState: Observable<any>;
  subscription: Subscription | undefined;
  username: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  email: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, Validators.email
  ]);
  langValue: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  firstName: UntypedFormControl = new UntypedFormControl();
  lastName: UntypedFormControl = new UntypedFormControl();
  phone: UntypedFormControl = new UntypedFormControl();
  dob: UntypedFormControl = new UntypedFormControl();
  darkColor: UntypedFormControl = new UntypedFormControl();
  lightColor: UntypedFormControl = new UntypedFormControl();

  showColors = false;
  flagList: IFlag[] = flags();

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private cdRef: ChangeDetectorRef, private router: Router) {
    this.getState = this.store.select(selectUserState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }

    const user: IUser = new User();
    user.id = this.user?.id;
    user.username = fieldChange(this.username, this.user?.username);
    user.email = fieldChange(this.email, this.user?.email);
    user.firstName = fieldChange(this.firstName, this.user?.firstName);
    user.lastName = fieldChange(this.lastName, this.user?.lastName);
    user.lang = valueChange(this.langValue.value.value, this.user?.locale);
    user.phone = fieldChange(this.phone, this.user?.phone);
    user.dob = fieldChange(this.dob, this.user?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob), API_LOCALE) : user.dob;

    if (this.lightColor.value) {
      const color = this.lightColor.value;
      user.lightColor = `${ color.r },${ color.g },${ color.b }`;
    }

    if (this.darkColor.value) {
      const color = this.darkColor.value;
      user.darkColor = `${ color.r },${ color.g },${ color.b }`;
    }

    return this.store.dispatch(new fromActionsUser.SaveUser({ user }));
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getUser();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  lightenDarkenColor(color: Color, isDark: boolean): string {
    return lightenDarkenColor(`#${ color.hex }`, isDark ? 50 : -50);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      email: this.email,
      langValue: this.langValue,
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
      if (state.selected) {
        this.user = state.selected;
        this.form.patchValue(state.selected);

        const roles = ['ROLE_PROFESSIONAL', 'ROLE_MANAGER'];
        this.showColors = state.selected.authorities?.some((au: any) => roles.includes(au.authority));

        if (state.selected.lightColor) {
          const rgb = state.selected.lightColor.split(',');
          this.lightColor.setValue(new Color(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])));
        }
        if (state.selected.darkColor) {
          const rgb = state.selected.darkColor.split(',');
          this.darkColor.setValue(new Color(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])));
        }
        if (state.selected.dob) {
          this.dob.setValue(createDateFromString(state.selected.dob));
        }
        this.langValue.setValue(findFlag(this.flagList, state.selected.locale));
        this.cdRef.detectChanges();
      }
      if (state.message) {
        this.router.navigate(['users']);
      }
    });
  }

  private getUser(): void {
    if (!this.user) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUser.FindUser(id)
      );
    }
  }
}
