import { IDiscount, IUserDiscount } from './discount';
import { IAdditionalAll } from './additional';
import { IService } from './room';

export const PENALTY = 30;

export interface ITreatmentGroup {
  id?: string;
  name?: string;
  description?: string;
  durability?: string;
  durabilityMin?: number;
  durabilityMax?: number;
  treatments?: ITreatment[];
  order?: number;
}

export interface ITreatmentGroupAll {
  id: string;
  name: string;
  description?: string;
  durability?: string;
  durabilityMin?: number;
  durabilityMax?: number;
  order?: number;
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
}

export interface IGroupService {
  id: string;
  name: string;
  treatments: IService[];
  selectedTreatments: IService[];
}

export interface ITreatmentAll extends IService {
  duration: string;
  description?: string;
  discount?: IDiscount;
  extras?: IExtras;
  primary?: boolean;
  createdAt?: string;
  treatmentId?: string;
  group: ITreatmentGroupAll;
}

export interface ITreatmentDiscountDTO {
  treatments: ITreatmentAll[];
  discounts: IUserDiscount[];
  additionalList: IAdditionalAll[];
}

export interface IExtras {
  description?: string;
  price?: number;
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

  setPenalty(penaltyToPay: number): void;
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

  constructor(price: number = 0, discount: number = 0, extra: number = 0, additional: number = 0, total: number = 0,
              totalPaid: number = 0, totalWithoutDiscount: number = 0, priceWithDiscount: number = 0, priceWithExtras = 0,
              priceWithAdditional = 0, percentageToPaid: number = 0) {
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
    this.toPaid = total * percentageToPaid / 100;
    this.isPaid = this.amount > 0 && this.totalPaid >= this.total;
    this.penalty = (total * PENALTY / 100);
  }

  setPenalty(penalty: number): void {
    this.penalty = penalty;
  }
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
  constructor() {
  }
}

export class GroupService implements IGroupService {
  id: string;
  name: string;
  treatments: IService[];
  selectedTreatments: IService[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.treatments = [];
    this.selectedTreatments = [];
  }
}
