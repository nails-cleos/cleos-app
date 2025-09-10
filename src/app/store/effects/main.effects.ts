import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  CatalogueSuccess,
  MainActionTypes,
  RequestFailure,
  RequestSuccess,
  SendMessage,
  TreatmentsSuccess,
  UpdateMyUser,
} from '../main.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { TreatmentService } from '../../services/treatment.service';
import { MainService } from '../../services/main.service';
import { LoginSuccess } from '../auth.actions';
import { UserService } from '../../services/user.service';
import { Token } from '../../interfaces/token';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { success } from '../../interfaces/common';

@Injectable()
export class MainEffects {

  getAllCatalogue$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.getAllCatalogue),
    switchMap(() =>
      this.catalogueService.getAllHome().pipe(
        switchMap((response: ICatalogue[]) => of(new CatalogueSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new RequestFailure(err.error))),
      )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.getListTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getListTreatmentsGroup().pipe(
        switchMap((response: ITreatmentGroup[]) => of(new TreatmentsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new RequestFailure(err.error))),
      )),
  ));

  sendMessage$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.sendMessage),
    switchMap((action: SendMessage) =>
      this.mainService.sendMessage(action.sendMessage).pipe(
        switchMap(() => {
          const message = this.translate.instant('MAIN.CONTACT.SEND.MESSAGE');
          return success(RequestSuccess, message);
        }),
        catchError((err: HttpErrorResponse) => of(new RequestFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.updateMyUser),
    switchMap((action: UpdateMyUser) =>
      this.userService.updateMyUser(action.user).pipe(
        switchMap((response: Token) => {
          const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
            { displayName: response.user.displayName });
          return success(RequestSuccess, action.message ? action.message : message, undefined, undefined, undefined,
            new LoginSuccess(response, { state: btoa(JSON.stringify({ returnUrl: action.redirectUrl })) }));
        }),
        catchError((err: HttpErrorResponse) => of(new RequestFailure(err.error))),
      )),
  ));

  catalogueSuccess$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.catalogueSuccess),
  ), { dispatch: false });

  treatmentDataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.treatmentSuccess),
  ), { dispatch: false });

  requestSuccess$ = createEffect(() => this.actions.pipe(
    ofType(MainActionTypes.requestSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private mainService: MainService,
              private catalogueService: CatalogueService, private treatmentService: TreatmentService,
              private userService: UserService) {
  }
}
