import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';

@Component({
  selector: 'app-bottom-sheet-book-appointment',
  templateUrl: 'bottom-sheet-book-appointment.html',
  imports: [AppMaterialModule, TranslatePipe],
})
export class BottomSheetBookAppointmentComponent {
  private bottomSheetRef: MatBottomSheetRef<BottomSheetBookAppointmentComponent> = inject(
    MatBottomSheetRef<BottomSheetBookAppointmentComponent>);
  private translate: TranslateService = inject(TranslateService);

  openLink = (event: MouseEvent, key: 'whatsapp' | 'instagram' | 'facebook' | 'phone' | 'email'): void => {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    setTimeout(() => {
      let url;
      switch (key) {
        case 'whatsapp':
          const phone = this.translate.instant('MAIN.CONTACT.SEND.PHONE');
          const message = this.translate.instant('MAIN.CONTACT.SEND.HELLO');
          url = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
          break;
        case 'phone':
          const tel = this.translate.instant('MAIN.CONTACT.SEND.PHONE');
          url = `tel:${tel}`;
          break;
        case 'instagram':
          url = 'https://ig.me/m/carlanailscleos.nl';
          break;
        case 'facebook':
          const message2 = this.translate.instant('MAIN.CONTACT.SEND.HELLO');
          url = `https://m.me/carlanailscleos.nl?text=${message2}`;
          break;
        case 'email':
          const mail = this.translate.instant('MAIN.CONTACT.MAIL');
          url = `mailto:${mail}`;
          break;
      }
      window.open(url, '_blank');
    }, 500);
  };
}
