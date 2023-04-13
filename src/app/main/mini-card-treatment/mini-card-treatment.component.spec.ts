import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCardTreatmentComponent } from './mini-card-treatment.component';

describe('MiniCardTreatmentComponent', () => {
  let component: MiniCardTreatmentComponent;
  let fixture: ComponentFixture<MiniCardTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniCardTreatmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniCardTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
