import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { finalize, interval, takeWhile } from 'rxjs';
import { AppMaterialModule } from '../../util/app-material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PercentPipe } from '@angular/common';
import { formatBytes, resizeImage } from '../../util/file';
import { DragDropDirective } from '../../directives/drag-drop.directive';
import { ToastService } from '../../services/toast.service';

export interface UploadFile {
  raw?: File;
  name: string;
  size: number;
  progress: number;
  image?: string;
}

@Component({
  selector: 'app-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
  imports: [AppMaterialModule, TranslatePipe, PercentPipe, DragDropDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly toastService: ToastService = inject(ToastService);

  accept = input<string>('*');
  multiple = input<boolean>(false);
  undo = input<boolean>(false);
  animate = input<boolean>(true);
  currentFile = input<UploadFile>();

  fileSelected = output<UploadFile | undefined>();

  file = signal<UploadFile | undefined>(undefined);
  isImage = signal(false);

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private canvasXs = viewChild<ElementRef<HTMLCanvasElement>>('canvasXs');
  private resizedImage = viewChild<ElementRef<HTMLImageElement>>('resizedImage');

  constructor() {
    effect(() => {
      const currentFile = this.currentFile();
      if (!currentFile) {
        const file = this.file();
        if (file === undefined || file?.progress === 100) {
          this.fileSelected.emit(this.file());
        }
      }
    });

    effect(() => {
      const currentFile = this.currentFile();
      if (currentFile) {
        this.file.set(currentFile);
      }
    });
  }

  onFileDropped = (files: FileList): void => {
    const rawFile = files[0];
    if (rawFile) {
      this.handleFile(rawFile);
    }
  };

  fileBrowseHandler = (target: EventTarget | null): void => {
    const rawFile = (target as HTMLInputElement)?.files?.[0];
    if (rawFile) {
      this.handleFile(rawFile);
    }
  };

  delete() {
    const file = this.file();
    this.file.set(undefined);
    if (!this.undo()) {
      this.fileSelected.emit(undefined);
    } else {
      const content = this.translate.instant('COMMON.FILE.DELETE.MESSAGE', { name: file?.name });
      const toastRef = this.toastService.show(content, 'warning', 5000, { actionType: 'button', action: 'undo' });
      toastRef.onAction().subscribe(() => {
        this.file.set(file);
        this.fileSelected.emit(file);
      });
    }
  }

  private handleFile(file: File) {
    const progress = this.animate() ? 0 : 100;
    const uploadFile: UploadFile = { raw: file, name: file.name, size: file.size, progress };
    this.isImage.set(file.type.startsWith('image/'));
    this.file.set(uploadFile);
    this.simulateUpload(uploadFile);
  }

  private simulateUpload(uploadFile: UploadFile) {
    if (!uploadFile) {
      return;
    }

    const stepTime = 4;

    interval(stepTime).pipe(
      takeUntilDestroyed(this.destroyRef),
      takeWhile(() => (this.file()?.progress ?? 0) < 99, true),
      finalize(() => {
        this.file.update(prev => prev ? { ...prev, progress: 100 } : prev);
        this.processImage();
      })).subscribe(() => this.file.update(prev => prev ? { ...prev, progress: prev.progress + 1 } : prev));
  }


  private processImage() {
    const file = this.file()?.raw;
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.file.update(prev => prev ? { ...prev, image: undefined } : prev);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const image = resizeImage(img, this.canvas()?.nativeElement || this.canvasXs()?.nativeElement);
        this.file.update(prev => prev ? { ...prev, image } : prev);
        const resizedImage = this.resizedImage();
        if (resizedImage) {
          resizedImage.nativeElement.src = image;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  protected readonly formatBytes = formatBytes;
}
