import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectComponent } from './redirect.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TokenService } from '../../services/token.service';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';

describe('RedirectComponent', () => {
  let component: RedirectComponent;
  let fixture: ComponentFixture<RedirectComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockTokenService = {
    token: jasmine.createSpy('token'),
    user: jasmine.createSpy('user'),
  };

  const mockNavigationService = {
    reload: jasmine.createSpy('reload'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: TokenService, useValue: mockTokenService },
        { provide: NavigationService, useValue: mockNavigationService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
