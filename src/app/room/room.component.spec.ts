import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomComponent } from './room.component';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
    paramMap: of({
      get: jasmine.createSpy('get').and.returnValue('roomId'),
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
