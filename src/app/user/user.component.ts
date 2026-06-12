import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUser, IUserAll, User } from './user';
import { flags, IFlag } from '../util/flags';
import { randomColor } from '../util/color';
import { createDateFromString } from '../util/dates';
import { validColorValidator } from '../util/validators';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { GoogleMapComponent, GoogleMapForm } from '../shared/google-map/google-map.component';
import { BackButtonDirective } from '../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../interfaces/common';
import { ColorPickerComponent } from '../shared/color-picker/color-picker.component';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { UserForm } from './user-form.types';
import { UserStore } from '../store/user.store';
import PlaceResult = google.maps.places.PlaceResult;
import PlaceGeometry = google.maps.places.PlaceGeometry;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepicker, MatSelect, MatOption, MatIcon,
    MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, MatError, MatPrefix, BackButtonDirective,
    NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective, NgIcon, ColorPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  config = input.required<ICommon>();
  user = input<IUserAll>();

  submitData = output<{ user: IUser; role?: Role }>();

  private readonly userStore = inject(UserStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private langChangeSignal = toSignal<LangChangeEvent>(this.translate.onLangChange);

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
      const params = this.userStore.userNavigationParams();
      this.getForm.role.setValue(params?.role);
    });

    effect(() => {
      const user = this.user();
      if (user) {
        this.form.patchValue({
          ...user,
          lang: user.locale,
          dob: user.dob ? createDateFromString(user.dob) : undefined,
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
      const subErrors = this.userStore.subErrors();
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

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): UserForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const user = User.fromForm(
      this.getForm,
      this.user(),
      this.translate.getCurrentLang(),
      this.isProfessionalOrManager,
      this.formattedAddress,
      this.geometry?.location,
    );

    this.submitData.emit({ user, role: this.getForm.role.value });
  }

  getAddress = (placeResult: PlaceResult): void => {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
    this.addressUpdated = true;
  };
}
