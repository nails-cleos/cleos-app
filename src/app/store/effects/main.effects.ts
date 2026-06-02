import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  catalogueFailure,
  catalogueSuccess,
  getAllCatalogue,
  getListTreatmentsGroup,
  requestFailure,
  requestSuccess,
  sendMessage,
  treatmentSuccess,
  updateMyUser,
} from '../actions/main.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { TreatmentService } from '../../services/treatment.service';
import { MainService } from '../../services/main.service';
import { UserService } from '../../services/user.service';
import { Token } from '../../interfaces/token';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { success } from '../../interfaces/common';
import { loginSuccess } from '../actions/auth.actions';
import { effectRequest } from '../../util/rxjs';

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
    switchMap(() => effectRequest(
      this.catalogueService.getAllHome()
        .pipe(switchMap((catalogues: ICatalogueAll[]) => of(catalogueSuccess({ catalogues })))),
      action => action,
      catalogueFailure,
    )),
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(
    ofType(getListTreatmentsGroup),
    switchMap(() => effectRequest(
      this.treatmentService.getListTreatmentsGroup()
        .pipe(switchMap((groups: ITreatmentGroup[]) => of(treatmentSuccess({ groups })))),
      action => action,
      requestFailure,
    )),
  ));

  sendMessage$ = createEffect(() => this.actions.pipe(
    ofType(sendMessage),
    switchMap(({ sendMessage }) => effectRequest(
      this.mainService.sendMessage(sendMessage).pipe(switchMap(() =>
        success(requestSuccess, 'MAIN.CONTACT.SEND.MESSAGE'))),
      action => action,
      requestFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateMyUser),
    switchMap(({ user, message, redirectUrl }) => effectRequest(
      this.userService.updateMyUser(user).pipe(switchMap((response: Token) => {
        const updateMessage = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
          { displayName: response.user.displayName });
        return success(requestSuccess, message ? message : updateMessage, undefined, undefined, undefined,
          loginSuccess({
            token: response,
            queryParams: { state: btoa(JSON.stringify({ returnUrl: redirectUrl })) },
          }));
      })),
      action => action,
      requestFailure,
    )),
  ));
}
