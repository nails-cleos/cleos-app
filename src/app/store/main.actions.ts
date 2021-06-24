import { Action } from '@ngrx/store';

export enum MainActionTypes {
  getAllCatalogue = '[Main] Get all',
  getAllProducts = '[Main] Get all products',
  sendMessage =  '[Main] Send message',
  catalogueSuccess = '[Main] Catalogue Success',
  productSuccess = '[Main] Product success',
  requestSuccess = '[Main] Success',
  requestFailure = '[Main] Failure',
  clean = '[Main] Clean'
}

export class GetAllCatalogue implements Action {
  readonly type = MainActionTypes.getAllCatalogue;
}

export class GetAllProducts implements Action {
  readonly type = MainActionTypes.getAllProducts;
}

export class SendMessage implements Action {
  readonly type = MainActionTypes.sendMessage;

  constructor(public payload: any) {
  }
}

export class CatalogueSuccess implements Action {
  readonly type = MainActionTypes.catalogueSuccess;

  constructor(public payload: any) {
  }
}

export class ProductsSuccess implements Action {
  readonly type = MainActionTypes.productSuccess;

  constructor(public payload: any) {
  }
}

export class RequestSuccess implements Action {
  readonly type = MainActionTypes.requestSuccess;

  constructor(public payload: any) {
  }
}

export class RequestFailure implements Action {
  readonly type = MainActionTypes.requestFailure;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = MainActionTypes.clean;
}

export type All =
  | GetAllCatalogue
  | GetAllProducts
  | SendMessage
  | ProductsSuccess
  | CatalogueSuccess
  | RequestSuccess
  | RequestFailure
  | Clean;
