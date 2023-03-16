import { animate, state, style, transition, trigger } from '@angular/animations';

export const detailExpandAnimation = trigger('detailExpand', [
  state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
  state('expanded', style({ height: '*' })),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
]);

export const transitionAnimation = trigger(
  'discountAnimation',
  [
    transition(
      ':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('2s', style({transform: 'translateX(0)', opacity: 1}))
      ]
    ),
    transition(
      ':leave', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('1s', style({transform: 'translateX(100%)', opacity: 0}))
      ]
    )]
);

export const stampAnimation = trigger(
    'stampAnimation',
    [
      transition(
        ':enter', [
          style({transform: 'scale(5) rotate({{deg}}deg)'}),
          animate(500, style({transform: 'scale(1) rotate({{deg}}deg)'}))
        ], {params: {deg: 0}}
      )]
  );
