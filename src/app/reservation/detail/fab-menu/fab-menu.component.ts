import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFabMenu } from '@angular-material-extensions/fab-menu/lib/mat-fab-menu.component';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-fab-menu',
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger(100, [
            animate('0.5s ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 0, transform: 'translateY(-15px)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('iconChange', [
      state('open', style({
        transform: 'rotate(225deg)'
      })),
      state('closed', style({
        transform: 'rotate(0)'
      })),
      transition('open <=> closed', [
        animate('200ms ease-in-out')
      ])
    ])
  ]
})
export class FabMenuComponent {
  @Input() direction!: 'left' | 'bottom';
  @Input() fabButtons!: MatFabMenu[];
  @Output() fabMenuItemSelected: EventEmitter<string | number> = new EventEmitter<string | number>();

  menuOpen: boolean;
  color: 'primary';
  icon: string;

  constructor() {
    this.menuOpen = false;
    this.color = 'primary';
    this.icon = 'all_out';
  }

  handleMenuItemClick(item: any): void {
    this.fabMenuItemSelected.emit(item.id);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    console.log('Menu Open:', this.menuOpen);
  }

}
