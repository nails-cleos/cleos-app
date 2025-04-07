import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectUserState } from '../../store/app.states';
import { IUser, User } from '../../interfaces/user';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as fromActionsUser from '../../store/user.actions';
import { fieldChange, valueChange } from '../../util/validators';
import { findFlag, flags, IFlag } from '../../util/flags';
import { createAddress, getDisplayNameInitials, getLocale, getUserImage } from '../../util/helper';
import { backendFormatDate, createDateFromString, newDate } from '../../util/dates';
import { lightenDarkenColor } from '../../util/color';
import { Role } from '../../interfaces/token';
import { TranslateService } from '@ngx-translate/core';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';
import { resizeImage } from '../../util/file';
import { SharedModule } from '../../shared/shared.module';
import PlaceResult = google.maps.places.PlaceResult;
import PlaceGeometry = google.maps.places.PlaceGeometry;
import { GoogleMapComponent } from '../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent, TextLabels } from 'ngx-material-intl-tel-input';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [SharedModule, NgxMaterialIntlTelInputComponent, NgxColorsModule, GoogleMapComponent, BackButtonDirective,
    NgIcon]
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('resizedImage', { static: false }) resizedImage?: ElementRef<HTMLImageElement>;

  private store: Store<AppState> = inject(Store<AppState>);
  private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private translate: TranslateService = inject(TranslateService);

  form!: UntypedFormGroup;
  errors: any = [];
  user?: IUser;
  image: any;
  initials?: string;

  langValue: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  displayName: UntypedFormControl = new UntypedFormControl();
  phone: FormControl = new FormControl('', [Validators.required]);
  dob: UntypedFormControl = new UntypedFormControl();
  darkColor: UntypedFormControl = new UntypedFormControl(undefined, [validColorValidator()]);
  darkColorPicker: UntypedFormControl = new UntypedFormControl();
  lightColor: UntypedFormControl = new UntypedFormControl(undefined, [validColorValidator()]);
  lightColorPicker: UntypedFormControl = new UntypedFormControl();

  address: UntypedFormControl = new UntypedFormControl();

  showColors = false;

  flagList: IFlag[] = flags();
  isDarkMode: boolean = false;
  isAdmin: boolean = false;
  showCash: boolean = false;
  labels: TextLabels = {
    mainLabel: '',
    codePlaceholder: '',
    searchPlaceholderLabel: '',
    noEntriesFoundLabel: '',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: ''
  };

  private getState: Observable<any> = this.store.select(selectUserState);
  private subscription?: Subscription;
  private geometry?: PlaceGeometry;
  private formattedAddress?: string;

  get update(): void {
    if (this.form.invalid) {
      return;
    }

    const lang = valueChange(this.langValue.value.value, this.user?.locale) || this.translate.currentLang;
    const user: IUser = new User();
    user.lang = lang;
    user.displayName = fieldChange(this.displayName, this.user?.displayName);
    user.phone = fieldChange(this.phone, this.user?.phone);
    user.dob = fieldChange(this.dob, this.user?.dob);
    user.dob = user.dob ? backendFormatDate(newDate(user.dob)) : user.dob;
    user.showCash = this.showCash;

    if (this.lightColor.value) {
      user.lightColor = this.lightColor.value;
    }

    if (this.darkColor.value) {
      user.darkColor = this.darkColor.value;
    }

    user.address = createAddress(this.formattedAddress, this.geometry?.location, this.user?.address);

    return this.store.dispatch(
      new fromActionsUser.UpdateUser({ user, redirectUrl: `/${ getLocale(lang).language }/auth/profile` })
    );
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.findMe();
    this.subscribe();
    this.loadLabels();
    this.translate.onLangChange.subscribe(() => this.loadLabels());
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSelectFile = (target: any): void => {
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          if (this.canvas?.nativeElement) {
            const dataUrl = resizeImage(img, this.canvas.nativeElement);
            if (this.resizedImage) {
              this.resizedImage.nativeElement.src = dataUrl;
            }
            this.store.dispatch(
              new fromActionsUser.UpdatePhoto(dataUrl)
            );
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
      requiredError: phoneTranslations.REQUIRED || ''
    };
  };

  private findMe = (): void => this.store.dispatch(new fromActionsUser.FindMe());

  private createForm = (): void => {
    this.form = this.formBuilder.group({
        langValue: this.langValue,
        displayName: this.displayName,
        phone: this.phone,
        dob: this.dob,
        darkColor: this.darkColor,
        darkColorPicker: this.darkColorPicker,
        lightColor: this.lightColor,
        lightColorPicker: this.lightColorPicker,
        address: this.address
      }
    );

    this.darkColor.valueChanges.subscribe((color) => {
      if (this.darkColorPicker.valid) {
        this.darkColorPicker.setValue(color, { emitEvent: false });
      }
    });
    this.darkColorPicker.valueChanges.subscribe((color) =>
      this.darkColor.setValue(color, { emitEvent: false })
    );

    this.lightColor.valueChanges.subscribe((color) => {
      if (this.lightColorPicker.valid) {
        this.lightColorPicker.setValue(color, { emitEvent: false });
      }
    });
    this.lightColorPicker.valueChanges.subscribe((color) =>
      this.lightColor.setValue(color, { emitEvent: false })
    );
  };

  private clean = (): void => this.store.dispatch(new fromActionsUser.Clean());

  private resizeImageFromUrl = (url?: string): void => {
    if (url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (this.canvas?.nativeElement) {
          const dataUrl = resizeImage(img, this.canvas.nativeElement);
          if (this.resizedImage) {
            this.resizedImage.nativeElement.src = dataUrl;
            this.cdRef.detectChanges();
          }
        }
      };
      img.src = url;
    }
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        const user = state.selected;
        this.user = user;
        this.initials = getDisplayNameInitials(user);
        this.image = getUserImage(user);
        this.resizeImageFromUrl(this.image);
        this.form.patchValue(state.selected);
        this.address.setValue(this.user?.address?.name);

        const roles = [Role.professional, Role.manager];
        this.showColors = state.selected.authorities?.some((au: any) => roles.includes(au.authority));
        this.isAdmin = state.selected.authorities?.some((u: any) => u.authority === Role.admin);

        if (state.selected.lightColor) {
          this.lightColorPicker.setValue(state.selected.lightColor);
        }
        if (state.selected.darkColor) {
          this.darkColorPicker.setValue(state.selected.darkColor);
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
  };
}
