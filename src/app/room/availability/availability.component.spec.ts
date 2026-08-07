import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityComponent } from './availability.component';
import { provideTranslateService } from '@ngx-translate/core';

describe('AvailabilityComponent', () => {
  let component: AvailabilityComponent;
  let fixture: ComponentFixture<AvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityComponent],
      providers:[provideTranslateService()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
