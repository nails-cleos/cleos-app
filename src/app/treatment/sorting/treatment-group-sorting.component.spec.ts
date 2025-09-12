import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentGroupSortingComponent } from './treatment-group-sorting.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('TreatmentGroupSortingComponent', () => {
  let component: TreatmentGroupSortingComponent;
  let fixture: ComponentFixture<TreatmentGroupSortingComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentGroupSortingComponent],
      providers: [
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentGroupSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
