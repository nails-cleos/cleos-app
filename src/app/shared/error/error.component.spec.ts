import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';
import { IError } from '../../interfaces/common';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  const error = {
    status: 'NOT_FOUND',
  } as IError;

  const mockNavigationService = {
    reload: jasmine.createSpy('reload'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: mockNavigationService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    component.error = error;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
  });
});
