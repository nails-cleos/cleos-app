import { FormControl } from '@angular/forms';
import { IDiscount, IUserDiscount } from './discount';
import { IService } from './room';
import { IColorAll } from './color';
import { PENALTY } from './payment';
import { areEquals } from '../util/helper';
import { fieldChange } from '../util/validators';

export type TreatmentForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  priceFrom: FormControl<string | undefined>;
  color: FormControl<IColorAll | undefined>;
};

export interface ITreatmentGroup {
  id?: string;
  name?: string;
  description?: string;
  priceFrom?: string;
  colors?: string[];
  colorIds?: string[];
  treatments?: ITreatment[];
  order?: number;
  image?: any;
}

export interface ITreatmentGroupAll {
  id: string;
  name: string;
  description?: string;
  priceFrom?: string;
  order?: number;
  colors?: IColorAll[];
  treatments?: ITreatmentAll[];
}

export interface ITreatment {
  id?: string;
  name?: string;
  price?: number;
  deleted?: boolean;
  description?: string;
  time?: string;
  duration?: string;
  durationDate?: Date;
  modifiedAt?: string;
  rating?: number;
  primary: boolean;
  errors?: any;
  history?: ITreatmentAll[];
  showHistory?: boolean;
  order?: number;
}

export interface IGroupService {
  id: string;
  name: string;
  colors?: IColorAll[];
  treatments: IService[];
  selectedTreatments: IService[];
}

export interface ITreatmentAll extends IService {
  discountCustomer?: IDiscount;
  primary?: boolean;
  createdAt?: string;
  treatmentId?: string;
  group: ITreatmentGroupAll;
  color?: IColorAll;
  history?: ITreatmentAll[];
  showHistory?: boolean;
}

export interface ITreatmentDiscountDTO {
  treatments: ITreatmentAll[];
  discounts: IUserDiscount[];
}

export interface IPrice {
  amount: number;
  discount: number;
  extra: number;
  additional: number;
  total: number;
  totalPaid: number;
  totalWithoutDiscount: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  priceWithAdditional: number;
  isPaid: boolean;
  percentageToPaid: number;
  toPaid: number;
  penalty: number;
  balance: number;

  setPenalty(penaltyToPay: number): void;

  withTotalPaid(totalPaid: number): IPrice;

  withBalance(balance?: number): IPrice;
}

export class Price implements IPrice {
  amount: number;
  discount: number;
  extra: number;
  additional: number;
  total: number;
  totalPaid: number;
  totalWithoutDiscount: number;
  priceWithDiscount: number;
  priceWithExtras: number;
  priceWithAdditional: number;
  isPaid: boolean;
  percentageToPaid: number;
  toPaid: number;
  penalty: number;
  balance: number;

  constructor(
    price = 0,
    discount = 0,
    extra = 0,
    additional = 0,
    total = 0,
    totalPaid = 0,
    totalWithoutDiscount = 0,
    priceWithDiscount = 0,
    priceWithExtras = 0,
    priceWithAdditional = 0,
    percentageToPaid = 100,
    balance = 0,
    penalty?: number) {
    this.amount = price;
    this.discount = discount;
    this.extra = extra;
    this.additional = additional;
    this.total = total;
    this.totalPaid = totalPaid;
    this.totalWithoutDiscount = totalWithoutDiscount;
    this.priceWithDiscount = priceWithDiscount;
    this.priceWithExtras = priceWithExtras;
    this.priceWithAdditional = priceWithAdditional;
    this.percentageToPaid = percentageToPaid;
    this.balance = balance;
    this.toPaid = this.calculateToPaid(); // Total to pay
    this.penalty = penalty ? penalty : this.calculatePenalty();
    this.isPaid = this.calculateIsPaid();
  }

  withTotalPaid = (totalPaid: number = 0): IPrice => {
    return this.clone({ totalPaid });
  };

  withBalance = (balance: number = 0): IPrice => {
    return this.clone({ balance });
  };

  setPenalty = (penalty: number): void => {
    this.penalty = penalty;
  };

  private clone = ({ totalPaid = this.totalPaid, balance = this.balance }: {
    totalPaid?: number;
    balance?: number;
  }): IPrice => new Price(
    this.amount,
    this.discount,
    this.extra,
    this.additional,
    this.total,
    totalPaid,
    this.totalWithoutDiscount,
    this.priceWithDiscount,
    this.priceWithExtras,
    this.priceWithAdditional,
    this.percentageToPaid,
    balance,
    this.penalty,
  );

  private calculateIsPaid = (): boolean => this.amount > 0 && this.totalPaid + this.balance >= this.total;

  private calculateToPaid = (): number => (this.total * this.percentageToPaid / 100) - this.totalPaid - this.balance;

  private calculatePenalty = (): number => (this.total * PENALTY / 100);
}

export class Treatment implements ITreatment {
  name: string;
  primary: boolean;
  description: string;
  errors: any;

  constructor(name: string, primary: boolean = false) {
    this.name = name;
    this.primary = primary;
    this.description = '';
    this.errors = {};
  }
}

export class TreatmentGroup implements ITreatmentGroup {
  name?: string;
  description?: string;
  priceFrom?: string;
  colorIds?: string[];
  treatments?: ITreatment[];

  private constructor(treatmentForm: TreatmentForm) {
    this.name = treatmentForm.name.value;
    this.description = treatmentForm.description.value;
    this.priceFrom = treatmentForm.priceFrom.value;
  }

  static fromForm(
    treatmentForm: TreatmentForm,
    currentGroup?: ITreatmentGroupAll,
    treatments: ITreatment[] = [],
    newColorIds: string[] = [],
    currentColorIds: string[] = [],
  ): ITreatmentGroup {
    const treatmentGroup = new TreatmentGroup(treatmentForm);
    treatmentGroup.name = fieldChange(treatmentForm.name, currentGroup?.name);
    treatmentGroup.description = fieldChange(treatmentForm.description, currentGroup?.description);
    treatmentGroup.priceFrom = fieldChange(treatmentForm.priceFrom, currentGroup?.priceFrom);
    treatmentGroup.treatments = treatments;

    if (!areEquals(newColorIds, currentColorIds)) {
      treatmentGroup.colorIds = newColorIds;
    }

    return treatmentGroup;
  }
}

export class GroupService implements IGroupService {
  id: string;
  name: string;
  colors?: IColorAll[];
  treatments: IService[];
  selectedTreatments: IService[];

  constructor(id: string, name: string, colors?: IColorAll[]) {
    this.id = id;
    this.name = name;
    this.colors = colors;
    this.treatments = [];
    this.selectedTreatments = [];
  }
}
