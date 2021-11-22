import { Action } from '@ngrx/store';

export enum ProductActionTypes {
  getAll = '[Product] Get all',
  productSuccess = '[Product] Success',
  productSave = '[Product] Save',
  productUpdate = '[Product] Update',
  productSaveSuccess = '[Product] Save Success',
  productFailure = '[Product] Failure',
  productSelected = '[Product] Selected',
  productFind = '[Product] Find',
  productDelete = '[Product] Delete',
  productHistory = '[Product] history',
  productHistorySuccess = '[Product] history success',
  clean = '[Product] Clean'
}

export class GetAll implements Action {
  readonly type = ProductActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class ProductSuccess implements Action {
  readonly type = ProductActionTypes.productSuccess;

  constructor(public payload: any) {
  }
}

export class ProductSave implements Action {
  readonly type = ProductActionTypes.productSave;

  constructor(public payload: any) {
  }
}

export class ProductUpdate implements Action {
  readonly type = ProductActionTypes.productUpdate;

  constructor(public payload: any) {
  }
}

export class ProductSaveSuccess implements Action {
  readonly type = ProductActionTypes.productSaveSuccess;

  constructor(public payload: any) {
  }
}

export class ProductFailure implements Action {
  readonly type = ProductActionTypes.productFailure;

  constructor(public payload: any) {
  }
}

export class ProductSelected implements Action {
  readonly type = ProductActionTypes.productSelected;

  constructor(public payload: any) {
  }
}

export class ProductFind implements Action {
  readonly type = ProductActionTypes.productFind;

  constructor(public payload: any) {
  }
}

export class DeleteProduct implements Action {
  readonly type = ProductActionTypes.productDelete;

  constructor(public payload: any) {
  }
}

export class ProductHistory implements Action {
  readonly type = ProductActionTypes.productHistory;

  constructor(public payload: any) {
  }
}

export class ProductHistorySuccess implements Action {
  readonly type = ProductActionTypes.productHistorySuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = ProductActionTypes.clean;
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
  | ProductHistory
  | ProductHistorySuccess
  | Clean;
