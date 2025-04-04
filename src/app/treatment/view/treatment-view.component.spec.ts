import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentViewComponent } from './treatment-view.component';

describe('ViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TreatmentViewComponent]
})
    .compileComponents();
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
