import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonsComponent } from './share-buttons.component';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideAppIcons } from '@app/util/app-icons.provider';

describe('ShareButtonsComponent', () => {
  let component: ShareButtonsComponent;
  let fixture: ComponentFixture<ShareButtonsComponent>;
  let windowOpenSpy: ReturnType<typeof vi.spyOn>;
  let clipboardSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    clipboardSpy = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardSpy,
      },
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ShareButtonsComponent],
      providers: [provideHttpClient(withXhr()), provideAppIcons()],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(ShareButtonsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('message', 'Hello World!');
    fixture.componentRef.setInput('url', 'https://example.com');

    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    fixture.detectChanges();
  });

  it('should open WhatsApp share link', () => {
    component.shareOnWhatsApp();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?text=' +
        encodeURIComponent('Hello World!'),
    );
  });

  it('should open Messenger share link', () => {
    component.shareOnMessenger();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'fb-messenger://share/?link=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should open SMS share link', () => {
    component.shareViaSMS();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'sms:?&body=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should open Email share link', () => {
    component.shareViaEmail();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'mailto:?body=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should copy url to clipboard', async () => {
    await component.copyLink();

    expect(clipboardSpy).toHaveBeenCalledWith('https://example.com');
  });
});
