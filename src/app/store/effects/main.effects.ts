import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  catalogueSuccess,
  getAllCatalogue,
  getListTreatmentsGroup,
  requestFailure,
  requestSuccess,
  sendMessage,
  treatmentSuccess,
  updateMyUser,
} from '../main.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { TreatmentService } from '../../services/treatment.service';
import { MainService } from '../../services/main.service';
import { UserService } from '../../services/user.service';
import { Token } from '../../interfaces/token';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { success } from '../../interfaces/common';
import { loginSuccess } from '../auth.actions';

@Injectable()
export class MainEffects {
  translate: TranslateService = inject(TranslateService);
  actions: Actions = inject(Actions);
  mainService: MainService = inject(MainService);
  catalogueService: CatalogueService = inject(CatalogueService);
  treatmentService: TreatmentService = inject(TreatmentService);
  userService: UserService = inject(UserService);

  getAllCatalogue$ = createEffect(() => this.actions.pipe(
    ofType(getAllCatalogue),
    switchMap(() =>
      this.catalogueService.getAllHome().pipe(
        switchMap((catalogues: ICatalogue[]) => of(catalogueSuccess({ catalogues }))),
        catchError((err: HttpErrorResponse) => of(requestFailure({ error: err.error }))),
      )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(getListTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getListTreatmentsGroup().pipe(
        switchMap((groups: ITreatmentGroup[]) => of(treatmentSuccess({ groups }))),
        catchError((err: HttpErrorResponse) => of(requestFailure({ error: err.error }))),
      )),
  ));

  sendMessage$ = createEffect(() => this.actions.pipe(
    ofType(sendMessage),
    switchMap(({ sendMessage }) =>
      this.mainService.sendMessage(sendMessage).pipe(
        switchMap(() => {
          const message = this.translate.instant('MAIN.CONTACT.SEND.MESSAGE');
          return success(requestSuccess, message);
        }),
        catchError((err: HttpErrorResponse) => of(requestFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateMyUser),
    switchMap(({ user, message, redirectUrl }) =>
      this.userService.updateMyUser(user).pipe(
        switchMap((response: Token) => {
          const updateMessage = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
            { displayName: response.user.displayName });
          return success(requestSuccess, message ? message : updateMessage, undefined, undefined, undefined,
            loginSuccess({
              token: response,
              queryParams: { state: btoa(JSON.stringify({ returnUrl: redirectUrl })) },
            }));
        }),
        catchError((err: HttpErrorResponse) => of(requestFailure({ error: err.error }))),
      )),
  ));

  catalogueSuccess$ = createEffect(() => this.actions.pipe(
    ofType(catalogueSuccess),
  ), { dispatch: false });

  treatmentDataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(treatmentSuccess),
  ), { dispatch: false });

  requestSuccess$ = createEffect(() => this.actions.pipe(
    ofType(requestSuccess),
  ), { dispatch: false });
}
