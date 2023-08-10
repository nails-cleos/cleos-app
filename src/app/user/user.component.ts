import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import * as fromActionsUser from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { findFlag, flags, IFlag } from '../util/flags';
import { Color } from '@angular-material-components/color-picker';
import { lightenDarkenColor } from '../util/color';
import { backendFormatDate, createDateFromString, newDate } from '../util/dates';
import { IAddress, ILocation } from '../interfaces/room';
import { fieldChange, valueChange } from '../util/validators';
import PlaceGeometry = google.maps.places.PlaceGeometry;
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  @Input() user?: IUser;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  hide = false;
  errors: any = [];
  flagList: IFlag[] = flags();
  geometry?: PlaceGeometry;
  addressUpdated = false;
  formattedAddress?: string;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectUserState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.getForm.role.setValue(this.extras.role);
    }
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.username = fieldChange(this.getForm.username as UntypedFormControl, this.user?.username);
    user.email = fieldChange(this.getForm.email as UntypedFormControl, this.user?.email);
    user.firstName = fieldChange(this.getForm.firstName as UntypedFormControl, this.user?.firstName);
    user.lang = valueChange(this.getForm.lang.value.value, this.user?.locale);
    user.lastName = fieldChange(this.getForm.lastName as UntypedFormControl, this.user?.lastName);
    user.phone = fieldChange(this.getForm.phone as UntypedFormControl, this.user?.phone);
    user.password = 'Ch4ng#';
    user.dob = fieldChange(this.getForm.dob as UntypedFormControl, this.user?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;

    if (this.getForm.lightColor.value) {
      const color = this.getForm.lightColor.value;
      user.lightColor = `${ color.r },${ color.g },${ color.b }`;
    }

    if (this.getForm.darkColor.value) {
      const color = this.getForm.darkColor.value;
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

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsUser.SaveUser({ user, role: this.getForm.role.value })
      );
    } else {
      user.id = this.id;
      return this.store.dispatch(new fromActionsUser.SaveUser({ user }));
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.createForm();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getUser();
    }
    this.cdRef.detectChanges();
  }

  lightenDarkenColor(color: Color, isDark: boolean): string {
    return lightenDarkenColor(`#${ color.hex }`, isDark ? 50 : -50);
  }

  getAddress(placeResult: PlaceResult): void {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
    this.addressUpdated = true;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      role: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lang: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      phone: [''],
      dob: [''],
      darkColor: [''],
      lightColor: [''],
      address: ['']
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
        const user: IUser = {
          username: this.user?.username,
          email: this.user?.email,
          firstName: this.user?.firstName,
          lastName: this.user?.lastName,
          phone: this.user?.phone,
        };
        this.form.patchValue(user);
        this.getForm.address.setValue(this.user?.address?.name);

        if (state.selected.lightColor) {
          const rgb = state.selected.lightColor.split(',');
          this.getForm.lightColor.setValue(new Color(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])));
        }
        if (state.selected.darkColor) {
          const rgb = state.selected.darkColor.split(',');
          this.getForm.darkColor.setValue(new Color(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])));
        }
        if (state.selected.dob) {
          this.getForm.dob.setValue(createDateFromString(state.selected.dob));
        }

        this.getForm.lang.setValue(findFlag(this.flagList, state.selected.locale));
        this.getForm.role.setValidators([]);
        this.getForm.role.updateValueAndValidity();
        this.cdRef.detectChanges();
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['users']);
      }
    });
  }

  private getUser(): void {
    if (!this.user) {
      this.store.dispatch(
        new fromActionsUser.FindUser(this.id)
      );
    }
  }
}
