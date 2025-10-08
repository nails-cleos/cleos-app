import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfoComponent } from './more-info.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('MoreInfoComponent', () => {
  let component: MoreInfoComponent;
  let fixture: ComponentFixture<MoreInfoComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockActivatedRoute = {
    params: of({ id: 'id' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreInfoComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
