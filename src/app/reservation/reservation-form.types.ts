import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { IRoomAll, IService } from '../room/room';
import { IUserAll } from '../user/user';
import { IOfficeAll } from '../office/office';
import { IGroupService } from '../treatment/treatment';
import { IPaymentOption } from '../interfaces/payment';
import { BankForm } from '../shared/bank/bank.component';

export type CustomerForm = {
  customer: FormControl<IUserAll | undefined>;
};

export type OfficeForm = {
  room: FormControl<IRoomAll | undefined>;
  professional: FormControl<IUserAll | undefined>;
  office: FormControl<IOfficeAll | undefined>;
};

export type DateTimeForm = {
  date: FormControl<Date | undefined>;
  start: FormControl<string | undefined>;
};

export type TreatmentForm = {
  treatment: FormControl<IService | undefined>;
  discount: FormControl<string | undefined>;
  group: FormControl<IGroupService | undefined>;
  dateTimeList: FormArray<FormGroup<DateTimeForm>>;
};

export type ConfigurationForm = {
  customerChange: FormControl<boolean>;
  reference: FormControl<string | undefined>;
  note: FormControl<string | undefined>;
  option: FormControl<IPaymentOption | undefined>;
  amount: FormControl<number | undefined>;
  transfer: FormControl<string | undefined>;
};

export type EventForm = {
  event: FormControl<CalendarEvent | undefined>;
};

export type EventGroupForm = {
  events: FormArray<FormGroup<EventForm>>;
};

export type ReservationForms = {
  customerForm: FormGroup<CustomerForm>;
  officeForm: FormGroup<OfficeForm>;
  treatmentForm: FormGroup<TreatmentForm>;
  configurationForm: FormGroup<ConfigurationForm>;
  eventGroup: FormGroup<EventGroupForm>;
};

export type MeReservationTreatmentForm = {
  treatment: FormControl<IService | undefined>;
  discount: FormControl<string | undefined>;
  startDate: FormControl<Date | undefined>;
  group: FormControl<IGroupService | undefined>;
};

export type MeReservationEventForm = {
  event: FormControl<Date | undefined>;
};

export type MeReservationAcceptForm = {
  accept: FormControl<boolean>;
  phone: FormControl<string | undefined>;
};

export type MeReservationForms = {
  officeForm: FormGroup<OfficeForm>;
  treatmentForm: FormGroup<MeReservationTreatmentForm>;
  eventGroup: FormGroup<MeReservationEventForm>;
  typeForm: FormGroup<BankForm>;
  acceptForm: FormGroup<MeReservationAcceptForm>;
};

export type ReservationFormField =
  | keyof CustomerForm
  | keyof OfficeForm
  | Exclude<keyof TreatmentForm, 'dateTimeList'>
  | keyof ConfigurationForm;

export type ReservationErrors = Partial<
  Record<ReservationFormField, string>
> & {
  schedule: boolean[];
  dateTimeList?: string[];
  events?: string[];
  overlapping: boolean;
};

export type MeReservationFormField =
  | keyof OfficeForm
  | keyof MeReservationTreatmentForm
  | keyof MeReservationEventForm
  | keyof BankForm
  | keyof MeReservationAcceptForm;

export type MeReservationErrors = Partial<
  Record<MeReservationFormField, string>
> & {
  schedule?: boolean;
};

export const createReservationErrors = (): ReservationErrors => ({
  schedule: [],
  dateTimeList: [],
  events: [],
  overlapping: false,
});

export const createMeReservationErrors = (): MeReservationErrors => ({});
