import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableListComponent } from './unavailable-list.component';

describe('UnavailableListComponent', () => {
  let component: UnavailableListComponent;
  let fixture: ComponentFixture<UnavailableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnavailableListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
