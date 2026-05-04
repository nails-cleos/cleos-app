import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { IRoomAll, IService } from '../interfaces/room';
import { IUserAll } from '../interfaces/user';
import { IOfficeAll } from '../interfaces/office';
import { IGroupService } from '../interfaces/treatment';
import { IPaymentOption } from '../interfaces/payment';

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

export type ReservationFormField =
  keyof CustomerForm |
  keyof OfficeForm |
  Exclude<keyof TreatmentForm, 'dateTimeList'> |
  keyof ConfigurationForm;

export type ReservationErrors = Partial<Record<ReservationFormField, string>> & {
  schedule: boolean[];
  dateTimeList?: string[];
  events?: string[];
  overlapping: boolean;
};

export const createReservationErrors = (): ReservationErrors => ({
  schedule: [],
  dateTimeList: [],
  events: [],
  overlapping: false,
});
