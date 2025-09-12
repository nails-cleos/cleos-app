import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalSortingComponent } from './additional-sorting.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalSortingComponent],
      providers: [
        { provide: Store, useValue: mockStore },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdditionalSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
