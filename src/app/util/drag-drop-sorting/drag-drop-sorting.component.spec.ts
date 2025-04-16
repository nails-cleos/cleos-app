import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropSortingComponent } from './drag-drop-sorting.component';

describe('DragDropSortingComponent', () => {
  let component: DragDropSortingComponent;
  let fixture: ComponentFixture<DragDropSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropSortingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DragDropSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
