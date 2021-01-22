import { Action } from '@ngrx/store';

export enum ProductActionTypes {
  GET_ALL = '[Product] Get all',
  PRODUCT_SUCCESS = '[Product] Success',
  PRODUCT_SAVE = '[Product] Save',
  PRODUCT_UPDATE = '[Product] Update',
  PRODUCT_SAVE_SUCCESS = '[Product] Save Success',
  PRODUCT_FAILURE = '[Product] Failure',
  PRODUCT_SELECTED = '[Product] Selected',
  PRODUCT_FIND = '[Product] Find',
  PRODUCT_DELETE = '[Product] Delete',
  CLEAN = '[Product] Clean'
}

export class GetAll implements Action {
  readonly type = ProductActionTypes.GET_ALL;

  constructor(public payload: any) {
  }
}

export class ProductSuccess implements Action {
  readonly type = ProductActionTypes.PRODUCT_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ProductSave implements Action {
  readonly type = ProductActionTypes.PRODUCT_SAVE;

  constructor(public payload: any) {
  }
}

export class ProductUpdate implements Action {
  readonly type = ProductActionTypes.PRODUCT_UPDATE;

  constructor(public payload: any) {
  }
}

export class ProductSaveSuccess implements Action {
  readonly type = ProductActionTypes.PRODUCT_SAVE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class ProductFailure implements Action {
  readonly type = ProductActionTypes.PRODUCT_FAILURE;

  constructor(public payload: any) {
  }
}

export class ProductSelected implements Action {
  readonly type = ProductActionTypes.PRODUCT_SELECTED;

  constructor(public payload: any) {
  }
}

export class ProductFind implements Action {
  readonly type = ProductActionTypes.PRODUCT_FIND;

  constructor(public payload: any) {
  }
}

export class DeleteProduct implements Action {
  readonly type = ProductActionTypes.PRODUCT_DELETE;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ProductActionTypes.CLEAN;
}

export type All =
  | GetAll
  | ProductSave
  | ProductUpdate
  | ProductSuccess
  | ProductSaveSuccess
  | ProductFailure
  | ProductFind
  | ProductSelected
  | DeleteProduct
  | Clean;
