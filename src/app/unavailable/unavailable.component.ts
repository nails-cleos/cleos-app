import { ChangeDetectionStrategy, Component, effect, inject, input, output, Signal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatestWith } from 'rxjs';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUnavailable, IUnavailableAll, Unavailable, UnavailableForm } from '../interfaces/unavailable';
import { IUser, IUserAll } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import {
  createEndDate,
  createNewDate,
  diffTime,
  filterDateRoom,
  formatDuration,
  formatTime,
  getCurrentTimeZone,
  getMinMaxDate,
  getNowTimeZone,
  getTime,
  getTimeNumber,
  newDate,
  zoneDateToDate,
} from '../util/dates';
import { IRoomAll } from '../interfaces/room';
import { FrequencyEnum } from '../util/helper';
import { requireMatch } from '../util/validators';
import { TranslatePipe } from '@ngx-translate/core';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon, IError } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';
import { UnavailableNavigationParams, UnavailableStore } from '../store/unavailable.store';

@Component({
  selector: 'app-unavailable',
  templateUrl: './unavailable.component.html',
  styleUrls: ['./unavailable.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepicker, MatSelect, MatOption, MatIcon,
    MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, KeyValuePipe, MatAutocomplete, MatError,
    MatAutocompleteTrigger, MatPrefix, BackButtonDirective, BackButtonDirective, MatHint, MatCheckbox,
    TimepickerDirective, TimepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableComponent {
  config = input.required<ICommon>();
  unavailable = input<IUnavailableAll | undefined>();
  params = input<UnavailableNavigationParams>();

  submitData = output<IUnavailable>();
  deleteData = output();

  private readonly unavailableStore = inject(UnavailableStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private allRoomsSignal = this.unavailableStore.rooms;
  private subErrorsSignal = this.unavailableStore.subErrors;

  allProfessionalsSignal = this.unavailableStore.professionals;
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<UnavailableForm> = this.formBuilder.group<UnavailableForm>({
    professional: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    description: this.formBuilder.control(undefined),
    startDate: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    startTime: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    duration: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    repeat: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    allDay: this.formBuilder.control(false),
    endDate: this.formBuilder.control(undefined),
  });

  filteredProfessionalSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map((value) => !value || typeof value === 'string' ? value : value.displayName),
      combineLatestWith(toObservable(this.allProfessionalsSignal)),
      map(([name, professionals]) => {
        if (name) {
          return this.filter(name, professionals);
        }

        return professionals ? professionals.slice() : professionals;
      }),
    ),
  );

  private rooms = signal(this.allRoomsSignal());

  roomAvailability?: IRoomAll;

  repeats = FrequencyEnum;

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = signal(false);
  showEnd = false;

  private selectedAllDay = toSignal(this.getForm.allDay.valueChanges);
  private selectedRepeat = toSignal(this.getForm.repeat.valueChanges);
  private selectedStartDate = toSignal(this.getForm.startDate.valueChanges);
  private selectedStartTime = toSignal(this.getForm.startTime.valueChanges);
  private selectedProfessional = toSignal(this.getForm.professional.valueChanges);

  private readonly timeZone: string = getCurrentTimeZone();

  constructor() {
    this.unavailableStore.loadProfessionals();

    effect(() => {
      const params = this.params();
      if (params) {
        if (params.room) {
          this.rooms.set([params.room]);
        }
        this.setValues(params.date, params.startTime, params.showDuration);
      }
    });

    effect(() => {
      this.rooms.set(this.allRoomsSignal());
    });

    effect(() => {
      const selected = this.unavailable();
      if (!selected) {
        return;
      }

      const date = zoneDateToDate(selected.timestamp);
      this.form.patchValue({
        professional: selected.professional,
        description: selected.description,
        startDate: date,
        endDate: createEndDate(selected.end),
        startTime: getTime(date),
        duration: selected.duration ? formatDuration(selected.duration) : '',
        repeat: selected.repeat,
        allDay: selected.allDay,
      });
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof UnavailableForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const allDay = this.selectedAllDay();
      if (allDay) {
        this.getForm.duration.clearValidators();
        this.getForm.startTime.clearValidators();
      } else {
        this.getForm.duration.setValidators(Validators.required);
        this.getForm.startTime.setValidators(Validators.required);
      }
      this.getForm.startTime.updateValueAndValidity();
      this.getForm.duration.updateValueAndValidity();
    });

    effect(() => {
      const repeat = this.selectedRepeat();
      if (repeat && [FrequencyEnum.onceAWeek, FrequencyEnum.everyDay, FrequencyEnum.onceAMonth].includes(repeat)) {
        this.getForm.endDate.setValidators(Validators.required);
        this.showEnd = true;
      } else {
        this.getForm.endDate.clearValidators();
        this.showEnd = false;
      }
      this.getForm.endDate.updateValueAndValidity();
    });

    effect(() => {
      const starDate = this.selectedStartDate();
      const rooms = this.rooms();
      if (starDate && rooms?.length) {
        this.setMaxMin(starDate, rooms);
      }
    });

    effect(() => {
      const startTime = this.selectedStartTime();
      if (startTime) {
        const startDate = this.getForm.startDate.value;
        const time = getTimeNumber(startTime);
        const date = createNewDate(startDate ? newDate(startDate) : getNowTimeZone(), time?.hour, time?.minute);

        this.calculateMaxDuration(date);
      }
    });

    effect(() => {
      const professional = this.selectedProfessional();
      if (professional) {
        this.unavailableStore.loadRoomsByProfessionalId(professional.id);
      }
    });

    effect(() => {
      const professionals = this.allProfessionalsSignal();
      if (professionals && !this.unavailable() && professionals.length === 1 && !this.getForm.professional.value) {
        this.getForm.professional.setValue(professionals[0]);
      }
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): UnavailableForm {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.submitData.emit(Unavailable.fromForm(this.getForm, this.unavailable(), this.timeZone));
  }

  delete() {
    this.deleteData.emit();
  }

  focusin() {
    const rooms = this.rooms();
    if (!rooms?.length) {
      return;
    }
    if (this.getForm.startTime.value) {
      const time = getTimeNumber(this.getForm.startTime.value);
      const date = createNewDate(
        this.getForm.startDate.value ? newDate(this.getForm.startDate.value) : getNowTimeZone(),
        time?.hour,
        time?.minute,
      );
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, rooms);

      this.setValues(
        this.getForm.startDate.value,
        this.getForm.startTime.value,
        this.showDuration(),
        getTime(minDate),
        getTime(maxDate),
        this.durationMax,
        roomAvailability,
      );
    }
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.roomAvailability);

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.professional.setValue(undefined);
      this.setValues();
    }
  };

  private setValues = (
    startDate?: Date,
    startTime?: string,
    showDuration: boolean = false,
    minTime?: string,
    maxTime?: string,
    durationMax?: any,
    roomAvailability?: IRoomAll,
  ): void => {
    this.getForm.startDate.setValue(startDate);
    this.getForm.startTime.setValue(startTime);
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.showDuration.set(showDuration);
    this.durationMax = durationMax;
    this.roomAvailability = roomAvailability;
    this.getForm.duration.setValue(undefined);
    this.getForm.endDate.setValue(undefined);
    this.getForm.repeat.setValue(undefined);
    this.getForm.allDay.setValue(startDate ? this.getForm.allDay.value : false);
    this.showEnd = false;
  };

  private setMaxMin = (startDate: Date, rooms: IRoomAll[]): void => {
    const day = startDate.getDay();
    const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, startDate, rooms);

    this.minTime = getTime(minDate);
    this.maxTime = getTime(maxDate);
    this.calculateMaxDuration(startDate);
    this.roomAvailability = roomAvailability;
  };

  private calculateMaxDuration = (date: Date): void => {
    const max = getTimeNumber(this.maxTime);
    if (max) {
      const d = diffTime(date, this.timeZone, Number(max.hour), Number(max.minute));
      this.showDuration.set(true);
      this.durationMax = formatTime(d, this.timeZone);
      if (!this.unavailable()) {
        this.getForm.duration.setValue(undefined);
      }
    }
  };

  private filter = (name: string, professionals?: IUserAll[]): IUserAll[] | undefined => professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );
}
