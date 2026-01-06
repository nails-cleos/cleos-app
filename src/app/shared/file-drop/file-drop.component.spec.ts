import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FileDropComponent } from './file-drop.component';
import { ToastService } from '../../services/toast.service';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('FileDropComponent', () => {
  let component: FileDropComponent;
  let fixture: ComponentFixture<FileDropComponent>;

  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let action$: BehaviorSubject<void>;

  beforeEach(async () => {
    action$ = new BehaviorSubject<void>(void 0);

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'show']);

    toastServiceSpy.warning.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [FileDropComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(FileDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onFileDropped should set file and start upload', () => {
    spyOn(component as any, 'simulateUpload');
    const mockFile = new File(['test content'], 'file.jpg', { type: 'image/jpeg' });
    const files = [mockFile] as any as FileList;

    component.onFileDropped(files);

    expect(component.file()).toEqual(jasmine.objectContaining({
      name: 'file.jpg',
      size: jasmine.any(Number),
      progress: 0,
      raw: mockFile,
    }));
    expect(component['simulateUpload']).toHaveBeenCalled();
  });

  it('fileBrowseHandler should set file and start upload', () => {
    spyOn(component as any, 'simulateUpload');
    const mockFile = new File(['test content'], 'file.jpg', { type: 'image/jpeg' });
    const mockTarget = {
      files: [mockFile],
    } as any as EventTarget;

    component.fileBrowseHandler(mockTarget);

    expect(component.file()).toEqual(jasmine.objectContaining({
      name: 'file.jpg',
      size: jasmine.any(Number),
      progress: 0,
      raw: mockFile,
    }));
    expect(component['simulateUpload']).toHaveBeenCalled();
  });

  it('should set resizedImageDataUrl when catalogue emits an image', () => {
    fixture.componentRef.setInput('currentFile', { image: 'data:image/jpeg;base64,AAA' });
    fixture.detectChanges();

    expect(component.file()?.image).toContain('data:image/jpeg;base64,AAA');
  });

  it('should delete file and reset resizedImageDataUrl in add mode', () => {
    component.file.set({
      name: 'file.jpg',
      size: 1000,
      progress: 100,
      raw: new File([''], 'file.jpg'),
      image: 'data:image/jpeg;base64,AAA',
    });

    component.delete();
    fixture.detectChanges();

    expect(component.file()?.image).toBeUndefined();
    expect(component.file()).toBeUndefined();
  });

  it('should show toast, clear image and undo in edit mode', () => {
    fixture.componentRef.setInput('currentFile', { image: 'data:image/jpeg;base64,AAA' });
    fixture.componentRef.setInput('undo', true);
    fixture.detectChanges();

    component.delete();

    expect(toastServiceSpy.warning).toHaveBeenCalledWith('COMMON.FILE.DELETE.MESSAGE', 5000, 'button', 'undo');
    action$.next();

    expect(component.file()?.image).toBe('data:image/jpeg;base64,AAA');
  });

  it('should set progress to 100 immediately when animate is false', () => {
    fixture.componentRef.setInput('animate', false);
    fixture.detectChanges();

    const mockFile = new File(['x'], 'file.txt', { type: 'text/plain' });
    component.onFileDropped([mockFile] as any as FileList);

    expect(component.file()?.progress).toBe(100);
  });

  it('should simulate upload until progress reaches 100', fakeAsync(() => {
    const mockFile = new File(['x'], 'file.txt', { type: 'text/plain' });

    component.onFileDropped([mockFile] as any as FileList);

    // stepTime = 4ms, progress increments to 100
    tick(500);

    expect(component.file()?.progress).toBe(100);
  }));

  it('should not generate image preview for non-image files', fakeAsync(() => {
    const mockFile = new File(['x'], 'file.txt', { type: 'text/plain' });

    component.onFileDropped([mockFile] as any as FileList);
    tick(500);

    expect(component.isImage()).toBeFalse();
    expect(component.file()?.image).toBeUndefined();
  }));

  it('should emit undefined when deleting without undo', () => {
    const emitSpy = spyOn(component.fileSelected, 'emit');

    component.file.set({
      name: 'file.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'file.txt'),
    });

    component.delete();

    expect(component.file()).toBeUndefined();
    expect(emitSpy).toHaveBeenCalledWith(undefined);
  });

  it('should emit selection when progress is 100', () => {
    const emitSpy = spyOn(component.fileSelected, 'emit');

    fixture.componentRef.setInput('currentFile', undefined);
    const file = {
      name: 'file.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'file.txt'),
    };
    component.file.set(file);
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(file);
  });
});
