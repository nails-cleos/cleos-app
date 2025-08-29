import { Action } from '@ngrx/store';

export enum MainActionTypes {
  getAllCatalogue = '[Main] Get all',
  getListTreatmentsGroup = '[Main] Get list treatments group',
  sendMessage = '[Main] Send message',
  updateUser = '[Main] Update user',
  catalogueSuccess = '[Main] Catalogue Success',
  treatmentSuccess = '[Main] Treatment success',
  requestSuccess = '[Main] Success',
  requestFailure = '[Main] Failure',
  clean = '[Main] Clean'
}

export class GetAllCatalogue implements Action {
  readonly type = MainActionTypes.getAllCatalogue;
}

export class GetListTreatmentsGroup implements Action {
  readonly type = MainActionTypes.getListTreatmentsGroup;
}

export class SendMessage implements Action {
  readonly type = MainActionTypes.sendMessage;

  constructor(public payload: any) {
  }
}

export class UpdateUser implements Action {
  readonly type = MainActionTypes.updateUser;

  constructor(public payload: any) {
  }
}

export class CatalogueSuccess implements Action {
  readonly type = MainActionTypes.catalogueSuccess;

  constructor(public payload: any) {
  }
}

export class TreatmentsSuccess implements Action {
  readonly type = MainActionTypes.treatmentSuccess;

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
  | GetListTreatmentsGroup
  | SendMessage
  | UpdateUser
  | TreatmentsSuccess
  | CatalogueSuccess
  | RequestSuccess
  | RequestFailure
  | Clean;
