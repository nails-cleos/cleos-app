import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { IUser, User } from '../../interfaces/user';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { cleanUser, getMyUser, updateMyPhoto, updateMyUser } from '../../store/user.actions';
import { fieldChange, validColorValidator, valueChange } from '../../util/validators';
import { flags, IFlag } from '../../util/flags';
import { createAddress, getDisplayNameInitials, getLocale, getUserImage } from '../../util/helper';
import { backendFormatDate, createDateFromString, newDate } from '../../util/dates';
import { lightenDarkenColor } from '../../util/color';
import { Role } from '../../interfaces/token';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { resizeImage } from '../../util/file';
import { SharedModule } from '../../shared/shared.module';
import { GoogleMapComponent, GoogleMapForm } from '../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';
import { ColorPickerDirective } from 'ngx-color-picker';
import { toSignal } from '@angular/core/rxjs-interop';
import { getSelectedUserPipe, getSubErrorsPipe, getUserResponsePipe } from '../../store/selectors/user.selectors';
import { IError } from '../../interfaces/common';
import { UserState } from '../../store/reducers/user.reducers';
import PlaceResult = google.maps.places.PlaceResult;
import PlaceGeometry = google.maps.places.PlaceGeometry;

type ProfileForm = {
  lang: FormControl<string | undefined>;
  displayName: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<Date | undefined>;
  darkColor: FormControl<string>;
  lightColor: FormControl<string>;
  addressForm: FormGroup<GoogleMapForm>;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [SharedModule, NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective, NgIcon,
    ColorPickerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly store: Store<UserState> = inject(Store<UserState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  private selectedUser$ = this.store.pipe(getSelectedUserPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getUserResponsePipe);

  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);
  private langChangeSignal = toSignal<LangChangeEvent>(this.translate.onLangChange);

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  resizedImage = viewChild<ElementRef<HTMLImageElement>>('resizedImage');

  selectedUserSignal = toSignal(this.selectedUser$);

  showCashSignal = signal(false);
  errors = signal<Record<string, unknown>>({});

  imageSignal = computed(() => {
    const user = this.selectedUserSignal();
    return user ? getUserImage(user) : null;
  });
  initialsSignal = computed(() => {
    const user = this.selectedUserSignal();
    return user ? getDisplayNameInitials(user) : '';
  });
  showColorsSignal = computed(() => {
    const user = this.selectedUserSignal();
    const roles = [Role.professional, Role.manager];
    return !!user?.authorities?.some(au => roles.includes(au.authority as Role));
  });
  isAdminSignal = computed(() => {
    const user = this.selectedUserSignal();
    return !!user?.authorities?.some(au => au.authority === Role.admin);
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

  googleMapForm: FormGroup<GoogleMapForm> = this.formBuilder.group<GoogleMapForm>({
    address: this.formBuilder.control(undefined),
    addressDescription: this.formBuilder.control(undefined),
  });

  form: FormGroup<ProfileForm> = this.formBuilder.group<ProfileForm>({
    lang: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    displayName: this.formBuilder.control(''),
    phone: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    dob: this.formBuilder.control(undefined),
    darkColor: this.formBuilder.control(''),
    lightColor: this.formBuilder.control(''),
    addressForm: this.googleMapForm,
  });

  flagList: IFlag[] = flags();

  private selectedLang = toSignal(this.getForm.lang.valueChanges);

  selectedFlag = signal<string | undefined>(undefined);

  private geometry?: PlaceGeometry;
  private formattedAddress?: string;
  private lastImageUrl?: string;

  constructor() {
    effect(() => {
      const lang = this.selectedLang();
      this.selectedFlag.set(this.flagList.find(l => l.value === lang)?.flag);
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof ProfileForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanUser());
        this.store.dispatch(getMyUser());
      }
    });

    effect(() => {
      const user = this.selectedUserSignal();
      if (user) {
        this.form.patchValue({
          lang: user.locale,
          displayName: user.displayName,
          phone: user.phone,
          dob: user.dob ? createDateFromString(user.dob) : undefined,
          darkColor: user.darkColor,
          lightColor: user.lightColor,
        });
        this.googleMapForm.patchValue({
          address: user.address?.name,
          addressDescription: user.address?.description,
        });

        if (this.showColorsSignal()) {
          this.getForm.lightColor.setValidators([Validators.required, validColorValidator()]);
          this.getForm.darkColor.setValidators([Validators.required, validColorValidator()]);
        } else {
          this.getForm.lightColor.clearValidators();
          this.getForm.darkColor.clearValidators();
        }
        this.getForm.lightColor.updateValueAndValidity({ emitEvent: false });
        this.getForm.darkColor.updateValueAndValidity({ emitEvent: false });
      }
    });

    effect(() => {
      const img = this.imageSignal();
      if (!img) {
        this.lastImageUrl = undefined;
        return;
      }
      if (img === this.lastImageUrl) {
        return;
      }
      this.lastImageUrl = img;
      this.resizeImageFromUrl(img);
    });

    effect(() => {
      this.showCashSignal.set(this.selectedUserSignal()?.showCash ?? false);
    });
  }

  get getForm(): ProfileForm {
    return this.form.controls;
  }

  toggleShowCash() {
    this.showCashSignal.update(current => !current);
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const selectedUser = this.selectedUserSignal();

    const lang = valueChange(this.getForm.lang.value, selectedUser?.locale) || this.translate.getCurrentLang();
    const user: IUser = new User();
    user.lang = lang;
    user.displayName = fieldChange(this.getForm.displayName, selectedUser?.displayName);
    user.phone = fieldChange(this.getForm.phone, selectedUser?.phone);
    user.dob = fieldChange(this.getForm.dob, selectedUser?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;
    user.showCash = this.showCashSignal();

    if (this.getForm.lightColor.value) {
      user.lightColor = this.getForm.lightColor.value;
    }

    if (this.getForm.darkColor.value) {
      user.darkColor = this.getForm.darkColor.value;
    }

    user.address = createAddress(this.formattedAddress, this.geometry?.location, selectedUser?.address);

    this.store.dispatch(updateMyUser({ user, redirectUrl: `/${getLocale(lang).language}/auth/profile` }));
    return;
  }

  onSelectFile = (target: any): void => {
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = this.canvas();
          if (canvas?.nativeElement) {
            const dataUrl = resizeImage(img, canvas.nativeElement);
            const resizedImage = this.resizedImage();
            if (resizedImage) {
              resizedImage.nativeElement.src = dataUrl;
            }
            this.store.dispatch(updateMyPhoto({ file: dataUrl }));
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  lightenDarkenColor = (color: string, isDark: boolean): string => lightenDarkenColor(color, isDark ? 50 : -50);

  getAddress = (placeResult: PlaceResult): void => {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
  };

  private resizeImageFromUrl = (url?: string): void => {
    if (url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = this.canvas();
        if (canvas?.nativeElement) {
          const dataUrl = resizeImage(img, canvas.nativeElement);
          const resizedImage = this.resizedImage();
          if (resizedImage) {
            resizedImage.nativeElement.src = dataUrl;
          }
        }
      };
      img.src = url;
    }
  };
}
