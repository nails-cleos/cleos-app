import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentViewComponent } from './treatment-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('ViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
