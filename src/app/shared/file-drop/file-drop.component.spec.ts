import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FileDropComponent } from './file-drop.component';
import { ToastService } from '@app/services/toast.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { DEFAULT_LOCALE } from '@app/util/dates';

describe('FileDropComponent', () => {
  let component: FileDropComponent;
  let fixture: ComponentFixture<FileDropComponent>;

  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let action$: BehaviorSubject<void>;

  beforeEach(async () => {
    action$ = new BehaviorSubject<void>(void 0);

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    toastServiceSpy.show.and.returnValue({
      onAction: () => action$.asObservable(),
      onDismiss: () => of(void 0),
    });

    await TestBed.configureTestingModule({
      imports: [FileDropComponent],
      providers: [
        provideTranslateService(),
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

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
      value: 'C:\\\\fakepath\\\\file.jpg',
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
    expect((mockTarget as HTMLInputElement).value).toBe('');
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

    expect(toastServiceSpy.show).toHaveBeenCalledWith('COMMON.FILE.DELETE.MESSAGE', 'warning', 5000,
      { actionType: 'button', action: 'undo' });
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

  it('should keep a locally selected file when currentFile input is undefined', () => {
    fixture.componentRef.setInput('currentFile', undefined);
    fixture.detectChanges();

    const file = {
      name: 'file.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'file.txt'),
    };

    component.file.set(file);
    fixture.detectChanges();

    expect(component.file()).toEqual(file);
  });

  it('should clear the internal file when currentFile input becomes undefined', () => {
    fixture.componentRef.setInput('currentFile', {
      name: 'file.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'file.txt'),
    });
    fixture.detectChanges();

    fixture.componentRef.setInput('currentFile', undefined);
    fixture.detectChanges();

    expect(component.file()).toBeUndefined();
    expect(component.isImage()).toBeFalse();
  });

  it('should clear the hidden file input when currentFile input becomes undefined', () => {
    const input = fixture.nativeElement.querySelector('#fileInput') as HTMLInputElement;
    let inputValue = 'C:\\\\fakepath\\\\file.txt';
    const valueSetter = jasmine.createSpy('valueSetter').and.callFake((value: string) => {
      inputValue = value;
    });
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: () => inputValue,
      set: valueSetter,
    });

    fixture.componentRef.setInput('currentFile', {
      name: 'file.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'file.txt'),
    });
    fixture.detectChanges();

    fixture.componentRef.setInput('currentFile', undefined);
    fixture.detectChanges();

    expect(valueSetter).toHaveBeenCalledWith('');
    expect(inputValue).toBe('');
  });

  it('should clear the hidden file input before opening the picker', () => {
    const input = fixture.nativeElement.querySelector('#fileInput') as HTMLInputElement;
    let inputValue = 'C:\\\\fakepath\\\\file.txt';
    const valueSetter = jasmine.createSpy('valueSetter').and.callFake((value: string) => {
      inputValue = value;
    });
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: () => inputValue,
      set: valueSetter,
    });
    spyOn(input, 'click');

    component.openFileBrowser();

    expect(valueSetter).toHaveBeenCalledWith('');
    expect(inputValue).toBe('');
    expect(input.click).toHaveBeenCalled();
  });

  it('should emit a new local file after currentFile was cleared by the parent', () => {
    const emitSpy = spyOn(component.fileSelected, 'emit');
    const previousFile = {
      name: 'previous.txt',
      size: 100,
      progress: 100,
      raw: new File(['x'], 'previous.txt'),
    };
    const newFile = {
      name: 'new.txt',
      size: 100,
      progress: 100,
      raw: new File(['y'], 'new.txt'),
    };

    fixture.componentRef.setInput('currentFile', previousFile);
    fixture.detectChanges();
    emitSpy.calls.reset();

    fixture.componentRef.setInput('currentFile', undefined);
    fixture.detectChanges();
    emitSpy.calls.reset();

    component.file.set(newFile);
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(newFile);
  });
});
