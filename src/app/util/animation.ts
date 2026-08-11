import { WritableSignal } from '@angular/core';

export const goTo = (elementId: string | HTMLElement): void => {
  let element;
  if (typeof elementId === 'string') {
    element = document.getElementById(elementId);
  } else {
    element = elementId;
  }

  element?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
  });
};

export const observeElementSignal = (
  animationState: WritableSignal<'open' | 'close'>,
  el?: HTMLElement | Element | null,
  reopen: boolean = false,
  threshold: number = 1,
): IntersectionObserver | undefined => {
  let observer: IntersectionObserver | undefined;
  if (el) {
    const rootMargin = '0px';
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationState.set('close');
            if (!reopen) {
              observer?.disconnect();
            }
          } else {
            animationState.set('open');
          }
        });
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
  }
  return observer;
};
