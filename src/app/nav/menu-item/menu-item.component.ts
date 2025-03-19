import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IMenu } from '../../interfaces/user';
import { Router, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: true,
  imports: [SharedModule, RouterLinkActive],
})
export class MenuItemComponent implements OnInit {

  @Input() items!: IMenu[];
  @ViewChild('childMenu') public childMenu!: IMenu;
  @Input() drawer: any;
  step = 0;
  openSubMenus: { [key: number]: boolean } = {};
  openSubSubMenus: { [key: number]: { [key: number]: boolean } } = {};

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches), shareReplay());

  language: string;

  constructor(private breakpointObserver: BreakpointObserver, public router: Router,
              private translate: TranslateService) {
    this.language = this.translate.currentLang;
  }

  ngOnInit(): void {
  }

  navigate = (menu: IMenu, drawer?: any): void => {
    drawer?.toggle();
    this.router.navigate([this.language].concat(menu.path.split('/')));
  }

  toggleSubMenu = (index: number) => {
    // Close all other submenus
    for (let key in this.openSubMenus) {
      if (Number(key) !== index) {
        this.openSubMenus[key] = false;
      }
    }
    this.openSubMenus[index] = !this.openSubMenus[index];
  }

  isSubMenuOpen = (index: number): boolean => this.openSubMenus[index] || false

  toggleSubSubMenu = (index: number, subIndex: number) => {
    if (!this.openSubSubMenus[index]) {
      this.openSubSubMenus[index] = {};
    }
    // Close all other sub-submenus within the same sub-menu
    for (let key in this.openSubSubMenus[index]) {
      if (Number(key) !== subIndex) {
        this.openSubSubMenus[index][key] = false;
      }
    }
    this.openSubSubMenus[index][subIndex] = !this.openSubSubMenus[index][subIndex];
  }

  isSubSubMenuOpen = (
    index: number,
    subIndex: number
  ): boolean => (this.openSubSubMenus[index] && this.openSubSubMenus[index][subIndex]) || false;
}
