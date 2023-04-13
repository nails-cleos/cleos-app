import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentDetailComponent } from './treatment-detail.component';

describe('TreatmentDetailComponent', () => {
  let component: TreatmentDetailComponent;
  let fixture: ComponentFixture<TreatmentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
