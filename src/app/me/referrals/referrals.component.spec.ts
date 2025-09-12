import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralsComponent } from './referrals.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Analytics } from '@angular/fire/analytics';
import { AuthUserService } from '../../services/auth-user.service';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAnalytics = {
    app: {
      options: {},
    },
  } as Analytics;

  const mockAuthUserService = {
    authUser: of({
      userId: 'test-user-id',
      referralMax: 5,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: Analytics, useValue: mockAnalytics },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
