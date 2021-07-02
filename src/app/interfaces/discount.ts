import { animate, style, transition, trigger } from '@angular/animations';
import { IUser, IUserAll } from './user';

export enum DiscountType {
  money = 'MONEY',
  percentage = 'PERCENTAGE'
}

export interface IDiscount {
  id?: string;
  name?: string;
  description?: string;
  amount?: number;
  type?: string;
  deleted?: boolean;
}

export interface IDiscountAll {
  id: string;
  name: string;
  amount: number;
  type: DiscountType;
  description?: string;
}

export interface IUserDiscount {
  id: string;
  discount: IDiscountAll;
  used: boolean;
  title?: string;
  symbol?: string;
}

export interface IReferral {
  id: string;
  referenced: IUserAll;
  customer: IUserAll;
  used: boolean;
}

export class Discount implements IDiscount {
  constructor() {
  }
}

export const transitionAnimation = trigger(
  'discountAnimation',
  [
    transition(
      ':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('2s', style({transform: 'translateX(0)', opacity: 1}))
      ]
    ),
    transition(
      ':leave', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('1s', style({transform: 'translateX(100%)', opacity: 0}))
      ]
    )]
);
