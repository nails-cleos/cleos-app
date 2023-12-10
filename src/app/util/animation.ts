import {
  animate,
  animateChild,
  AUTO_STYLE,
  group,
  keyframes,
  query,
  sequence,
  stagger,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { BehaviorSubject } from 'rxjs';

const right = [
  query(':enter, :leave',
    style({ position: 'absolute', width: '100%' }), { optional: true }
  ),
  group([
    query(':enter', [
      style({ transform: 'translateX(100%)' }),
      animate('300ms ease-out',
        style({ transform: 'translateX(0%)' })
      )
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' }),
      animate('300ms ease-out',
        style({ transform: 'translateX(-100%)' })
      )
    ], { optional: true })
  ])
];

const left = [
  query(':enter, :leave',
    style({ position: 'absolute', width: '100%' }), { optional: true }
  ),
  group([
    query(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('300ms ease-out',
        style({ transform: 'translateX(0%)' })
      )
    ], { optional: true }),
    query(':leave', [
      style({ transform: 'translateX(0%)' }),
      animate('300ms ease-out',
        style({ transform: 'translateX(100%)' })
      )
    ], { optional: true })
  ])
];

export const slideAnimation = trigger('slideAnimation', [
  transition(':increment', right),
  transition(':decrement', left)
]);

export const fadeInUpDown = (translate: string = '20px', duration: string = '2000ms') => sequence([
  animate(`${ duration } ease-in-out`, keyframes([
    style({ opacity: 0, transform: `translateY(${ translate })`, offset: 0 }),
    style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
  ]))
]);

export const gelatine = sequence([
  animate('2000ms 200ms ease-in-out', keyframes([
    style({ transform: 'scale(1, 1)', offset: 0 }),
    style({ transform: 'scale(0.9, 1.1)', offset: 0.25 }),
    style({ transform: 'scale(1.1, 0.9)', offset: 0.5 }),
    style({ transform: 'scale(0.95, 1.05)', offset: 0.75 }),
    style({ transform: 'scale(1, 1)', offset: 1 })
  ]))
]);

export const rubberBand = sequence([
  animate('1000ms ease-in-out', keyframes([
    style({ transform: 'scale(1)', offset: 0 }),
    style({ transform: 'scaleX(1.25) scaleY(0.75)', offset: 0.3 }),
    style({ transform: 'scaleX(0.75) scaleY(1.25)', offset: 0.4 }),
    style({ transform: 'scaleX(1.15) scaleY(0.85)', offset: 0.6 }),
    style({ transform: 'scale(1)', offset: 1 })
  ]))
]);

export const bounceInDownAnimation = (duration: string, delay: string = '0ms') => animate(`${ duration } ${ delay } ease-in-out`,
  keyframes([
    style({ opacity: 0, transform: 'translateY(-100vh)', offset: 0 }),
    style({ opacity: 1, transform: 'translateY(30px)', offset: 0.6 }),
    style({ transform: 'translateY(-10px)', offset: 0.8 }),
    style({ transform: 'translateY(0)', offset: 1 })
  ])
);

export const scaleIn = (delay: string = '0ms') => sequence([
  animate(`500ms ${ delay } ease-in-out`, keyframes([
    style({ opacity: 0, transform: 'scale(2', offset: 0 }),
    style({ opacity: 1, transform: 'scale(1)', offset: 1 })
  ]))
]);

