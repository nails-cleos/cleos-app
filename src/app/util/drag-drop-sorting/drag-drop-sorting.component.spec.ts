import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropSortingComponent } from './drag-drop-sorting.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe('DragDropSortingComponent', () => {
  let component: DragDropSortingComponent;
  let fixture: ComponentFixture<DragDropSortingComponent>;

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropSortingComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DragDropSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
