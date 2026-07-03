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
import { User } from '../../user/user';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { validColorValidator, valueChange } from '../../util/validators';
import { flags, IFlag } from '../../util/flags';
import { getDisplayNameInitials, getLocale, getUserImage } from '../../util/helper';
import { createDateFromString } from '../../util/dates';
import { Role } from '../../interfaces/token';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { resizeImage } from '../../util/file';
import { GoogleMapComponent, GoogleMapForm } from '../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../../interfaces/common';
import { ColorPickerComponent } from '../../shared/color-picker/color-picker.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, UpperCasePipe } from '@angular/common';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import PlaceGeometry = google.maps.places.PlaceGeometry;
import PlaceResult = google.maps.places.PlaceResult;
import { MatCheckbox } from '@angular/material/checkbox';
import { ProfileForm } from '../../user/user-form.types';
import { UserStore } from '../../store/user.store';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepicker, MatSelect, MatOption, MatIcon,
    MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, NgClass, MatError, MatPrefix, BackButtonDirective,
    NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective, NgIcon,
    ColorPickerComponent, UpperCasePipe, MatCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly userStore = inject(UserStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private langChangeSignal = toSignal<LangChangeEvent>(this.translateService.onLangChange);

  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  resizedImage = viewChild<ElementRef<HTMLImageElement>>('resizedImage');

  selectedUserSignal = this.userStore.selected;

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
    const phoneTranslations = this.translateService.instant('COMMON.USER.PHONE');

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
  private readonly language = this.navigationService.language;

  constructor() {
    this.userStore.clean();
    this.userStore.loadMyUser();

    effect(() => {
      const lang = this.selectedLang();
      this.selectedFlag.set(this.flagList.find(l => l.value === lang)?.flag);
    });

    effect(() => {
      const subErrors = this.userStore.subErrors();
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
      if (this.userStore.response()) {
        this.userStore.clean();
        this.userStore.loadMyUser();
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
    const lang = valueChange(this.getForm.lang.value, selectedUser?.locale) || this.language;
    const user = User.fromProfileForm(
      this.getForm,
      this.showCashSignal(),
      selectedUser,
      this.language,
      this.formattedAddress,
      this.geometry?.location,
    );

    this.userStore.updateMyUser(user, `/${getLocale(lang).language}/auth/profile`);
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
            this.userStore.updateMyPhoto(dataUrl);
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

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
