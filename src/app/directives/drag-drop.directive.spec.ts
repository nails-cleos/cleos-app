import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropDirective } from './drag-drop.directive';

@Component({
  imports: [DragDropDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  function createDragEvent(type: string, dataTransfer?: DataTransfer): DragEvent {
    const event = new DragEvent(type, {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: dataTransfer,
    });

    return event;
  }

  it('should add fileover class on dragover', () => {
    div.dispatchEvent(createDragEvent('dragover'));
    fixture.detectChanges();

    expect(div.classList.contains('fileover')).toBeTrue();
  });

  it('should remove fileover class on dragleave', () => {
    div.dispatchEvent(createDragEvent('dragover'));
    div.dispatchEvent(createDragEvent('dragleave'));
    fixture.detectChanges();

    expect(div.classList.contains('fileover')).toBeFalse();
  });

  it('should NOT emit when drop has no files', () => {
    const dt = new DataTransfer();
    const ev = createDragEvent('drop', dt);

    div.dispatchEvent(ev);
    fixture.detectChanges();

    expect(host.droppedFiles).toBeNull();
  });

  it('should emit files on drop', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['test'], 'test.txt'));

    const ev = createDragEvent('drop', dt);

    div.dispatchEvent(ev);
    fixture.detectChanges();

    expect(host.droppedFiles).toBeTruthy();
    expect(host.droppedFiles!.length).toBe(1);
    expect(host.droppedFiles![0].name).toBe('test.txt');
  });
});