export const slideInX = trigger('slideInX', [
  transition(':enter', [
      style({ transform: 'translateX({{translate}})', opacity: 0 }),
      animate('{{duration}} {{delay}} ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
    ], { params: { translate: '-2000px', duration: '1500ms', delay: '0ms' } }
  )
]);

export const slideInY = trigger('slideInY', [
  transition(':enter', [
      style({ transform: 'translateY({{translate}})', opacity: 0 }),
      animate('{{duration}} {{delay}} ease-in-out', style({ transform: 'translateY(0)', opacity: 1 }))
    ], { params: { translate: '-2000px', duration: '1500ms', delay: '0ms' } }
  )
]);

export const fade = trigger('fade', [
  state('open', style({ opacity: 0, zIndex: -1 })),
  state('close', style({ opacity: 1 })),
  transition('open <=> close', animate('{{duration}} ease-in-out'), {
    params: {
      duration: '1000ms'
    }
  })
]);

export const fadeInOut = trigger('fadeInOut', [
  state('in',
    style({ opacity: 1 })
  ),
  transition('void => *', [
    style({ opacity: 0 }),
    animate('500ms ease-in-out')
  ]),
  transition('* => void', [
    animate('500ms ease-in-out',
      style({ opacity: 0 })
    )
  ])
]);

export const colorChange = trigger('colorChange', [
  state('open', style({ backgroundColor: 'rgb({{backgroundColor}})', color: '#000' }), {
    params: {
      backgroundColor: '101, 247, 204'
    }
  }),
  state('close', style({ backgroundColor: 'rgba({{backgroundColor}}, 0.2)', color: '#fff' }), {
    params: {
      backgroundColor: '101, 247, 204'
    }
  }),
  transition('* <=> *', [
    group([
      query('@colorChangeChild', animateChild()),
      animate('1000ms ease-in-out'),
    ]),
  ])
]);

export const colorChangeChild = trigger('colorChangeChild', [
  state('open', style({ opacity: 1 })),
  state('close', style({ opacity: 0.2 })),
  transition('* => *', animate('1000ms ease-in-out'))
]);

export const leftRight = trigger('leftRight', [
  state('open', style({ opacity: 0, transform: 'translateX({{translate}})' }), { params: { translate: '-100%' } }),
  state('close', style({ opacity: 1, transform: 'translateX(0)' })),
  transition('open => close', animate('{{duration}} {{delay}} ease-in-out'), {
    params: {
      duration: '500ms',
      delay: '0ms'
    }
  }),
  transition('close => open', animate('{{duration}} {{delayOut}} ease-in-out'), {
    params: {
      duration: '500ms',
      delayOut: '0ms'
    }
  })
]);

export const bottomTop = trigger('bottomTop', [
  state('open', style({ opacity: 0, transform: 'translateY({{translate}})' }), {
    params: {
      translate: '100%'
    }
  }),
  state('close', style({ opacity: 1, transform: 'translateX(0)' })),
  transition('open => close', animate('500ms {{delayIn}} ease-in-out'),
    { params: { delayIn: '0ms' } }
  ),
  transition('close => open', animate('500ms {{delayOut}} ease-in-out'),
    { params: { delayOut: '0ms' } }
  )
]);

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
        animate('2000ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]
    ),
    transition(
      ':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('1000ms', style({ transform: 'translateX(100%)', opacity: 0 }))
      ]
    )]
);

export const stampAnimation = trigger(
  'stampAnimation',
  [
    transition(
      ':enter', [
        style({ transform: 'scale(5) rotate({{deg}}deg)' }),
        animate('500ms', style({ transform: 'scale(1) rotate({{deg}}deg)' }))
      ], { params: { deg: 0 } }
    )]
);

export const insertItemList = trigger('list', [
  transition(':enter', [
    // child animation selector + stagger
    query('@items',
      stagger('300ms', animateChild())
    )
  ]),
]);

export const addRemoveItemList = trigger('items', [
  // cubic-bezier for a tiny bouncing feel
  transition(':enter', [
    style({ transform: 'scale(0.5)', opacity: 0 }),
    animate('1000ms cubic-bezier(.8,-0.6,0.2,1.5)',
      style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ transform: 'scale(1)', opacity: 1, height: '*' }),
    animate('1000ms cubic-bezier(.8,-0.6,0.2,1.5)',
      style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
  ]),
]);

export const goTo = (elementId: string | HTMLElement): boolean => {
  let element;
  if (typeof elementId === 'string') {
    element = document.getElementById(elementId);
  } else {
    element = elementId;
  }

  element?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

  return true;
};

export const observeElement = (animationState: BehaviorSubject<'open' | 'close'>, el?: HTMLElement | Element | null,
                               reopen: boolean = false, threshold: number = 1): IntersectionObserver | undefined => {
  let observer: IntersectionObserver | undefined;
  if (el) {
    const rootMargin = '0px';
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationState.next('close');
            if (!reopen) {
              observer?.disconnect();
            }
          } else {
            animationState.next('open');
          }
        });
      }, { threshold, rootMargin }
    );
    observer.observe(el);
  }

  return observer;
};
