import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { StatementStore } from './statement.store';
import { StatementService } from '../services/statement.service';

describe('StatementStore', () => {
  let store: InstanceType<typeof StatementStore>;
  let statementServiceSpy: jasmine.SpyObj<StatementService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    statementServiceSpy = jasmine.createSpyObj<StatementService>('StatementService', ['uploadStatement']);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string, params?: Record<string, string>) => `${ key }:${ params?.['fileName'] ?? '' }`);

    TestBed.configureTestingModule({
      providers: [
        StatementStore,
        { provide: StatementService, useValue: statementServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(StatementStore);
  });

  it('should upload a statement and expose a translated success response', () => {
    const blob = new Blob(['csv'], { type: 'text/csv' });
    statementServiceSpy.uploadStatement.and.returnValue(of(void 0));

    store.upload('office-1', blob, 'statement.csv');

    expect(statementServiceSpy.uploadStatement).toHaveBeenCalledWith('office-1', blob, 'statement.csv');
    expect(translateSpy.instant).toHaveBeenCalledWith('STATEMENT.UPLOAD_SUCCESS', { fileName: 'statement.csv' });
    expect(store.response()).toEqual({
      message: 'STATEMENT.UPLOAD_SUCCESS:statement.csv',
    });
    expect(store.isLoading()).toBeFalse();
  });

  it('should map upload failures into error and subErrors state', () => {
    statementServiceSpy.uploadStatement.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: {
        message: 'STATEMENT.UPLOAD_FAILED',
        subErrors: [{ field: 'file', message: 'Invalid format' }],
      },
    })));

    store.upload('office-1', new Blob(['csv']), 'statement.csv');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      message: 'STATEMENT.UPLOAD_FAILED',
    }));
    expect(store.subErrors()).toEqual([{ field: 'file', message: 'Invalid format' }]);
    expect(store.isLoading()).toBeFalse();
  });
});
