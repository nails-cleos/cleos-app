import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionComponent } from './transaction.component';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { AuthUserService } from '../../services/auth-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('test-customer-id'),
      },
    },
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    getCurrentNavigation: () => ({ extras: { state: { step: '1' } } }),
  };

  const mockAuthUserService = {
    authUser: of({
      hasAdminRole: false,
      customerId: 'test-user-id',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionComponent, TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
