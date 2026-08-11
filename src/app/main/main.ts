import { WritableSignal } from '@angular/core';

export interface ISlide {
  id: string;
  image: any;
  description?: string;
  order: number;
}

export interface ISocialLink {
  name: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK';
  delay: string;
  href: string;
  phone?: string;
  phoneKey?: string;
  phoneText?: string;
  svgIcon:
    | 'WHATSAPP-NO-COLOR'
    | 'WHATSAPP'
    | 'INSTAGRAM-NO-COLOR'
    | 'INSTAGRAM'
    | 'FACEBOOK-NO-COLOR'
    | 'FACEBOOK';
}

export interface IAnimation {
  id: string;
  state: WritableSignal<'open' | 'close'>;
  delay: string;
  text: string;
}

export type IStory = IAnimation;

export interface IWork {
  id: string;
  image: string;
  title: string;
  detail?: string;
  groupId?: string;
}

export interface IExperience extends IAnimation {
  delayOut: string;
  icon: string;
  position: string;
}
