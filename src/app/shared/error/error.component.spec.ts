import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  const error = {
    status: 'NOT_FOUND',
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);

    await TestBed.configureTestingModule({
      imports: [ErrorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('error', error);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
