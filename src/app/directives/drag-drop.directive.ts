import { Directive, HostBinding, HostListener, output } from '@angular/core';

@Directive({
  selector: '[appDragDrop]',
})
export class DragDropDirective {
  @HostBinding('class.fileover') fileOver?: boolean;
  fileDropped = output<FileList>();

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver = ($event: DragEvent): void => {
    $event.preventDefault();
    $event.stopPropagation();
    this.fileOver = true;
  };

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave = ($event: DragEvent): void => {
    $event.preventDefault();
    $event.stopPropagation();
    this.fileOver = false;
  };

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop = ($event: DragEvent): void => {
    $event.preventDefault();
    $event.stopPropagation();
    this.fileOver = false;
    const files = $event.dataTransfer?.files;
    if (!files) {
      return;
    }
    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  };
}
