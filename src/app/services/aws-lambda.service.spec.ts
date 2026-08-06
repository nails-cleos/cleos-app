import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import AwsLambdaService from './aws-lambda.service';
import { firstValueFrom, of } from 'rxjs';
import { IAwsExtract, IAwsLambda, IAwsNotification } from '../interfaces/aws';

describe('AwsLambdaService', () => {
  let service: AwsLambdaService;

  const mockCredentials: any = {
    accessKeyId: 'AKIA_TEST',
    secretAccessKey: 'SECRET',
    sessionToken: 'TOKEN',
  };

  const mockFile = new File(
    [new Uint8Array([1, 2, 3])],
    'test.pdf',
    { type: 'application/pdf' },
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwsLambdaService],
    });

    service = TestBed.inject(AwsLambdaService);

    spyOn(crypto, 'randomUUID').and.returnValue('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should process pdf successfully', fakeAsync(() => {
    spyOn(mockFile, 'arrayBuffer')
      .and.returnValue(Promise.resolve(new ArrayBuffer(8)));
    spyOn<any>(service, 'getCredentials').and.returnValue(of(mockCredentials));
    spyOn<any>(service, 'uploadPdfToS3').and.returnValue(of(void 0));
    spyOn<any>(service, 'startStepFunction').and.returnValue(of(void 0));
    spyOn<any>(service, 'pollResult').and.returnValue(of({ VENDOR_NAME: 'VENDOR_NAME' }));

    let result!: IAwsExtract;

    service.processPdf('firebase-token', mockFile, 'user-1')
      .subscribe(res => result = res);

    flushMicrotasks();   // resolves file.arrayBuffer()
    tick(10000);         // 🔑 resolves timer(10000)

    expect(result.VENDOR_NAME).toBe('VENDOR_NAME');
  }));

  it('should poll until lambda returns non-202', fakeAsync(() => {
    const lambda202: IAwsLambda = { status: 202 } as IAwsLambda;
    const lambda200: IAwsLambda = {
      status: 200,
      body: { text: 'done' },
    } as IAwsLambda;

    spyOn<any>(service, 'callLambda').and.returnValues(
      of(lambda202),
      of(lambda200),
    );

    let result!: IAwsExtract;

    service['pollResult']('job-1', mockCredentials, 1000, 5)
      .subscribe(res => result = res);

    tick(1000);
    tick(1000);

    expect((result as any).text).toBe('done');
    expect(service['callLambda']).toHaveBeenCalledTimes(2);
  }));

  it('should throw error when polling exceeds max attempts', fakeAsync(() => {
    spyOn<any>(service, 'callLambda')
      .and.returnValue(of({ status: 202 } as IAwsLambda));

    let error!: Error;

    service['pollResult']('job-1', mockCredentials, 1000, 2)
      .subscribe({
        error: err => error = err,
      });

    tick(3000); // 3 attempts

    expect(error).toBeTruthy();
    expect(error.message).toContain('Textract result not ready');
  }));

  it('should call lambda and return response', fakeAsync(async () => {
    spyOn(window, 'fetch').and.resolveTo({
      ok: true,
      status: 200,
      json: async () => ({ JobId: 'bar' }),
    } as any);

    const res = await firstValueFrom(service['callLambda'](
      mockCredentials,
      'https://example.com',
      'application/json',
      '{}',
    ));

    expect(res?.status).toBe(200);
    expect((res?.body as IAwsNotification)?.JobId).toBe('bar');
    expect(fetch).toHaveBeenCalled();
  }));

  it('should throw error when lambda response is not ok', fakeAsync(async () => {
    spyOn(window, 'fetch').and.resolveTo({
      ok: false,
      status: 500,
      text: async () => 'lambda error',
    } as any);

    let error!: Error;

    try {
      await firstValueFrom(service['callLambda'](
        mockCredentials,
        'https://example.com',
        'application/json',
        '{}',
      ));
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeTruthy();
    expect(error.message).toContain('lambda error');
  }));
});
