import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IMenu } from '../../interfaces/user';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { MatDrawer } from '@angular/material/sidenav';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppMaterialModule } from '../../util/app-material.module';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  imports: [AppMaterialModule, RouterLinkActive, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  items = input.required<IMenu[]>();
  drawer = input<MatDrawer>();

  private breakpointObserver$ = this.breakpointObserver.observe(
    [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]);

  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
          [Breakpoints.Medium]: false,
        },
      },
    },
  );

  isHandsetSignal = computed(() => this.breakpointsSignal()?.matches ?? false);

  openSubMenus: { [key: number]: boolean } = {};
  openSubSubMenus: { [key: number]: { [key: number]: boolean } } = {};

  language: string = this.translate.getCurrentLang();

  constructor() {
  }

  navigate = (menu: IMenu, drawer?: MatDrawer): void => {
    drawer?.toggle();
    this.router.navigate([this.language].concat(menu.path.split('/')));
  };

  toggleSubMenu = (index: number) => {
    for (const key in this.openSubMenus) {
      if (Number(key) !== index) {
        this.openSubMenus[key] = false;
      }
    }
    this.openSubMenus[index] = !this.openSubMenus[index];
  };

  isSubMenuOpen = (index: number): boolean => this.openSubMenus[index] || false;

  toggleSubSubMenu = (index: number, subIndex: number) => {
    if (!this.openSubSubMenus[index]) {
      this.openSubSubMenus[index] = {};
    }
    for (const key in this.openSubSubMenus[index]) {
      if (Number(key) !== subIndex) {
        this.openSubSubMenus[index][key] = false;
      }
    }
    this.openSubSubMenus[index][subIndex] = !this.openSubSubMenus[index][subIndex];
  };

  isSubSubMenuOpen = (
    index: number,
    subIndex: number,
  ): boolean => (this.openSubSubMenus[index] && this.openSubSubMenus[index][subIndex]) || false;
}
