import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.component.html',
  styleUrls: ['./share-buttons.component.scss'],
  imports: [SharedModule]
})
export class ShareButtonsComponent {
  @Input() message = '';
  @Input() url = '';

  constructor() {
  }

  get shareOnWhatsApp(): void {
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(this.message));
    return;
  }

  get shareOnMessenger(): void {
    window.open('fb-messenger://share/?link=' + encodeURIComponent(this.message));
    return;
  }

  get shareViaSMS(): void {
    window.open('sms:?&body=' + encodeURIComponent(this.message));
    return;
  }

  get shareViaEmail(): void {
    window.open('mailto:?body=' + encodeURIComponent(this.message));
    return;
  }

  get copyLink(): void {
    navigator.clipboard.writeText(this.url);
    return;
  }
}
