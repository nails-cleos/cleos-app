import { TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('NavigationService', () => {
  let service: NavigationService;
  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'url', 'getCurrentNavigation', 'events', 'navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        NavigationService,
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
