import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IMenu } from '../../interfaces/user';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {

  @Input() items!: IMenu[];
  @ViewChild('childMenu') public childMenu!: IMenu;
  @Input() drawer: any;
  step = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches), shareReplay());

  language: string;

  constructor(private breakpointObserver: BreakpointObserver, public router: Router, private translate: TranslateService) {
    this.language = this.translate.currentLang;
  }

  ngOnInit(): void {
  }

  navigate(menu: IMenu, drawer?: any): void {
    drawer?.toggle();
    this.router.navigate([this.language].concat(menu.path.split('/')));
  }

  setStep(index: number): void {
    this.step = index;
  }
}
