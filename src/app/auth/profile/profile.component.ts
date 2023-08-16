import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { IUser, User } from '../../interfaces/user';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromActionsUser from '../../store/user.actions';
import { fieldChange, valueChange } from '../../util/validators';
import { Location } from '@angular/common';
import { findFlag, flags, IFlag } from '../../util/flags';
import { getUserImage, getUserNameInitials } from '../../util/helper';
import { backendFormatDate, createDateFromString, newDate } from '../../util/dates';
import { Color } from '@angular-material-components/color-picker';
import { lightenDarkenColor } from '../../util/color';
import { IAddress, ILocation } from '../../interfaces/room';
import { Role } from '../../interfaces/token';
import PlaceResult = google.maps.places.PlaceResult;
import PlaceGeometry = google.maps.places.PlaceGeometry;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  errors: any = [];
  user?: IUser;
  canChange = false;
  image: any;
  initials?: string;

  username: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
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

  address: UntypedFormControl = new UntypedFormControl();

  showColors = false;

  flagList: IFlag[] = flags();
  isDarkMode = false;
  isAdmin: boolean;
  showCash: boolean;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private geometry?: PlaceGeometry;
  private formattedAddress?: string;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private location: Location,
              private cdRef: ChangeDetectorRef) {
    this.showCash = false;
    this.isAdmin = false;
    this.getState = this.store.select(selectUserState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.lang = valueChange(this.langValue.value.value, this.user?.locale);
    user.username = fieldChange(this.username, this.user?.username);
    user.firstName = fieldChange(this.firstName, this.user?.firstName);
    user.lastName = fieldChange(this.lastName, this.user?.lastName);
    user.phone = fieldChange(this.phone, this.user?.phone);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;
    user.showCash = this.showCash;

    if (this.lightColor.value) {
      const color = this.lightColor.value;
      user.lightColor = `${ color.r },${ color.g },${ color.b }`;
    }

    if (this.darkColor.value) {
      const color = this.darkColor.value;
      user.darkColor = `${ color.r },${ color.g },${ color.b }`;
    }

    if (this.geometry?.location) {
      const location = this.geometry.location;
      user.address = {
        name: this.formattedAddress,
        location: {
          x: location?.lng(),
          y: location?.lat()
        } as ILocation
      } as IAddress;
    }

    return this.store.dispatch(
      new fromActionsUser.UpdateUser({ user, redirectUrl: 'auth/profile' })
    );
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.findMe();
    this.subscribe();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSelectFile(target: any): void {
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => this.image = reader.result;

      this.store.dispatch(
        new fromActionsUser.UpdatePhoto(file)
      );
    }
  }

  lightenDarkenColor(color: Color, isDark: boolean): string {
    return lightenDarkenColor(`#${ color.hex }`, isDark ? 50 : -50);
  }

  getAddress(placeResult: PlaceResult): void {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
  }

  private findMe(): void {
    this.store.dispatch(
      new fromActionsUser.FindMe()
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      username: this.username,
      langValue: this.langValue,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      dob: this.dob,
      darkColor: this.darkColor,
      lightColor: this.lightColor,
      address: this.address
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
        const user = state.selected;
        this.user = user;
        this.canChange = user?.provider === 'LOCAL';
        this.initials = getUserNameInitials(user);
        this.image = getUserImage(user);
        this.form.patchValue(state.selected);
        this.address.setValue(this.user?.address?.name);

        const roles = ['ROLE_PROFESSIONAL', 'ROLE_MANAGER'];
        this.showColors = state.selected.authorities?.some((au: any) => roles.includes(au.authority));
        this.isAdmin = state.selected.authorities?.some((u: any) => u.authority === Role.admin);

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
        const langValue = findFlag(this.flagList, state.selected.locale);
        this.langValue.setValue(langValue);
        this.showCash = user.showCash || false;
        this.cdRef.detectChanges();
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      }
      if (state.message) {
        this.clean();
        this.findMe();
      }
    });
  }
}
