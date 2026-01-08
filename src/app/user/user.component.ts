import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { getUser, saveUser } from '../store/user.actions';
import { IUser, User } from '../interfaces/user';
import { flags, IFlag } from '../util/flags';
import { lightenDarkenColor, randomColor } from '../util/color';
import { backendFormatDate, createDateFromString, newDate } from '../util/dates';
import { fieldChange, validColorValidator, valueChange } from '../util/validators';
import { createAddress } from '../util/helper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { SharedModule } from '../shared/shared.module';
import { GoogleMapComponent, GoogleMapForm } from '../shared/google-map/google-map.component';
import { BackButtonDirective } from '../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserState } from '../store/reducers/user.reducers';
import {
  getCurrentUserIdPipe,
  getNavigationParamsPipe,
  getSelectedUserPipe,
  getSubErrorsPipe,
} from '../store/selectors/user.selectors';
import { IError } from '../interfaces/common';
import PlaceGeometry = google.maps.places.PlaceGeometry;
import PlaceResult = google.maps.places.PlaceResult;

type UserForm = {
  role: FormControl<Role | undefined>,
  displayName: FormControl<string>,
  email: FormControl<string>,
  lang: FormControl<string | undefined>;
  phone: FormControl<string | undefined>,
  dob: FormControl<Date | undefined>,
  darkColor: FormControl<string>,
  lightColor: FormControl<string>,
  addressForm: FormGroup<GoogleMapForm>;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [SharedModule, NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective,
    NgIcon, ColorPickerDirective, ColorPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  private readonly store: Store<UserState> = inject(Store<UserState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  private userId$ = this.store.pipe(getCurrentUserIdPipe);
  private selectedUser$ = this.store.pipe(getSelectedUserPipe);
  private navigationParams$ = this.store.pipe(getNavigationParamsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private navigationParams = toSignal(this.navigationParams$);
  private userIdSignal = toSignal(this.userId$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private langChangeSignal = toSignal<LangChangeEvent>(this.translate.onLangChange);

  isAddModeSignal = computed(() => !this.userIdSignal());
  userSignal = toSignal(this.selectedUser$);

  googleMapForm: FormGroup<GoogleMapForm> = this.formBuilder.group<GoogleMapForm>({
    address: this.formBuilder.control(undefined),
    addressDescription: this.formBuilder.control(undefined),
  });

  form: FormGroup<UserForm> = this.formBuilder.group<UserForm>({
    role: this.formBuilder.control(undefined, { validators: [Validators.required] }),
    displayName: this.formBuilder.control('', { validators: [Validators.required] }),
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    lang: this.formBuilder.control(undefined, { validators: [Validators.required] }),
    phone: this.formBuilder.control(undefined),
    dob: this.formBuilder.control(undefined),
    darkColor: this.formBuilder.control(''),
    lightColor: this.formBuilder.control(''),
    addressForm: this.googleMapForm,
  });

  labels = computed(() => {
    this.langChangeSignal();
    const phoneTranslations = this.translate.instant('COMMON.USER.PHONE');

    return {
      mainLabel: '',
      codePlaceholder: '',
      searchPlaceholderLabel: phoneTranslations.SEARCH || '',
      noEntriesFoundLabel: phoneTranslations.COUNTRY_NOT_FOUND || '',
      nationalNumberLabel: phoneTranslations.FIELD || '',
      hintLabel: '',
      invalidNumberError: phoneTranslations.INVALID || '',
      requiredError: phoneTranslations.REQUIRED || '',
    };
  });

  selectedFlag = computed(() => this.flagList.find(l => l.value === this.getForm.lang.value)?.flag);

  private selectedRole = toSignal(this.getForm.role.valueChanges);

  flagList: IFlag[] = flags();
  geometry?: PlaceGeometry;
  addressUpdated = false;
  formattedAddress?: string;
  isProfessionalOrManager: boolean = false;

  errors = signal<Record<string, unknown>>({});

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      this.getForm.role.setValue(params?.role);
    });

    effect(() => {
      const user = this.userSignal();
      if (user) {
        this.form.patchValue({
          lang: user.locale,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          dob: user.dob ? createDateFromString(user.dob) : undefined,
          darkColor: user.darkColor,
          lightColor: user.lightColor,
        });
        this.googleMapForm.patchValue({
          address: user.address?.name,
          addressDescription: user.address?.description,
        });

        this.getForm.role.clearValidators();
        this.getForm.role.updateValueAndValidity();
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof UserForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.userIdSignal();
      if (id) {
        this.store.dispatch(getUser({ id }));
      }
    });

    effect(() => {
      const role = this.selectedRole();
      if (role) {
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
          this.getForm.lightColor.setValue('');
          this.getForm.lightColor.clearValidators();
          this.getForm.darkColor.setValue('');
          this.getForm.darkColor.clearValidators();
        }
        this.getForm.lightColor.updateValueAndValidity();
        this.getForm.darkColor.updateValueAndValidity();
      }
    });
  }

  get getForm(): UserForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const userSignal = this.userSignal();
    const user: IUser = new User();
    user.lang = valueChange(this.getForm.lang.value, userSignal?.locale) || this.translate.currentLang;
    user.email = fieldChange(this.getForm.email, userSignal?.email);
    user.displayName = fieldChange(this.getForm.displayName, userSignal?.displayName);
    user.phone = fieldChange(this.getForm.phone, userSignal?.phone);
    user.dob = fieldChange(this.getForm.dob, userSignal?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;

    if (this.isProfessionalOrManager) {
      if (this.getForm.lightColor.value) {
        user.lightColor = this.getForm.lightColor.value;
      }

      if (this.getForm.darkColor.value) {
        user.darkColor = this.getForm.darkColor.value;
      }
    }

    user.address = createAddress(this.formattedAddress, this.geometry?.location, userSignal?.address);

    const id = this.userIdSignal();
    if (!id) {
      this.store.dispatch(
        saveUser({ user, role: this.getForm.role.value }),
      );
    } else {
      user.id = id;
      this.store.dispatch(saveUser({ user }));
    }
  }

  lightenDarkenColor = (color: string, isDark: boolean): string => lightenDarkenColor(color, isDark ? 50 : -50);

  getAddress = (placeResult: PlaceResult): void => {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
    this.addressUpdated = true;
  };
}
