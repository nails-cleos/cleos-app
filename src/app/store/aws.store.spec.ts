import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AwsStore } from './aws.store';
import AwsLambdaService from '../services/aws-lambda.service';

describe('AwsStore', () => {
  let store: InstanceType<typeof AwsStore>;
  let awsLambdaServiceSpy: {
    processPdf: Mock;
  };

  beforeEach(() => {
    awsLambdaServiceSpy = {
      processPdf: vi.fn().mockName('AwsLambdaService.processPdf'),
    };

    TestBed.configureTestingModule({
      providers: [
        AwsStore,
        {
          provide: AwsLambdaService,
          useValue: awsLambdaServiceSpy,
        },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(AwsStore);
  });

  it('should process pdf successfully and expose data', () => {
    const extracted = {
      invoiceNumber: 'INV-001',
      amount: 100,
    } as any;

    const file = new File(['content'], 'invoice.pdf', {
      type: 'application/pdf',
    });

    awsLambdaServiceSpy.processPdf.mockReturnValue(of(extracted));

    store.processPdf('token', file, 'user-1');

    expect(awsLambdaServiceSpy.processPdf).toHaveBeenCalledWith(
      'token',
      file,
      'user-1',
    );

    expect(store.data()).toEqual(extracted);
    expect(store.error()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should process pdf without user id', () => {
    const file = new File(['content'], 'invoice.pdf');

    awsLambdaServiceSpy.processPdf.mockReturnValue(of({} as any));

    store.processPdf('token', file);

    expect(awsLambdaServiceSpy.processPdf).toHaveBeenCalledWith(
      'token',
      file,
      undefined,
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should map service errors into error state', () => {
    const file = new File(['content'], 'invoice.pdf');

    awsLambdaServiceSpy.processPdf.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              message: 'INVALID_PDF',
            },
          }),
      ),
    );

    store.processPdf('token', file);

    expect(store.data()).toBeUndefined();

    expect(store.error()).toEqual(
      expect.objectContaining({
        message: 'INVALID_PDF',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should clear error', () => {
    const file = new File(['content'], 'invoice.pdf');

    awsLambdaServiceSpy.processPdf.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
          }),
      ),
    );

    store.processPdf('token', file);

    expect(store.error()).toBeDefined();

    store.clearError();

    expect(store.error()).toBeUndefined();
  });

  it('should clean store state', () => {
    const file = new File(['content'], 'invoice.pdf');

    awsLambdaServiceSpy.processPdf.mockReturnValue(
      of({
        invoiceNumber: '123',
      } as any),
    );

    store.processPdf('token', file);

    expect(store.data()).toBeDefined();

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('should cancel previous pdf processing subscription', () => {
    const file = new File(['content'], 'invoice.pdf');

    const subscriptionSpy = {
      unsubscribe: vi.fn().mockName('Subscription.unsubscribe'),
    };

    awsLambdaServiceSpy.processPdf.mockReturnValue({
      subscribe: () => subscriptionSpy,
    } as any);

    store.processPdf('token', file);
    store.processPdf('token2', file);

    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
