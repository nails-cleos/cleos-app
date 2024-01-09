import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentGroupSortingComponent } from './treatment-group-sorting.component';

describe('TreatmentGroupSortingComponent', () => {
  let component: TreatmentGroupSortingComponent;
  let fixture: ComponentFixture<TreatmentGroupSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentGroupSortingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentGroupSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
