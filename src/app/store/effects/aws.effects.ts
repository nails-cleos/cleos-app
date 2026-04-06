import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import { awsLambdaFailure, awsLambdaSuccess, callAwsLambda } from '../aws.actions';
import { AwsLambdaService } from '../../services/aws-lambda.service';
import { IAwsExtract } from '../../interfaces/aws';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class AwsEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly awsLambdaService: AwsLambdaService = inject(AwsLambdaService);

  callLambda$ = createEffect(() => this.actions.pipe(
    ofType(callAwsLambda),
    switchMap(({ token, file, userId }) => effectRequest(
      this.awsLambdaService.processPdf(token, file, userId).pipe(map((data: IAwsExtract) =>
        awsLambdaSuccess({ data }))),
      action => action,
      awsLambdaFailure,
    )),
  ));
}
