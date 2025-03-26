import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalSortingComponent } from './additional-sorting.component';

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AdditionalSortingComponent]
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
