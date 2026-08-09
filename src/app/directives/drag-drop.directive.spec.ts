import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropDirective } from './drag-drop.directive';
import { beforeEach, describe, expect, it, vi } from 'vitest';

@Component({
  imports: [DragDropDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div appDragDrop (fileDropped)="onDropped($event)"></div>',
})
class TestHostComponent {
  droppedFiles: FileList | null = null;

  onDropped(files: FileList) {
    this.droppedFiles = files;
  }
}

describe('DragDropDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let div: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    div = fixture.nativeElement.querySelector('div');
    fixture.detectChanges();
  });

  it('should add fileover class on dragover', () => {
    div.dispatchEvent(createDragEvent('dragover'));
    fixture.detectChanges();

    expect(div.classList.contains('fileover')).toBe(true);
  });

  it('should remove fileover class on dragleave', () => {
    div.dispatchEvent(createDragEvent('dragover'));
    div.dispatchEvent(createDragEvent('dragleave'));
    fixture.detectChanges();

    expect(div.classList.contains('fileover')).toBe(false);
  });

  it('should NOT emit when drop has no files', () => {
    const dt = createDataTransfer();
    const ev = createDragEvent('drop', dt);

    div.dispatchEvent(ev);
    fixture.detectChanges();

    expect(host.droppedFiles).toBeNull();
  });

  it('should emit files on drop', () => {
    const file = new File(['test'], 'test.txt');
    const dt = createDataTransfer([file]);

    const ev = createDragEvent('drop', dt);

    div.dispatchEvent(ev);
    fixture.detectChanges();

    expect(host.droppedFiles).toBeTruthy();
    expect(host.droppedFiles!.length).toBe(1);
    expect(host.droppedFiles![0].name).toBe('test.txt');
  });

  const createDataTransfer = (files: File[] = []): DataTransfer => {
    return {
      files: files as unknown as FileList,
      items: {
        add: vi.fn(),
      },
    } as unknown as DataTransfer;
  };

  const createDragEvent = (
    type: string,
    dataTransfer?: DataTransfer,
  ): DragEvent => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: dataTransfer,
    });

    return event as DragEvent;
  };
});
