import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCompleteComponent } from './reservation-complete.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('ReservationCompleteComponent', () => {
  let component: ReservationCompleteComponent;
  let fixture: ComponentFixture<ReservationCompleteComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockActivatedRoute = {
    params: of({ id: 'id' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCompleteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
