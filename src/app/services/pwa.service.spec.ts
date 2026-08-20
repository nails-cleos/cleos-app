import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { PwaService } from './pwa.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Platform } from '@angular/cdk/platform';
import { CookieService } from 'ngx-cookie-service';
import {
  SwUpdate,
  UnrecoverableStateEvent,
  VersionEvent,
} from '@angular/service-worker';
import { of } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let bottomSheetSpy: Pick<MatBottomSheet, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };
  let platformSpy: Pick<Platform, 'ANDROID' | 'IOS'>;
  let cookieServiceSpy: Pick<CookieService, 'get'> & {
    get: ReturnType<typeof vi.fn>;
  };
  let swUpdateSpy: Pick<
    SwUpdate,
    | 'isEnabled'
    | 'versionUpdates'
    | 'checkForUpdate'
    | 'activateUpdate'
    | 'unrecoverable'
  > & {
    checkForUpdate: ReturnType<typeof vi.fn>;
    activateUpdate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    bottomSheetSpy = {
      open: vi.fn().mockName('MatBottomSheet.open'),
    };
    platformSpy = {
      ANDROID: false,
      IOS: false,
    };
    cookieServiceSpy = {
      get: vi.fn().mockName('CookieService.get'),
    };
    swUpdateSpy = {
      checkForUpdate: vi.fn().mockName('SwUpdate.checkForUpdate'),
      activateUpdate: vi.fn().mockName('SwUpdate.activateUpdate'),
      versionUpdates: of({ type: 'VERSION_DETECTED' } as VersionEvent),
      unrecoverable: of({ reason: 'TEST' } as UnrecoverableStateEvent),
      isEnabled: true,
    };

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: SwUpdate, useValue: swUpdateSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(PwaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
