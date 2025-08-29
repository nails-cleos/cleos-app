import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../store/app.states';
import { IUnavailable, Unavailable } from '../interfaces/unavailable';
import * as fromActionsUnavailable from '../store/unavailable.actions';
import { IUser, IUserAll } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import {
  API_LOCALE,
  createEndDate,
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
} from '../util/dates';
import { IRoomAll } from '../interfaces/room';
import { executeDialogNoWidth, FrequencyEnum } from '../util/helper';
import { ActivatedRoute, Router } from '@angular/router';
import { closest } from '../util/numbers';
import { fieldChange, requireMatchAsync, valueChange } from '../util/validators';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';

@Component({
  selector: 'app-unavailable',
  templateUrl: './unavailable.component.html',
  styleUrls: ['./unavailable.component.scss'],
  imports: [SharedModule, BackButtonDirective],
})
export class UnavailableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() unavailable?: IUnavailable;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;

  professionals?: IUserAll[];
  rooms: IRoomAll[] = [];
  filteredOptions?: Observable<IUser[] | undefined>;
  roomAvailability?: IRoomAll;

  repeats = FrequencyEnum;

  errors: any = [];

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = false;
  showEnd = false;

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

  	let date: Date;
  	if (!this.getForm.allDay.value) {
  		const time = getTimeNumber(this.getForm.startTime.value);
  		date = createNewDate(this.getForm.startDate.value, time?.hour, time?.minute);
  	} else {
  		date = createNewDate(this.getForm.startDate.value);
  	}

  	const unavailable: IUnavailable = new Unavailable();
  	unavailable.professionalId = valueChange(this.getForm.professional.value, this.unavailable?.professional)?.id;
  	unavailable.description = valueChange(this.getForm.description.value, this.unavailable?.description);
  	unavailable.time = fieldChange(this.getForm.duration as UntypedFormControl, this.unavailable?.duration);
  	unavailable.repeat = fieldChange(this.getForm.repeat as UntypedFormControl, this.unavailable?.repeat);

  	unavailable.start = date.toLocaleString(API_LOCALE);
  	unavailable.timeZone = this.timeZone;
  	unavailable.allDay = this.getForm.allDay.value;
  	if (this.getForm.endDate.value) {
  		unavailable.endString = createNewDate(this.getForm.endDate.value).toLocaleString(API_LOCALE);
  	}

  	if (this.isAddMode) {
  		this.store.dispatch(
  			new fromActionsUnavailable.CreateUnavailable(unavailable),
  		);
  	} else {
  		unavailable.id = this.id;
  		this.unavailable = undefined;
  		this.store.dispatch(
  			new fromActionsUnavailable.UpdateUnavailableById(unavailable),
  		);
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
  				new fromActionsUnavailable.DeleteUnavailableById(result),
  			);
  		}
  	});
  }

  get focusin(): void {
  	if (this.rooms.length && this.getForm.startTime.value) {
  		const time = getTimeNumber(this.getForm.startTime.value);
  		const date = createNewDate(
  			this.getForm.startDate.value ? newDate(this.getForm.startDate.value) : getNowTimeZone(), time?.hour,
  			time?.minute);
  		const day = date.getDay();
  		const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, this.rooms);

  		this.setValues(this.getForm.startDate.value, this.getForm.startTime.value, getTime(minDate), getTime(maxDate),
  			this.showDuration,
  			this.durationMax, roomAvailability);
  	}
  	return;
  }

  ngOnInit(): void {
  	const id = this.route.snapshot.paramMap.get('id');
  	if (id) {
  		this.id = id;
  	}
  	this.createForm();
  	this.clean();
  	this.subscribe();
  	this.getProfessionals();
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
  		this.getUnavailable();
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

  getRoom = (user: IUser): void => this.store.dispatch(new fromActionsUnavailable.GetAllRoomsByProfessionalId(user.id));

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
  	this.getForm.endDate.setValue(undefined);
  	this.getForm.repeat.setValue(undefined);
  	this.getForm.allDay.setValue(startDate ? this.getForm.allDay.value : false);
  	this.showEnd = false;
  };

  private createForm = (): void => {
  	this.form = this.formBuilder.group({
  		professional: ['', Validators.required, requireMatchAsync],
  		description: [''],
  		startDate: ['', Validators.required],
  		startTime: ['', Validators.required],
  		duration: ['', Validators.required],
  		repeat: ['', Validators.required],
  		allDay: [''],
  		endDate: [''],
  	});
  	this.filteredOptions = this.getForm.professional.valueChanges.pipe(
  		startWith(''),
  		map(value => typeof value === 'string' ? value : value.name),
  		map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals),
  	);
  	this.formValueChange();
  };

  private formValueChange = (): void => {
  	this.getForm.allDay.valueChanges.subscribe(value => {
  		if (value) {
  			this.getForm.duration.clearValidators();
  			this.getForm.duration.updateValueAndValidity();
  			this.getForm.startTime.clearValidators();
  			this.getForm.startTime.updateValueAndValidity();
  		} else {
  			this.getForm.duration.setValidators(Validators.required);
  			this.getForm.duration.updateValueAndValidity();
  			this.getForm.startTime.setValidators(Validators.required);
  			this.getForm.startTime.updateValueAndValidity();
  		}
  	});
  	this.getForm.repeat.valueChanges.subscribe(value => {
  		if (value && [FrequencyEnum.onceAWeek, FrequencyEnum.everyDay, FrequencyEnum.onceAMonth].includes(value)) {
  			this.getForm.endDate.setValidators(Validators.required);
  			this.getForm.endDate.updateValueAndValidity();
  			this.showEnd = true;
  		} else {
  			this.getForm.endDate.clearValidators();
  			this.getForm.endDate.updateValueAndValidity();
  			this.showEnd = false;
  		}
  	});

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

  private clean = (): void => this.store.dispatch(new fromActionsUnavailable.Clean());

  private getProfessionals = (): void => this.store.dispatch(new fromActionsUnavailable.GetAllProfessional());

  private filter = (name: string): IUser[] | undefined => this.professionals?.filter(
  	option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );

  private getUnavailable = (): void => {
  	if (!this.unavailable) {
  		this.store.dispatch(
  			new fromActionsUnavailable.FindUnavailableById(this.id),
  		);
  	}
  };

  private subscribe = (): void => {
  	this.subscription = this.getState.subscribe(state => {
  		if (state.professionals) {
  			this.professionals = state.professionals;
  			if (this.isAddMode && this.professionals?.length === 1 && !this.getForm.professional.value) {
  				this.getForm.professional.setValue(this.professionals[0]);
  			}
  		}
  		if (state.room && !this.rooms?.length) {
  			this.rooms = state.room;
  			const startDate = this.getForm.startDate.value;
  			if (startDate) {
  				this.setMaxMin(startDate, state.room);
  			}
  		}
  		if (state.selected && !this.unavailable) {
  			const date = zoneDateToDate(state.selected.timestamp);
  			this.unavailable = {
  				id: state.selected.id,
  				professional: state.selected.professional,
  				description: state.selected.description,
  				start: state.selected.start,
  				end: state.selected.end,
  				endString: state.selected.endString,
  				startDate: date,
  				endDate: createEndDate(state.selected.end),
  				startTime: getTime(date),
  				duration: state.selected.duration ? formatDuration(state.selected.duration) : '',
  				repeat: state.selected.repeat,
  				allDay: state.selected.allDay,
  			} as IUnavailable;
  			this.form.patchValue(this.unavailable);
  		}
  		if (state.subErrors) {
  			state.subErrors.forEach((value: any) => {
  				this.errors[value.field] = value.message;
  				this.form.controls[value.field].setErrors({ incorrect: true });
  			});
  		} else if (state.message) {
  			this.router.navigate([this.translate.currentLang, 'unavailable']);
  		}
  	});
  };
}
