import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentSortingComponent } from './treatment-sorting.component';

describe('TreatmentSortingComponent', () => {
  let component: TreatmentSortingComponent;
  let fixture: ComponentFixture<TreatmentSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TreatmentSortingComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
