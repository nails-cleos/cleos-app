import { BehaviorSubject } from 'rxjs';
import { ITreatmentGroup } from './treatment';

export interface ISlide {
  image: string;
  description?: string;
}

export interface ISocialLink {
  name: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK';
  delay: string;
  href: string;
  phone?: string;
  phoneKey?: string;
  phoneText?: string;
  svgIcon: 'WHATSAPP-NO-COLOR' | 'WHATSAPP' | 'INSTAGRAM-NO-COLOR' | 'INSTAGRAM' | 'FACEBOOK-NO-COLOR' | 'FACEBOOK';
}

export interface IAnimation {
  id: string;
  state: BehaviorSubject<'open' | 'close'>;
  delay: string;
  text: string;
}

export type IStory = IAnimation;

export interface IWork {
  image: string;
  title: string;
  detail?: string;
  group: ITreatmentGroup;
}

export interface IExperience extends IAnimation {
  delayOut: string;
  icon: string;
  position: string;
}
