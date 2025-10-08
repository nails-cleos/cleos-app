import { TestBed } from '@angular/core/testing';

import { PwaService } from './pwa.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Platform } from '@angular/cdk/platform';
import { CookieService } from 'ngx-cookie-service';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let swUpdateSpy: jasmine.SpyObj<SwUpdate>;

  beforeEach(() => {
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    platformSpy = jasmine.createSpyObj('Platform', ['ANDROID', 'IOS']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    swUpdateSpy =
      jasmine.createSpyObj('SwUpdate', ['isEnabled', 'versionUpdates', 'checkForUpdate', 'activateUpdate'], {
        versionUpdates: of({ type: 'VERSION_DETECTED' }),
        unrecoverable: of({ reason: 'TEST' }),
        isEnabled: true,
      });

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: SwUpdate, useValue: swUpdateSpy },
      ],
    });
    service = TestBed.inject(PwaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
