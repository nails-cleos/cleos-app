import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';

type ContactKey = 'whatsapp' | 'instagram' | 'facebook' | 'phone' | 'email';

@Component({
  selector: 'app-bottom-sheet-book-appointment',
  templateUrl: 'bottom-sheet-book-appointment.html',
  imports: [AppMaterialModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetBookAppointmentComponent {
  private readonly bottomSheetRef = inject(MatBottomSheetRef<BottomSheetBookAppointmentComponent>);
  private readonly translate = inject(TranslateService);

  private readonly actionSignal = signal<ContactKey | undefined>(undefined);

  constructor() {
    effect(() => {
      const action = this.actionSignal();
      if (!action) {
        return;
      }

      const contact = this.translate.instant('MAIN.CONTACT');
      let url = '';

      switch (action) {
        case 'whatsapp': {
          const phone = contact.SEND.PHONE;
          const message = contact.SEND.HELLO;
          url = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
          break;
        }
        case 'phone': {
          url = `tel:${contact.SEND.PHONE}`;
          break;
        }
        case 'instagram':
          url = 'https://ig.me/m/carlanailscleos.nl';
          break;

        case 'facebook': {
          const msg = contact.SEND.HELLO;
          url = `https://m.me/carlanailscleos.nl?text=${msg}`;
          break;
        }

        case 'email':
          url = `mailto:${contact.MAIL}`;
          break;
      }

      window.open(url, '_blank');

      this.actionSignal.set(undefined);
    });
  }

  openLink(event: MouseEvent, key: ContactKey): void {
    event.preventDefault();
    this.bottomSheetRef.dismiss();

    this.actionSignal.set(key);
  }
}
