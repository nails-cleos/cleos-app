import { inject, Injectable } from '@angular/core';
import {
  from,
  interval,
  map,
  Observable,
  of,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import type { AwsCredentialIdentityProvider } from '@smithy/types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-browser';
import { IAwsExtract, IAwsLambda } from '../interfaces/aws';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
class AwsLambdaService {
  private readonly env: EnvService = inject(EnvService);

  private readonly region = 'eu-central-1';
  private readonly bucketName = 'nailscleos-textract-bucket';
  private readonly stateMachineArn =
    'arn:aws:states:eu-central-1:257429798504:stateMachine:NailsCleosStateMachine';
  private readonly getPDFLambdaUrl =
    'https://iuwl2dpffve4t62o5hze3m7n6i0ormne.lambda-url.eu-central-1.on.aws/';

  processPdf(
    firebaseIdToken: string,
    file: File,
    userId?: string,
  ): Observable<IAwsExtract> {
    const jobId = crypto.randomUUID();

    return this.getCredentials(firebaseIdToken).pipe(
      switchMap((credentials) =>
        from(file.arrayBuffer()).pipe(
          switchMap((buffer) =>
            this.uploadPdfToS3(credentials, buffer, file, jobId),
          ),
          switchMap(() => this.startStepFunction(credentials, jobId, userId)),
          switchMap(() => timer(10000)),
          switchMap(() => this.pollResult(jobId, credentials)),
        ),
      ),
    );
  }

  private pollResult(
    jobId: string,
    credentials: AwsCredentialIdentityProvider,
    intervalMs = 5000,
    maxAttempts = 10,
  ): Observable<IAwsExtract> {
    let attempts = 0;
    return interval(intervalMs).pipe(
      switchMap(() => {
        attempts++;
        if (attempts > maxAttempts) {
          return throwError(() => new Error('Textract result not ready'));
        }

        return this.callLambda(
          credentials,
          this.getPDFLambdaUrl,
          'application/json',
          JSON.stringify({ JobId: jobId }),
        );
      }),
      filter((res) => res.status !== 202),
      map((res) => res.body as IAwsExtract),
      take(1),
    );
  }

  private getCredentials(
    firebaseIdToken: string,
  ): Observable<AwsCredentialIdentityProvider> {
    return of(
      fromCognitoIdentityPool({
        clientConfig: { region: this.region },
        identityPoolId: this.env.awsIdentityPoolId,
        logins: {
          [this.env.awsLoginsKey]: firebaseIdToken,
        },
      }),
    );
  }

  private uploadPdfToS3(
    credentials: AwsCredentialIdentityProvider,
    buffer: ArrayBuffer,
    file: File,
    jobId: string,
  ): Observable<void> {
    const s3 = new S3Client({ region: this.region, credentials });
    const key = `uploads/${jobId}.pdf`;

    return from(
      s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: new Uint8Array(buffer),
          ContentType: file.type || 'application/pdf',
        }),
      ),
    ).pipe(map(() => void 0));
  }

  private startStepFunction(
    credentials: AwsCredentialIdentityProvider,
    key: string,
    userId?: string,
  ): Observable<void> {
    const sfn = new SFNClient({ region: this.region, credentials });

    return from(
      sfn.send(
        new StartExecutionCommand({
          stateMachineArn: this.stateMachineArn,
          input: JSON.stringify({ bucket: this.bucketName, key, userId }),
        }),
      ),
    ).pipe(map(() => void 0));
  }

  private callLambda(
    credentials: AwsCredentialIdentityProvider,
    lambdaUrl: string,
    contentType: string,
    body?: any,
  ): Observable<IAwsLambda> {
    const url = new URL(lambdaUrl);

    const request = new HttpRequest({
      method: 'POST',
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        host: url.hostname,
        'content-type': contentType,
      },
      body,
    });

    const signer = new SignatureV4({
      credentials,
      region: this.region,
      service: 'lambda',
      sha256: Sha256,
    });

    return from(signer.sign(request)).pipe(
      switchMap(async (signed) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { host, ...headers } = signed.headers;
        const response = await fetch(lambdaUrl, {
          method: signed.method,
          headers,
          body: signed.body,
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        return { status: response.status, body: await response.json() };
      }),
    );
  }
}

export default AwsLambdaService;
