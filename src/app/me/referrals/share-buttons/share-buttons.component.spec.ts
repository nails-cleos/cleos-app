import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonsComponent } from './share-buttons.component';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideAppIcons } from '@app/util/app-icons.provider';

describe('ShareButtonsComponent', () => {
  let component: ShareButtonsComponent;
  let fixture: ComponentFixture<ShareButtonsComponent>;
  let windowOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareButtonsComponent],
      providers: [provideHttpClient(withXhr()), provideAppIcons()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareButtonsComponent);
    component = fixture.componentInstance;

    // default input values
    fixture.componentRef.setInput('message', 'Hello World!');
    fixture.componentRef.setInput('url', 'https://example.com');

    // spy on window.open
    windowOpenSpy = spyOn(window, 'open');
    fixture.detectChanges();
  });

  it('should open WhatsApp share link', () => {
    component.shareOnWhatsApp();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?text=' + encodeURIComponent('Hello World!'),
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
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    component.copyLink();
    expect(clipboardSpy).toHaveBeenCalledWith('https://example.com');
  });
});
