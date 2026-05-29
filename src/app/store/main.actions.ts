import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess } from '../interfaces/common';
import { ICatalogueAll } from '../interfaces/catalogue';
import { ITreatmentGroup } from '../interfaces/treatment';
import { ISendMessage } from '../../main';
import { IUser } from '../interfaces/user';

enum MainActionTypes {
  getAllCatalogue = '[Main] Get all',
  getListTreatmentsGroup = '[Main] Get list treatments group',
  sendMessage = '[Main] Send message',
  updateMyUser = '[Main] Update user',
  catalogueSuccess = '[Main] Catalogue Success',
  catalogueFailure = '[Main] Catalogue Failure',
  treatmentSuccess = '[Main] Treatment success',
  requestSuccess = '[Main] Success',
  requestFailure = '[Main] Failure',
  setCurrentLang = '[Main] Set current lang',
  clean = '[Main] Clean'
}

export const getAllCatalogue = createAction(MainActionTypes.getAllCatalogue);

export const getListTreatmentsGroup = createAction(MainActionTypes.getListTreatmentsGroup);

export const sendMessage = createAction(
  MainActionTypes.sendMessage,
  props<{ sendMessage: ISendMessage }>(),
);

export const updateMyUser = createAction(
  MainActionTypes.updateMyUser,
  props<{ user: IUser; redirectUrl: string; message: string }>(),
);

export const catalogueSuccess = createAction(
  MainActionTypes.catalogueSuccess,
  props<{ catalogues: ICatalogueAll[] }>(),
);

export const catalogueFailure = createAction(MainActionTypes.catalogueFailure);

export const treatmentSuccess = createAction(
  MainActionTypes.treatmentSuccess,
  props<{ groups: ITreatmentGroup[] }>(),
);

export const requestSuccess = createAction(
  MainActionTypes.requestSuccess,
  props<IResponseSuccess>(),
);

export const requestFailure = createAction(
  MainActionTypes.requestFailure,
  props<{ error: IError }>(),
);

export const setCurrentLang = createAction(
  MainActionTypes.setCurrentLang,
  props<{ lang: string }>(),
);

export const cleanMain = createAction(MainActionTypes.clean);
