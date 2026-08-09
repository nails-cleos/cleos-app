import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DragDropSortingComponent,
  ISorting,
  Sorted,
} from './drag-drop-sorting.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('DragDropSortingComponent', () => {
  let component: DragDropSortingComponent;
  let fixture: ComponentFixture<DragDropSortingComponent>;

  let navigationServiceSpy: Pick<NavigationService, 'back'> & {
    back: ReturnType<typeof vi.fn>;
  };

  const mockItems: ISorting[] = [
    { key: 'name', name: 'Name' },
    { key: 'price', name: 'Price' },
    { key: 'date', name: 'Date' },
  ];

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
    };

    await TestBed.configureTestingModule({
      imports: [DragDropSortingComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DragDropSortingComponent);
    component = fixture.componentInstance;

    // required signal inputs
    fixture.componentRef.setInput('title', 'Sorting');
    fixture.componentRef.setInput('items', [...mockItems]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sort()', () => {
    it('should emit sorted items with correct order', () => {
      vi.spyOn(component.sorted, 'emit').mockReturnValue(undefined);

      component.sort();

      expect(component.sorted.emit).toHaveBeenCalledWith([
        new Sorted(1, 'name'),
        new Sorted(2, 'price'),
        new Sorted(3, 'date'),
      ]);
    });
  });

  describe('drop()', () => {
    it('should reorder items when dropped', () => {
      const event = {
        previousIndex: 0,
        currentIndex: 2,
        item: {} as any,
        container: {} as any,
        previousContainer: {} as any,
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
      } as CdkDragDrop<ISorting[]>;

      component.drop(event);

      expect(component.items()).toEqual([
        { key: 'price', name: 'Price' },
        { key: 'date', name: 'Date' },
        { key: 'name', name: 'Name' },
      ]);
    });
  });
});
