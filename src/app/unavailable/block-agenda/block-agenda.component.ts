import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { IUser, IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { combineLatestWith } from 'rxjs';
import { fieldChange, requireMatch, valueChange } from '../../util/validators';
import { IUnavailable, Unavailable } from '../../interfaces/unavailable';
import { Store } from '@ngrx/store';
import {
  API_LOCALE,
  createNewDate,
  diffTime,
  filterDateRoom,
  formatDuration,
  formatFullDate,
  formatTime,
  getCurrentTimeZone,
  getMinMaxDate,
  getNowTimeZone,
  getTime,
  getTimeNumber,
  newDate,
  zoneDateToDate,
} from '../../util/dates';
import {
  createBlockAgenda,
  deleteUnavailable,
  getAllRoomsByProfessionalId,
  getUnavailable,
  updateUnavailable,
} from '../../store/unavailable.actions';
import { executeDialogNoWidth } from '../../util/helper';
import { map, startWith } from 'rxjs/operators';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { AuthUserService } from '../../services/auth-user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UnavailableState } from '../../store/reducers/unavailable.reducers';
import {
  getCurrentUnavailableIdPipe,
  getProfessionalsPipe,
  getRoomsPipe,
  getSelectedUnavailablePipe,
  getSubErrorsPipe,
  getUnavailableParamsPipe,
} from '../../store/selectors/unavailable.selectors';
import { IError } from '../../interfaces/common';
import { closest } from '../../util/numbers';

type BlockAgendaForm = {
  professional: FormControl<IUserAll | undefined>;
  startDate: FormControl<Date | undefined>;
  startTime: FormControl<string | undefined>;
  duration: FormControl<string | undefined>;
}

@Component({
  selector: 'app-block-agenda',
  templateUrl: './block-agenda.component.html',
  styleUrls: ['./block-agenda.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockAgendaComponent {
  private readonly store: Store<UnavailableState> = inject(Store<UnavailableState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private navigationParams$ = this.store.pipe(getUnavailableParamsPipe);
  private unavailableId$ = this.store.pipe(getCurrentUnavailableIdPipe);
  private selectedUnavailable$ = this.store.pipe(getSelectedUnavailablePipe);
  private allProfessionals$ = this.store.pipe(getProfessionalsPipe);
  private allRooms$ = this.store.pipe(getRoomsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private navigationParams = toSignal(this.navigationParams$);
  private unavailableIdSignal = toSignal(this.unavailableId$);
  private allRoomsSignal = toSignal(this.allRooms$);
  private subErrorsSignal = toSignal(this.subErrors$);

  unavailableSignal = toSignal(this.selectedUnavailable$);
  allProfessionalsSignal = toSignal(this.allProfessionals$);
  isAddModeSignal = computed(() => !this.unavailableIdSignal());
  errors = signal<Record<string, unknown>>({});
  private authUserSignal = this.authUserService.authUser;

  private isRoomAdmin = computed(() => this.authUserSignal()?.isRoomAdmin ?? false);

  form: FormGroup<BlockAgendaForm> = this.formBuilder.group<BlockAgendaForm>({
    professional: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    startDate: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    startTime: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    duration: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  private selectedStartDate = toSignal(this.getForm.startDate.valueChanges);
  private selectedStartTime = toSignal(this.getForm.startTime.valueChanges);
  private selectedProfessional = toSignal(this.getForm.professional.valueChanges);

  filteredProfessionalSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map((value) => !value || typeof value === 'string' ? value : value.displayName),
      combineLatestWith(this.allProfessionals$),
      map(([name, professionals]) => {
        if (name) {
          return this.filter(name, professionals);
        } else {
          return professionals ? professionals.slice() : professionals;
        }
      }),
    ),
  );

  private rooms = signal(this.allRoomsSignal());

  roomAvailability?: IRoomAll;

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = signal(false);

  private readonly timeZone: string = getCurrentTimeZone();

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      if (params) {
        let startTime;
        let showDuration = false;
        if (params.room) {
          this.rooms.set([params.room]);
          showDuration = true;
          const time = getTimeNumber(params.date);
          const hour = time ? `${time.hour}`.padStart(2, '0') : '12';
          const minute = time ? `${closest(time.minute)}`.padStart(2, '0') : '00';
          startTime = `${hour}:${minute}`;
        }
        this.setValues(params.date, startTime, showDuration);
      }
    });

    effect(() => {
      this.rooms.set(this.allRoomsSignal());
    });

    effect(() => {
      const selected = this.unavailableSignal();
      if (!selected?.id) {
        return;
      }

      const date = zoneDateToDate(selected.timestamp);

      this.form.patchValue({
        professional: selected.professional,
        startDate: date,
        startTime: getTime(date),
        duration: selected.duration ? formatDuration(selected.duration) : '',
      });
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof BlockAgendaForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.unavailableIdSignal();
      if (id) {
        this.store.dispatch(getUnavailable({ id }));
      }
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
        this.store.dispatch(getAllRoomsByProfessionalId({ professionalId: professional.id }));
      }
    });

    effect(() => {
      const professionals = this.allProfessionalsSignal();
      const isAddMode = this.isAddModeSignal();
      if (professionals) {
        if (isAddMode && professionals?.length === 1 && !this.getForm.professional.value) {
          this.getForm.professional.setValue(professionals[0]);
        }
      }
    });
  }

  get getForm(): BlockAgendaForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const time = getTimeNumber(this.getForm.startTime.value);
    const date = createNewDate(this.getForm.startDate.value!, time?.hour, time?.minute);

    const unavailableSignal = this.unavailableSignal();
    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = valueChange(this.getForm.professional.value, unavailableSignal?.professional)?.id;
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = this.timeZone;
    unavailable.time = fieldChange(this.getForm.duration, unavailableSignal?.duration);

    const isRoomAdmin = this.isRoomAdmin();
    const id = this.unavailableIdSignal();
    if (!id) {
      this.store.dispatch(createBlockAgenda({ unavailable, isRoomAdmin }));
    } else {
      this.store.dispatch(
        updateUnavailable({ id, unavailable, path: isRoomAdmin ? 'dashboard/events' : 'unavailable/block-agenda' }),
      );
    }
  }

  focusin() {
    const startTime = this.getForm.startTime.value;
    const rooms = this.rooms();
    if (rooms?.length && startTime) {
      const startDate = this.getForm.startDate.value;
      const time = getTimeNumber(startTime);
      const date = createNewDate(startDate ? newDate(startDate) : getNowTimeZone(), time?.hour, time?.minute);
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, rooms);

      this.setValues(startDate, startTime, this.showDuration(), getTime(minDate), getTime(maxDate), this.durationMax,
        roomAvailability);
    }
  }

  delete(): void {
    const unavailable = this.unavailableSignal();
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const date = this.getForm.startDate.value ?
      formatFullDate(this.getForm.startDate.value, this.translate.getCurrentLang()) : unavailable?.start;
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', { date });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: unavailable, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(
          deleteUnavailable({ id: result.id, timestamp: result.timestamp, timeZone: result.timeZone }),
        );
      }
    });
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
  };

  private setMaxMin = (startDate: Date, rooms: IRoomAll[]): void => {
    const day = startDate.getDay();
    const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, startDate, rooms);
    const availability = roomAvailability;

    this.minTime = getTime(minDate);
    this.maxTime = getTime(maxDate);
    this.calculateMaxDuration(startDate);
    this.roomAvailability = availability;
  };

  private calculateMaxDuration = (date: Date): void => {
    const max = getTimeNumber(this.maxTime);
    if (max) {
      const maxHour = max.hour;
      const diffMin = max.minute;

      const d = diffTime(date, this.timeZone, Number(maxHour), Number(diffMin));
      this.showDuration.set(true);
      this.durationMax = formatTime(d, this.timeZone);
      if (this.isAddModeSignal()) {
        this.getForm.duration.setValue(undefined);
      }
    }
  };

  private filter = (name: string, professionals?: IUserAll[]): IUserAll[] | undefined => professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
