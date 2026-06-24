import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ITreatmentGroupAll } from '../../treatment/treatment';
import { IExperience, ISlide, ISocialLink, IStory, IWork } from '../main';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthUserService } from '../../services/auth-user.service';
import { goTo, observeElementSignal } from '../../util/animation';
import { isMobile } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { BottomSheetBookAppointmentComponent } from './bottom-sheet-book-appointment';
import { toSignal } from '@angular/core/rxjs-interop';
import { ISendMessage } from '../../../main';
import { EnvService } from '../../services/env.service';
import { ICatalogueAll } from '../../catalogue/catalogue';
import { getImage } from '../../util/file';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { NgClass, NgStyle } from '@angular/common';
import { CardListSkeletonComponent } from '../../shared/skeleton/card-list-skeleton.component';
import { CatalogueStore } from '../../store/catalogue.store';
import { MainStore } from '../../store/main.store';
import { MainContentService } from '../../services/main-content.service';

type MainForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  subject: FormControl<string>;
  body: FormControl<string>;
}

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe,
    NgClass, MatError, NgStyle, MatPrefix, MatHint, MatFabButton, CardListSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContentComponent {
  private static readonly BIAB_TREATMENT_ID = 'biab-treatment';

  private readonly catalogueStore = inject(CatalogueStore);
  private readonly mainStore = inject(MainStore);
  private readonly mainContent = inject(MainContentService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly env: EnvService = inject(EnvService);

  private treatmentItem = viewChild<ElementRef<HTMLDivElement>>('treatmentItem');
  private treatmentTitle = viewChild<ElementRef<HTMLDivElement>>('treatmentTitle');
  private workSubTitle = viewChild<ElementRef<HTMLDivElement>>('workSubTitle');
  private experienceTitle = viewChild<ElementRef<HTMLDivElement>>('experienceTitle');
  private storyTitle = viewChild<ElementRef<HTMLDivElement>>('storyTitle');
  private storyDescription = viewChild<ElementRef<HTMLDivElement>>('storyDescription');
  private storyMember = viewChild<ElementRef<HTMLDivElement>>('storyMember');
  private contactTitle = viewChild<ElementRef<HTMLDivElement>>('contactTitle');
  private contactText = viewChild<ElementRef<HTMLDivElement>>('contactText');
  private contactMap = viewChild<ElementRef<HTMLDivElement>>('contactMap');
  private contactItem1 = viewChild<ElementRef<HTMLDivElement>>('contactItem1');
  private contactItem2 = viewChild<ElementRef<HTMLDivElement>>('contactItem2');
  private contactItem3 = viewChild<ElementRef<HTMLDivElement>>('contactItem3');

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private authUserSignal = this.authUserService.authUser;
  private responseSignal = this.mainStore.response;
  private errorSignal = this.mainStore.error;
  private catalogueSignal = this.catalogueStore.data;
  private isLoadingSignal = this.mainStore.isLoading;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  isSmall = computed(() => this.breakpointsSignal()?.matches ?? isMobile());
  isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);
  isCatalogueLoading = computed(() => this.isLoadingSignal());

  treatmentItemState = signal<'open' | 'close'>('open');
  treatmentTitleState = signal<'open' | 'close'>('open');
  workSubTitleState = signal<'open' | 'close'>('open');
  experienceTitleState = signal<'open' | 'close'>('open');
  storyTitleState = signal<'open' | 'close'>('open');
  storyDescriptionState = signal<'open' | 'close'>('open');
  storyMemberState = signal<'open' | 'close'>('open');
  contactTitleState = signal<'open' | 'close'>('open');
  contactTextState = signal<'open' | 'close'>('open');
  contactMapState = signal<'open' | 'close'>('open');
  contactItem1State = signal<'open' | 'close'>('open');
  contactItem2State = signal<'open' | 'close'>('open');
  contactItem3State = signal<'open' | 'close'>('open');
  groups = signal<ITreatmentGroupAll[]>([]);
  filter = signal<ITreatmentGroupAll | undefined>(undefined);

  title = this.env.title;

  form: FormGroup<MainForm> = this.formBuilder.group<MainForm>({
    name: this.formBuilder.control('', { validators: [Validators.required] }),
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    subject: this.formBuilder.control('', { validators: [Validators.required] }),
    body: this.formBuilder.control('', { validators: [Validators.required] }),
  });

  slides: ISlide[] = [
    { id: 'c7ae73b1-c6be-4848-9f84-cbf451e8ee59', image: 'assets/home_page/img/b1.webp', order: 0 },
    { id: '3e989461-81b2-4723-9fa3-746c05fd69a2', image: 'assets/home_page/img/b2.webp', order: 1 },
    { id: '25e33d58-34c3-4e55-b4e4-885f177fb570', image: 'assets/home_page/img/b3.webp', order: 2 },
  ];
  socialLinks: ISocialLink[] = [
    {
      name: 'WHATSAPP',
      delay: '1000ms',
      href: 'https://api.whatsapp.com/send?phone=',
      svgIcon: 'WHATSAPP-NO-COLOR',
      phone: 'MAIN.CONTACT.SEND.PHONE',
      phoneKey: '&text=',
      phoneText: 'MAIN.CONTACT.SEND.HELLO',
    }, {
      name: 'INSTAGRAM',
      delay: '1100ms',
      href: 'https://www.instagram.com/carlanailscleos.nl/',
      svgIcon: 'INSTAGRAM-NO-COLOR',
    }, {
      name: 'FACEBOOK',
      delay: '1200ms',
      href: 'https://www.facebook.com/carlanailscleos.nl/',
      svgIcon: 'FACEBOOK-NO-COLOR',
    },
  ];

  allWorks = computed<IWork[]>(() => (this.catalogueSignal() ?? []).map(it => this.mapToWork(it))
    .filter(it => it !== undefined));

  works = computed(() => {
    const all = this.allWorks() ?? [];
    const group = this.filter();

    if (!group) {
      return all;
    }

    return all.filter(work => work.groupId === group.id);
  });

  experiences: IExperience[] = [
    {
      id: 'experienceItem1',
      state: signal<'open' | 'close'>('open'),
      delay: '0ms',
      delayOut: '900ms',
      icon: 'waving_hand',
      position: '1°',
      text: 'MAIN.EXPERIENCE.TEXT_1',
    }, {
      id: 'experienceItem2',
      state: signal<'open' | 'close'>(this.isSmall() ? 'open' : 'open'), // initial 'open'
      delay: this.isSmall() ? '0ms' : '300ms',
      delayOut: '600ms',
      icon: 'coffee',
      position: '2°',
      text: 'MAIN.EXPERIENCE.TEXT_2',
    }, {
      id: 'experienceItem3',
      state: signal<'open' | 'close'>(this.isSmall() ? 'open' : 'open'),
      delay: this.isSmall() ? '0ms' : '600ms',
      delayOut: '300ms',
      icon: 'palette',
      position: '3°',
      text: 'MAIN.EXPERIENCE.TEXT_3',
    }, {
      id: 'experienceItem4',
      state: signal<'open' | 'close'>(this.isSmall() ? 'open' : 'open'),
      delay: this.isSmall() ? '0ms' : '900ms',
      delayOut: '0ms',
      icon: 'mood',
      position: '4°',
      text: 'MAIN.EXPERIENCE.TEXT_4',
    },
  ];

  stories: IStory[] = [
    { id: 'storyItem1', state: signal<'open' | 'close'>('open') as any, delay: '100ms', text: 'MAIN.STORY.TEXT_1' },
    { id: 'storyItem2', state: signal<'open' | 'close'>('open') as any, delay: '200ms', text: 'MAIN.STORY.TEXT_2' },
    { id: 'storyItem3', state: signal<'open' | 'close'>('open') as any, delay: '300ms', text: 'MAIN.STORY.TEXT_3' },
    { id: 'storyItem4', state: signal<'open' | 'close'>('open') as any, delay: '400ms', text: 'MAIN.STORY.TEXT_4' },
    { id: 'storyItem5', state: signal<'open' | 'close'>('open') as any, delay: '500ms', text: 'MAIN.STORY.TEXT_5' },
  ];

  currentIndex = signal(0);
  sliderTransform = computed(() => `translateX(-${ this.currentIndex() * 100 }%)`);

  private readonly sliderIntervalMs = 5000;

  constructor() {
    this.mainContent.configure(false, 'close', true);
    this.mainStore.clean();
    this.catalogueStore.getAllHome();
    effect(() => {
      const error = this.errorSignal();
      if (error?.message) {
        this.toastService.show(error.message, 'error');
      }
    });

    effect(() => {
      const response = this.responseSignal();
      if (response?.message) {
        this.toastService.show(response.message, response.toastType);
      }
    });

    effect(() => {
      const authUser = this.authUserSignal();
      if (authUser) {
        this.getForm.email.setValue(authUser.email ?? '');
        this.getForm.name.setValue(authUser.displayName ?? '');
      }
    });

    effect(() => {
      const treatments = this.translate.instant('TREATMENTS');
      const groups = Array.isArray(treatments) ? treatments : [];
      this.groups.set(groups);
    });

    effect((onCleanup) => {
      const tEl = this.treatmentItem()?.nativeElement;
      if (tEl) {
        const obs = observeElementSignal(this.treatmentItemState, tEl, !this.isSmall());
        onCleanup(() => obs?.disconnect());
      }

      const ttEl = this.treatmentTitle()?.nativeElement;
      if (ttEl) {
        const obs = observeElementSignal(this.treatmentTitleState, ttEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const wsEl = this.workSubTitle()?.nativeElement;
      if (wsEl) {
        const obs = observeElementSignal(this.workSubTitleState, wsEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const etEl = this.experienceTitle()?.nativeElement;
      if (etEl) {
        const obs = observeElementSignal(this.experienceTitleState, etEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const stEl = this.storyTitle()?.nativeElement;
      if (stEl) {
        const obs = observeElementSignal(this.storyTitleState, stEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const sdEl = this.storyDescription()?.nativeElement;
      if (sdEl) {
        const obs = observeElementSignal(this.storyDescriptionState, sdEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const smEl = this.storyMember()?.nativeElement;
      if (smEl) {
        const obs = observeElementSignal(this.storyMemberState, smEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const ctEl = this.contactTitle()?.nativeElement;
      if (ctEl) {
        const obs = observeElementSignal(this.contactTitleState, ctEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const cTextEl = this.contactText()?.nativeElement;
      if (cTextEl) {
        const obs = observeElementSignal(this.contactTextState, cTextEl, !this.isSmall(), 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const cMapEl = this.contactMap()?.nativeElement;
      if (cMapEl) {
        const obs = observeElementSignal(this.contactMapState, cMapEl, false, 0.1);
        onCleanup(() => obs?.disconnect());
      }

      const c1 = this.contactItem1()?.nativeElement;
      if (c1) {
        const obs = observeElementSignal(this.contactItem1State, c1, !this.isSmall());
        onCleanup(() => obs?.disconnect());
      }

      const c2 = this.contactItem2()?.nativeElement;
      if (c2) {
        const obs = observeElementSignal(this.contactItem2State, c2, !this.isSmall());
        onCleanup(() => obs?.disconnect());
      }

      const c3 = this.contactItem3()?.nativeElement;
      if (c3) {
        const obs = observeElementSignal(this.contactItem3State, c3, !this.isSmall());
        onCleanup(() => obs?.disconnect());
      }

      this.experiences.forEach((it) => {
        const el = document.getElementById(it.id);
        if (el) {
          const obs = observeElementSignal(it.state, el, !this.isSmall());
          onCleanup(() => obs?.disconnect());
        }
      });

      this.stories.forEach((it) => {
        const el = document.getElementById(it.id);
        if (el) {
          const obs = observeElementSignal(it.state, el, !this.isSmall());
          onCleanup(() => obs?.disconnect());
        }
      });
    });

    effect((onCleanup) => {
      if (this.slides.length < 2) {
        return;
      }

      const timerId = window.setInterval(() => this.moveForwardSlide(), this.sliderIntervalMs);
      onCleanup(() => window.clearInterval(timerId));
    });
  }

  get getForm(): MainForm {
    return this.form.controls;
  }

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetBookAppointmentComponent, {
      panelClass: 'app-surface-bottom-sheet-panel',
    });
  }

  sendEmail(): void {
    if (!this.form.invalid) {
      const sendMessageData: ISendMessage = {
        name: this.getForm.name.value,
        email: this.getForm.email.value,
        subject: this.getForm.subject.value,
        body: this.getForm.body.value,
      };
      this.mainStore.create(sendMessageData);
    }
  }

  isCurrentSlideIndex = (index: number): boolean => this.currentIndex() === index;

  goToTreatment = (name?: string): void => {
    const treatmentId = name === 'biab' ? MainContentComponent.BIAB_TREATMENT_ID : name;
    if (treatmentId === MainContentComponent.BIAB_TREATMENT_ID) {
      goTo('home');
      this.router.navigate([this.translate.getCurrentLang(), 'home', treatmentId, 'treatment']);
    }
  };

  onHover = (social: ISocialLink, enter: boolean): void => {
    const suffix = enter ? '' : '-NO-COLOR';
    social.svgIcon = `${ social.name }${ suffix }`;
  };

  filterBy = (group?: ITreatmentGroupAll): void => {
    this.filter.set(group);
  };

  private moveForwardSlide = (): void => {
    // update currentIndex signal
    const idx = this.currentIndex();
    const next = idx === this.slides.length - 1 ? 0 : idx + 1;
    this.currentIndex.set(next);
  };

  private mapToWork = (it: ICatalogueAll): IWork | undefined => {
    if (!it.id) {
      return undefined;
    }
    return {
      id: it.id,
      image: getImage(it.blob, it.contentType),
      title: it.name,
      detail: it.description,
      groupId: it.group?.name?.trim().toLowerCase().replace(/\s+/g, '-'),
    };
  };
}
