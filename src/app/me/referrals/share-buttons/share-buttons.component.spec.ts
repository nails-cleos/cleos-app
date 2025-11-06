import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButtonsComponent } from './share-buttons.component';
import { provideHttpClient } from '@angular/common/http';

describe('ShareButtonsComponent', () => {
  let component: ShareButtonsComponent;
  let fixture: ComponentFixture<ShareButtonsComponent>;
  let windowOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareButtonsComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareButtonsComponent);
    component = fixture.componentInstance;

    // default input values
    component.message = 'Hello World!';
    component.url = 'https://example.com';

    // spy on window.open
    windowOpenSpy = spyOn(window, 'open');
    fixture.detectChanges();
  });

  it('should open WhatsApp share link', () => {
    void component.shareOnWhatsApp;
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?text=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should open Messenger share link', () => {
    void component.shareOnMessenger;
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'fb-messenger://share/?link=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should open SMS share link', () => {
    void component.shareViaSMS;
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'sms:?&body=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should open Email share link', () => {
    void component.shareViaEmail;
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'mailto:?body=' + encodeURIComponent('Hello World!'),
    );
  });

  it('should copy url to clipboard', async () => {
    const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    void component.copyLink;
    expect(clipboardSpy).toHaveBeenCalledWith('https://example.com');
  });
});
