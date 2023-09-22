import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';

export const detailExpandAnimation = trigger('detailExpand', [
  state('collapsed', style({ height: '0px', minHeight: '0' })),
  state('expanded', style({ height: '*' })),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
]);

export const transitionAnimation = trigger(
  'discountAnimation',
  [
    transition(
      ':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('2s', style({ transform: 'translateX(0)', opacity: 1 }))
      ]
    ),
    transition(
      ':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('1s', style({ transform: 'translateX(100%)', opacity: 0 }))
      ]
    )]
);

export const stampAnimation = trigger(
  'stampAnimation',
  [
    transition(
      ':enter', [
        style({ transform: 'scale(5) rotate({{deg}}deg)' }),
        animate(500, style({ transform: 'scale(1) rotate({{deg}}deg)' }))
      ], { params: { deg: 0 } }
    )]
);

export const insertItemList = trigger('list', [
  transition(':enter', [
    // child animation selector + stagger
    query('@items',
      stagger(300, animateChild())
    )
  ]),
]);

export const addRemoveItemList = trigger('items', [
  // cubic-bezier for a tiny bouncing feel
  transition(':enter', [
    style({ transform: 'scale(0.5)', opacity: 0 }),
    animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
      style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ transform: 'scale(1)', opacity: 1, height: '*' }),
    animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
      style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
  ]),
]);

export const goTo = (elementId: string): boolean => {
  document.getElementById(elementId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  });

  return true;
};
