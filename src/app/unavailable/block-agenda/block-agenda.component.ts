import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped,
} from '@angular/forms';
import { IUser, IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { Observable, Subscription } from 'rxjs';
import { fieldChange, requireMatchAsync, valueChange } from '../../util/validators';
import { IUnavailable, Unavailable } from '../../interfaces/unavailable';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
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
  clean,
  createBlockAgenda,
  deleteUnavailable,
  getAllProfessional,
  getAllRoomsByProfessionalId,
  getUnavailable,
  updateUnavailable,
} from '../../store/unavailable.actions';
import { executeDialogNoWidth } from '../../util/helper';
import { map, startWith } from 'rxjs/operators';
import { closest } from '../../util/numbers';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';

@Component({
  selector: 'app-block-agenda',
  templateUrl: './block-agenda.component.html',
  styleUrls: ['./block-agenda.component.scss'],
  imports: [SharedModule, BackButtonDirective],
})
export class BlockAgendaComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() unavailable?: IUnavailable;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  errors: any = [];

  professionals?: IUserAll[];
  rooms: IRoomAll[] = [];
  filteredOptions?: Observable<IUser[] | undefined>;
  roomAvailability?: IRoomAll;

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = false;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;
  private readonly timeZone: string;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService, public dialog: MatDialog) {
    this.isAddMode = true;
    this.getState = this.store.select(selectUnavailableState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.timeZone = getCurrentTimeZone();
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const time = getTimeNumber(this.getForm.startTime.value);
    const date = createNewDate(this.getForm.startDate.value, time?.hour, time?.minute);

    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = valueChange(this.getForm.professional.value, this.unavailable?.professional)?.id;
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = this.timeZone;
    unavailable.time = fieldChange(this.getForm.duration as UntypedFormControl, this.unavailable?.duration);

    if (this.isAddMode) {
      this.store.dispatch(
        createBlockAgenda({ unavailable }),
      );
    } else {
      const id = this.id!;
      this.unavailable = undefined;
      this.store.dispatch(updateUnavailable({ id, unavailable, path: 'unavailable/block-agenda' }));
    }
    return;
  }

  get focusin(): void {
    const startTime = this.getForm.startTime.value;
    if (this.rooms.length && startTime) {
      const startDate = this.getForm.startDate.value;
      const time = getTimeNumber(startTime);
      const date = createNewDate(startDate ? newDate(startDate) : getNowTimeZone(), time?.hour, time?.minute);
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, this.rooms);

      this.setValues(startDate, startTime, getTime(minDate), getTime(maxDate), this.showDuration, this.durationMax,
        roomAvailability);
    }
    return;
  }

  get delete(): void {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const date = this.unavailable?.startDate ? formatFullDate(this.unavailable.startDate, this.translate.currentLang)
      : this.unavailable?.start;
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', { date });

    return executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: this.unavailable }, result => {
      if (result) {
        this.store.dispatch(
          deleteUnavailable({ id: result.id, timestamp: result.timestamp, timeZone: result.timeZone }),
        );
      }
    });
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
    if (this.extras) {
      let startTime;
      if (this.extras.room) {
        this.rooms = [this.extras.room];
        this.getForm.professional.setValue(this.extras.room.professional);
        this.showDuration = true;
        const time = getTimeNumber(this.extras.date);
        const hour = time ? `${ time.hour }`.padStart(2, '0') : '12';
        const minute = time ? `${ closest(time.minute) }`.padStart(2, '0') : '00';
        startTime = `${ hour }:${ minute }`;
      }
      this.setValues(this.extras.date, startTime);
    }
    if (!this.isAddMode) {
      this.getBlockAgenda();
    }
  }

  ngAfterViewInit(): void {
    this.getProfessionals();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.roomAvailability);

  getRoom = (user: IUser): void => this.store.dispatch(getAllRoomsByProfessionalId({ professionalId: user.id! }));

  keyDownHandler = (event: any): void => {
    if (event.code === 'Backspace') {
      this.getForm.professional.setValue('');
      this.setValues();
    }
  };

  private setValues = (startDate?: any, startTime?: any, minTime?: string, maxTime?: string,
    showDuration: boolean = false, durationMax?: any, roomAvailability?: IRoomAll): void => {
    this.getForm.startDate.setValue(startDate);
    this.getForm.startTime.setValue(startTime);
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.showDuration = showDuration;
    this.durationMax = durationMax;
    this.roomAvailability = roomAvailability;
    this.getForm.duration.setValue(undefined);
  };

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      professional: ['', Validators.required, requireMatchAsync],
      description: [''],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: ['', Validators.required],
    });
    this.filteredOptions = this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals),
    );
    this.valueChange();
  };

  private valueChange = (): void => {
    this.getForm.startDate.valueChanges.subscribe(value => {
      if (value) {
        if (this.rooms.length) {
          this.setMaxMin(value, this.rooms);
        }
        this.getForm.startTime.setValue(undefined);
        this.getForm.duration.setValue(undefined);
      }
    });

    this.getForm.startTime.valueChanges.subscribe(value => {
      if (value) {
        const startDate = this.getForm.startDate.value;
        const time = getTimeNumber(value);
        const date = createNewDate(startDate ? newDate(startDate) : getNowTimeZone(), time?.hour, time?.minute);

        this.calculateMaxDuration(date);
      }
    });

    this.getForm.professional.valueChanges.subscribe(value => {
      if (!this.rooms?.length && value) {
        this.getRoom(value);
      }
    });
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
      this.showDuration = true;
      this.durationMax = formatTime(d, this.timeZone);
      if (this.isAddMode) {
        this.getForm.duration.setValue(undefined);
      }
    }
  };

  private clean = (): void => this.store.dispatch(clean());

  private getProfessionals = (): void => this.store.dispatch(getAllProfessional());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.professionals) {
        this.professionals = state.professionals;
        if (this.isAddMode && this.professionals?.length === 1 && !this.getForm.professional.value) {
          this.getForm.professional.setValue(this.professionals[0]);
        }
      }
      if (state.rooms && !this.rooms?.length) {
        this.rooms = state.rooms;
        const startDate = this.getForm.startDate.value;
        if (startDate) {
          this.setMaxMin(startDate, state.rooms);
        }
      }
      if (state.selected?.id && !this.unavailable) {
        const date = zoneDateToDate(state.selected.timestamp);
        this.unavailable = {
          id: state.selected.id,
          professional: state.selected.professional,
          startDate: date,
          startTime: getTime(date),
          duration: state.selected.duration ? formatDuration(state.selected.duration) : '',
        } as IUnavailable;
        this.form.patchValue(this.unavailable);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.response) {
        this.router.navigate([this.translate.currentLang, 'unavailable']);
      }
    });
  };

  private filter = (name: string): IUser[] | undefined => this.professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private getBlockAgenda = (): void => {
    if (!this.unavailable) {
      this.store.dispatch(getUnavailable({ id: this.id! }));
    }
  };
}
