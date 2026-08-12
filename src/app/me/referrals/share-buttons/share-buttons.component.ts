import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.component.html',
  styleUrls: ['./share-buttons.component.scss'],
  imports: [MatIcon, MatButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareButtonsComponent {
  message = input<string>('');
  url = input<string>('');

  shareOnWhatsApp(): void {
    window.open(
      'https://api.whatsapp.com/send?text=' +
        encodeURIComponent(this.message()),
    );
    return;
  }

  shareOnMessenger(): void {
    window.open(
      'fb-messenger://share/?link=' + encodeURIComponent(this.message()),
    );
    return;
  }

  shareViaSMS(): void {
    window.open('sms:?&body=' + encodeURIComponent(this.message()));
    return;
  }

  shareViaEmail(): void {
    window.open('mailto:?body=' + encodeURIComponent(this.message()));
    return;
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.url());
    return;
  }
}
