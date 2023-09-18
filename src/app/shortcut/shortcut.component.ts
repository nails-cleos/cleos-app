import { Component, OnDestroy } from '@angular/core';
import { AuthUserService } from '../services/auth-user.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

enum ShortcutEnum {
  dashboard,
  calendar,
  reservation
}

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss']
})
export class ShortcutComponent implements OnDestroy {

  private authUserServiceSubscription: Subscription;

  constructor(private authUserService: AuthUserService, private route: ActivatedRoute, private router: Router) {
    const key = this.route.snapshot.paramMap.get('key') as keyof typeof ShortcutEnum;
    const shortcut = ShortcutEnum[key];
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      let redirect: string[] = [];
      switch (shortcut) {
        case ShortcutEnum.calendar:
          if (value.isRoomAdmin) {
            redirect = ['events'];
          } else if (value.isAdmin || value.isManager || value.isProfessional) {
            redirect = ['reservation', 'calendar'];
          } else {
            redirect = ['me', 'reservations'];
          }
          break;
        case ShortcutEnum.dashboard:
          if (value.isRoomAdmin) {
            redirect = ['events'];
          } else if (value.isAdmin || value.isManager || value.isProfessional) {
            redirect = ['dashboard'];
          } else {
            redirect = ['me', 'overview'];
          }
          break;
        case ShortcutEnum.reservation:
          if (value.isCustomer) {
            redirect = ['me'];
          }
          redirect = [...redirect, 'reservation'];
          break;
      }
      console.log(key);
      console.log(redirect);
      this.router.navigate(redirect);
    });
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }
}
