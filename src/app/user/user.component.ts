import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped,
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../store/app.states';
import * as fromActionsUser from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { findFlag, flags, IFlag } from '../util/flags';
import { lightenDarkenColor, randomColor } from '../util/color';
import { backendFormatDate, createDateFromString, newDate } from '../util/dates';
import { fieldChange, validColorValidator, valueChange } from '../util/validators';
import { createAddress } from '../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { SharedModule } from '../shared/shared.module';
import { GoogleMapComponent } from '../shared/google-map/google-map.component';
import { BackButtonDirective } from '../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent, TextLabels } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';
import PlaceGeometry = google.maps.places.PlaceGeometry;
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [SharedModule, NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective,
    NgIcon, ColorPickerDirective, ColorPickerComponent],
})
export class UserComponent implements OnInit, OnDestroy {
  @Input() user?: IUser;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  errors: any = [];
  flagList: IFlag[] = flags();
  geometry?: PlaceGeometry;
  addressUpdated = false;
  formattedAddress?: string;
  isProfessionalOrManager: boolean;
  labels: TextLabels = {
    mainLabel: '',
    codePlaceholder: '',
    searchPlaceholderLabel: '',
    noEntriesFoundLabel: '',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: '',
  };

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private readonly translate: TranslateService, private route: ActivatedRoute,
              private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.isProfessionalOrManager = false;
    this.getState = this.store.select(selectUserState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }
    const user: IUser = new User();
    user.email = fieldChange(this.getForm.email as UntypedFormControl, this.user?.email);
    user.displayName = fieldChange(this.getForm.displayName as UntypedFormControl, this.user?.displayName);
    user.lang = valueChange(this.getForm.lang.value.value, this.user?.locale);
    user.phone = fieldChange(this.getForm.phone as UntypedFormControl, this.user?.phone);
    user.dob = fieldChange(this.getForm.dob as UntypedFormControl, this.user?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;

    if (this.isProfessionalOrManager) {
      if (this.getForm.lightColor.value) {
        user.lightColor = this.getForm.lightColor.value;
      }

      if (this.getForm.darkColor.value) {
        user.darkColor = this.getForm.darkColor.value;
      }
    }

    user.address = createAddress(this.formattedAddress, this.geometry?.location, this.user?.address);

    if (this.isAddMode) {
      this.store.dispatch(
        new fromActionsUser.SaveUser({ user, role: this.getForm.role.value }),
      );
    } else {
      user.id = this.id;
      this.user = undefined;
      this.store.dispatch(new fromActionsUser.SaveUser({ user }));
    }
    return;
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
    if (this.extras) {
      this.getForm.role.setValue(this.extras.role);
    }
    this.loadLabels();
    this.translate.onLangChange.subscribe(() => this.loadLabels());
    this.cdRef.detectChanges();
  }

  lightenDarkenColor = (color: string, isDark: boolean): string => lightenDarkenColor(color, isDark ? 50 : -50);

  getAddress = (placeResult: PlaceResult): void => {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
    this.addressUpdated = true;
  };

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      role: ['', Validators.required],
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lang: ['', Validators.required],
      phone: [''],
      dob: [''],
      darkColor: [''],
      lightColor: [''],
      address: [''],
    });

    this.getForm.role.valueChanges.subscribe(role => {
      this.isProfessionalOrManager = [Role.manager, Role.professional].indexOf(role) > -1;
      if (this.isProfessionalOrManager) {
        this.getForm.lightColor.setValidators([validColorValidator()]);
        if (!this.getForm.lightColor.value) {
          this.getForm.lightColor.setValue(randomColor(false));
        }
        this.getForm.darkColor.setValidators([validColorValidator()]);
        if (!this.getForm.darkColor.value) {
          this.getForm.darkColor.setValue(randomColor(true));
        }
      } else {
        this.getForm.lightColor?.setValue('');
        this.getForm.lightColor?.clearValidators();
        this.getForm.darkColor?.setValue('');
        this.getForm.darkColor?.clearValidators();
      }
      this.getForm.lightColor.updateValueAndValidity();
      this.getForm.darkColor.updateValueAndValidity();
    });
  };

  private clean = (): void => this.store.dispatch(new fromActionsUser.Clean());

  private getUser = (): void => {
    if (!this.user) {
      this.store.dispatch(
        new fromActionsUser.FindUser(this.id),
      );
    }
  };

  private loadLabels = () => {
    const phoneTranslations = this.translate.instant('COMMON.USER.PHONE');

    this.labels = {
      mainLabel: '',
      codePlaceholder: '',
      searchPlaceholderLabel: phoneTranslations.SEARCH || '',
      noEntriesFoundLabel: phoneTranslations.COUNTRY_NOT_FOUND || '',
      nationalNumberLabel: phoneTranslations.FIELD || '',
      hintLabel: '',
      invalidNumberError: phoneTranslations.INVALID || '',
      requiredError: phoneTranslations.REQUIRED || '',
    };
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.user = state.selected;
        const user: IUser = {
          email: this.user?.email,
          displayName: this.user?.displayName,
          phone: this.user?.phone,
        };
        this.form.patchValue(user);
        this.getForm.address.setValue(this.user?.address?.name);

        if (state.selected.lightColor) {
          this.getForm.lightColor.setValue(state.selected.lightColor);
        }
        if (state.selected.darkColor) {
          this.getForm.darkColor.setValue(state.selected.darkColor);
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
        this.router.navigate([this.translate.currentLang, 'users']);
      }
    });
  };
}
