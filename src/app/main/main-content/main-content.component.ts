import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { IExperience, ISlide, ISocialLink, IStory, IWork } from '../../interfaces/main';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectMainState } from '../../store/app.states';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromActionsMain from '../../store/main.actions';
import { AuthUserService } from '../../services/auth-user.service';
import {
  bottomTop,
  bounceInDownAnimation,
  fadeInOut,
  fadeInUpDown,
  gelatine,
  leftRight,
  observeElement,
  rubberBand,
  scaleIn,
  slideAnimation,
  slideInX,
  slideInY
} from '../../util/animation';
import { AnimationAnimateMetadata, AnimationSequenceMetadata } from '@angular/animations';
import { isMobile } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MainContentService } from '../main-content.service';
import { b64toBlob } from '../../util/file';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  animations: [bottomTop, leftRight, slideInX, slideInY, fadeInOut, slideAnimation]
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('treatmentItem', { static: false }) private serviceItem?: ElementRef<HTMLDivElement>;
  @ViewChild('storyDescription', { static: false }) private storyDescription?: ElementRef<HTMLDivElement>;
  @ViewChild('storyMember', { static: false }) private storyItem6?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem1', { static: false }) private contactItem1?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem2', { static: false }) private contactItem2?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem3', { static: false }) private contactItem3?: ElementRef<HTMLDivElement>;

  treatmentItemState: BehaviorSubject<'open' | 'close'>;
  storyDescriptionState: BehaviorSubject<'open' | 'close'>;
  storyMemberState: BehaviorSubject<'open' | 'close'>;
  contactItem1State: BehaviorSubject<'open' | 'close'>;
  contactItem2State: BehaviorSubject<'open' | 'close'>;
  contactItem3State: BehaviorSubject<'open' | 'close'>;

  treatmentTitle: AnimationAnimateMetadata;
  storyTitle: AnimationSequenceMetadata;
  workText: AnimationSequenceMetadata;
  experienceTitle: AnimationSequenceMetadata;
  contactTitle: AnimationSequenceMetadata;
  contactText: AnimationSequenceMetadata;
  contactMap: AnimationAnimateMetadata;
  isSmall: boolean;
  isDark: boolean;
  form!: UntypedFormGroup;
  groups: ITreatmentGroup[] | undefined;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  email: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, Validators.email
  ]);
  subject: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  body: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  // Images 768x1024
  slides: ISlide[] = [];
  socialLinks: ISocialLink[];
  works: IWork[] = [];
  allWorks: IWork[] = [];
  filter: BehaviorSubject<ITreatmentGroup | undefined>;
  experiences: IExperience[];
  stories: IStory[];
  currentIndex: number;

  private isAuthenticated = false;
  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private sliderSubscription?: Subscription;
  private filterSubscription?: Subscription;
  private getState: Observable<any>;

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef, private viewportScroller: ViewportScroller,
              private translate: TranslateService, private router: Router, private formBuilder: UntypedFormBuilder,
              private snackBar: MatSnackBar, private authUserService: AuthUserService, private breakpointObserver: BreakpointObserver,
              private mainContent: MainContentService) {
    this.currentIndex = 0;
    this.isSmall = isMobile();
    this.isDark = false;
    this.socialLinks = this.allSocialLinks();
    this.stories = this.allStories();
    this.experiences = this.allExperience();
    this.filter = new BehaviorSubject<ITreatmentGroup | undefined>(undefined);

    this.treatmentTitle = bounceInDownAnimation('500ms');
    this.storyTitle = fadeInUpDown('20px', '700ms');
    this.workText = gelatine;
    this.experienceTitle = rubberBand;
    this.treatmentItemState = new BehaviorSubject<'open' | 'close'>('open');
    this.storyDescriptionState = new BehaviorSubject<'open' | 'close'>('open');
    this.storyMemberState = new BehaviorSubject<'open' | 'close'>('open');
    this.contactItem1State = new BehaviorSubject<'open' | 'close'>('open');
    this.contactItem2State = new BehaviorSubject<'open' | 'close'>('open');
    this.contactItem3State = new BehaviorSubject<'open' | 'close'>('open');
    this.contactText = rubberBand;
    this.contactTitle = fadeInUpDown('20px', '500ms');
    this.contactMap = bounceInDownAnimation('500ms');


    this.getState = this.store.select(selectMainState);
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.isAuthenticated = value.isAuthenticated;
      if (this.isAuthenticated) {
        this.email.setValue(value.email);
        this.name.setValue(value.displayName);
      }
      this.isDark = value.isDarkMode;
    });

    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => this.isSmall = result.matches);
  }

  get sendEmail(): void {
    if (this.form.invalid) {
      return;
    }
    return this.store.dispatch(
      new fromActionsMain.SendMessage(this.form.value)
    );
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
    this.getCatalogues();
    this.getTreatments();
    this.cdRef.detectChanges();
    this.filterSubscription = this.filter.subscribe(group => {
      setTimeout(() => {
        if (group) {
          this.works = this.allWorks.filter(p => p.group.id === group.id);
        } else {
          this.works = this.allWorks;
        }
      }, 500);
    });
  }

  ngAfterViewInit(): void {
    observeElement(this.treatmentItemState, this.serviceItem?.nativeElement, !this.isSmall);
    observeElement(this.storyDescriptionState, this.storyDescription?.nativeElement, !this.isSmall, 0.1);
    observeElement(this.storyMemberState, this.storyItem6?.nativeElement, !this.isSmall, 0.1);
    observeElement(this.contactItem1State, this.contactItem1?.nativeElement, !this.isSmall);
    observeElement(this.contactItem2State, this.contactItem2?.nativeElement, !this.isSmall);
    observeElement(this.contactItem3State, this.contactItem3?.nativeElement, !this.isSmall);

    this.experiences.forEach(it => observeElement(it.state, document.getElementById(it.id), !this.isSmall));
    this.stories.forEach(it => observeElement(it.state, document.getElementById(it.id), !this.isSmall));

    this.automateSlider();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.sliderSubscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  isCurrentSlideIndex(index: number): boolean {
    return this.currentIndex === index;
  }

  setTreatmentAnimation(i: number): AnimationSequenceMetadata {
    return scaleIn(`${ i * (this.isSmall ? 0 : 300) }ms`);
  }

  onHover(social: ISocialLink, enter: boolean): void {
    const suffix = enter ? '' : '-NO-COLOR';
    social.svgIcon = `${ social.name }${ suffix }`;
  }

  filterBy(group?: ITreatmentGroup): void {
    this.works = [];
    this.filter?.next(group);
  }

  book(group: ITreatmentGroup): void {
    // const data = { date: this.date.value, treatment: { id: this.treatment.value.id } };
    // this.router.navigate(['me', 'reservation'], { state: data });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      email: this.email,
      subject: this.subject,
      body: this.body
    });
  }

  private automateSlider(): void {
    // let forward = true;
    this.sliderSubscription = interval(3000).subscribe(() => this.moveForwardSlide());
  }

  private moveForwardSlide(): void {
    if (this.slides?.length) {
      // Fade in
      if (this.currentIndex === this.slides.length - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }

      // Forward and backward
      // if (this.currentIndex === this.slides.length - 1) {
      //   forward = false;
      // }
      // if (this.currentIndex === 0 && !forward) {
      //   forward = true;
      // }
      // this.currentIndex = this.currentIndex + (forward ? +1 : -1);

      // Forward
      // if (this.currentIndex === this.slides.length - 1) {
      //   this.sliderSubscription?.unsubscribe();
      //   const back = interval(100).subscribe(() => {
      //     this.currentIndex--;
      //     if (this.currentIndex === 0) {
      //       back.unsubscribe();
      //       this.automateSlider();
      //     }
      //   });
      // } else {
      //   this.currentIndex++;
      // }
    }
  }

  private allSocialLinks(): ISocialLink[] {
    return [{
      name: 'WHATSAPP',
      delay: '1000ms',
      href: 'https://api.whatsapp.com/send?phone=',
      svgIcon: 'WHATSAPP-NO-COLOR',
      phone: 'MAIN.CONTACT.SEND.PHONE',
      phoneKey: '&text=',
      phoneText: 'MAIN.CONTACT.SEND.HELLO'
    }, {
      name: 'INSTAGRAM',
      delay: '1100ms',
      href: 'https://www.instagram.com/carlanailscleos.nl/',
      svgIcon: 'INSTAGRAM-NO-COLOR'
    }, {
      name: 'FACEBOOK',
      delay: '1200ms',
      href: 'https://www.facebook.com/carlanailscleos.nl/',
      svgIcon: 'FACEBOOK-NO-COLOR'
    }];
  }

  private allStories(): IStory[] {
    return [{
      id: 'storyItem1',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '100ms',
      text: 'MAIN.STORY.TEXT_1'
    }, {
      id: 'storyItem2',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '200ms',
      text: 'MAIN.STORY.TEXT_2'
    }, {
      id: 'storyItem3',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '300ms',
      text: 'MAIN.STORY.TEXT_3'
    }, {
      id: 'storyItem4',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '400ms',
      text: 'MAIN.STORY.TEXT_4'
    }, {
      id: 'storyItem5',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '500ms',
      text: 'MAIN.STORY.TEXT_5'
    }];
  }

  private allExperience(): IExperience[] {
    return [{
      id: 'experienceItem1',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: '0ms',
      delayOut: '900ms',
      icon: 'waving_hand',
      position: '1°',
      text: 'MAIN.EXPERIENCE.TEXT_1'
    }, {
      id: 'experienceItem2',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: this.isSmall ? '0ms' : '300ms',
      delayOut: '600ms',
      icon: 'coffee',
      position: '2°',
      text: 'MAIN.EXPERIENCE.TEXT_2'
    }, {
      id: 'experienceItem3',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: this.isSmall ? '0ms' : '600ms',
      delayOut: '300ms',
      icon: 'palette',
      position: '3°',
      text: 'MAIN.EXPERIENCE.TEXT_3'
    }, {
      id: 'experienceItem4',
      state: new BehaviorSubject<'open' | 'close'>('open'),
      delay: this.isSmall ? '0ms' : '900ms',
      delayOut: '0ms',
      icon: 'mood',
      position: '4°',
      text: 'MAIN.EXPERIENCE.TEXT_4'
    }];
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsMain.Clean()
    );
  }

  private getCatalogues(): void {
    this.store.dispatch(
      new fromActionsMain.GetAllCatalogue()
    );
  }

  private getTreatments(): void {
    this.store.dispatch(
      new fromActionsMain.GetAllTreatments()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.groups) {
        this.groups = state.groups;
        this.filter?.next(state.groups[0]);
      }
      if (state.catalogue && Array.from(state.catalogue) && !this.slides?.length) {
        state.catalogue.forEach((catalogue: ICatalogueAll) => {
          if (catalogue && catalogue.blob) {
            const blob = b64toBlob(catalogue.blob, catalogue.contentType);
            const image = URL.createObjectURL(blob);
            if (catalogue.home) {
              this.slides?.push({ image, description: catalogue.name });
            }
            if (catalogue.treatmentGroup) {
              this.works.push({
                title: catalogue.name,
                detail: catalogue.description,
                image,
                group: catalogue.treatmentGroup
              });
              this.allWorks = [...this.works];
            }
          }
        });
      }
      if (this.groups?.length && this.slides?.length && this.allWorks?.length) {
        this.mainContent.showPreload(false);
      }
      if (state.errorMessage || state.message) {
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (!this.slides?.length) {
          this.slides.push({ image: '../../assets/icons/icon-512x512.png' });
          this.slides.push({ image: '../../assets/home_page/img/b1.jpeg' });
          this.slides.push({ image: '../../assets/home_page/img/b2.jpeg' });
          this.slides.push({ image: '../../assets/home_page/img/b3.jpeg' });
          this.mainContent.showPreload(false);
        }
      }
    });
  }
}
