import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { awsLambdaFailure, awsLambdaSuccess, callAwsLambda } from '../aws.actions';
import { AwsLambdaService } from '../../services/aws-lambda.service';
import { IAwsExtract } from '../../interfaces/aws';

@Injectable()
export class AwsEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly awsLambdaService: AwsLambdaService = inject(AwsLambdaService);

  callLambda$ = createEffect(() => this.actions.pipe(
    ofType(callAwsLambda),
    switchMap(({ token, file, userId }) =>
      this.awsLambdaService.processPdf(token, file, userId).pipe(
        map((data: IAwsExtract) => awsLambdaSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(awsLambdaFailure({ error: err.error }))),
      )),
  ));

  awsLambdaSuccess$ = createEffect(() => this.actions.pipe(
    ofType(awsLambdaSuccess),
  ), { dispatch: false });
}
