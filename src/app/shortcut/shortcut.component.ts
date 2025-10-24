import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthUserService } from '../services/auth-user.service';
import { SharedModule } from '../shared/shared.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

enum ShortcutEnum {
  dashboard,
  calendar,
  reservation,
}

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
  imports: [SharedModule],
})
export class ShortcutComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  constructor() {
    combineLatest([this.route.paramMap, this.authUserService.authUser])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([paramMap, user]) => {
        const key = paramMap.get('key') as keyof typeof ShortcutEnum;
        const shortcut = ShortcutEnum[key];
        let redirect: string[] = [];

        switch (shortcut) {
          case ShortcutEnum.calendar:
            if (user.isRoomAdmin) {
              redirect = ['events'];
            } else if (user.isAdmin || user.isManager || user.isProfessional) {
              redirect = ['reservation', 'calendar'];
            } else {
              redirect = ['me', 'reservations'];
            }
            break;

          case ShortcutEnum.dashboard:
            if (user.isRoomAdmin) {
              redirect = ['events'];
            } else if (user.isAdmin || user.isManager || user.isProfessional) {
              redirect = ['dashboard'];
            } else {
              redirect = ['me', 'overview'];
            }
            break;

          case ShortcutEnum.reservation:
            redirect = user.isCustomer ? ['me', 'reservation'] : ['reservation'];
            break;
        }

        this.router.navigate([this.translate.currentLang, ...redirect]);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
