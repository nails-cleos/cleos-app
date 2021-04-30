import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableDetailComponent } from './unavailable-detail.component';

describe('UnavailableDetailComponent', () => {
  let component: UnavailableDetailComponent;
  let fixture: ComponentFixture<UnavailableDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnavailableDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailableDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
