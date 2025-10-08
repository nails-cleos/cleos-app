import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashComponent } from './dash.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AuthUserService } from '../services/auth-user.service';

describe('DashComponent', () => {
  let component: DashComponent;
  let fixture: ComponentFixture<DashComponent>;
  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAuthUserService = {
    authUser: of({
      isDarkMode: true,
      isAdmin: true,
      isManager: true,
    }),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DashComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
