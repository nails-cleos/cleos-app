import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableListComponent } from './unavailable-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('UnavailableListComponent', () => {
  let component: UnavailableListComponent;
  let fixture: ComponentFixture<UnavailableListComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('calendar'),
      },
    },
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnavailableListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
