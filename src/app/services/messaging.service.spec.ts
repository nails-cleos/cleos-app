import { TestBed } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import { Messaging } from '@angular/fire/messaging';
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { AppCheck } from '@angular/fire/app-check';

describe('MessagingService', () => {
  let service: MessagingService;
  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let messagingSpy: jasmine.SpyObj<Messaging>;
  let authSpy: jasmine.SpyObj<Auth>;
  let databaseSpy: jasmine.SpyObj<Database>;
  let appCheckSpy: jasmine.SpyObj<AppCheck>;


  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    messagingSpy = jasmine.createSpyObj('Messaging', ['get']);
    authSpy = jasmine.createSpyObj('Auth', ['currentUser']);
    databaseSpy = jasmine.createSpyObj('Database', ['get']);
    appCheckSpy = jasmine.createSpyObj('AppCheck', ['get']);
    TestBed.configureTestingModule({
      providers: [
        MessagingService,
        { provide: Store, useValue: storeSpy },
        { provide: Messaging, useValue: messagingSpy },
        { provide: Auth, useValue: authSpy },
        { provide: Database, useValue: databaseSpy },
        { provide: AppCheck, useValue: appCheckSpy },
      ],
    });
    service = TestBed.inject(MessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
