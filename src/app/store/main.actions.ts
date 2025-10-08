import { Action } from '@ngrx/store';
import { IError, ResponseSuccess } from '../interfaces/common';
import { ICatalogue } from '../interfaces/catalogue';
import { ITreatmentGroup } from '../interfaces/treatment';
import { ISendMessage } from '../../main';
import { IUser } from '../interfaces/user';

export enum MainActionTypes {
  getAllCatalogue = '[Main] Get all',
  getListTreatmentsGroup = '[Main] Get list treatments group',
  sendMessage = '[Main] Send message',
  updateMyUser = '[Main] Update user',
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

  constructor(public sendMessage: ISendMessage) {
  }
}

export class UpdateMyUser implements Action {
  readonly type = MainActionTypes.updateMyUser;

  constructor(public user: IUser, public redirectUrl: string, public message: string) {
  }
}

export class CatalogueSuccess implements Action {
  readonly type = MainActionTypes.catalogueSuccess;

  constructor(public catalogues: ICatalogue[]) {
  }
}

export class TreatmentsSuccess implements Action {
  readonly type = MainActionTypes.treatmentSuccess;

  constructor(public groups: ITreatmentGroup[]) {
  }
}

export class RequestSuccess extends ResponseSuccess implements Action {
  readonly type = MainActionTypes.requestSuccess;
}

export class RequestFailure implements Action {
  readonly type = MainActionTypes.requestFailure;

  constructor(public error: IError) {
  }
}

export class Clean implements Action {
  readonly type = MainActionTypes.clean;
}

export type All =
  | GetAllCatalogue
  | GetListTreatmentsGroup
  | SendMessage
  | UpdateMyUser
  | TreatmentsSuccess
  | CatalogueSuccess
  | RequestSuccess
  | RequestFailure
  | Clean;
