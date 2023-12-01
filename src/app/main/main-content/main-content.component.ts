import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ITreatment, ITreatmentGroup } from '../../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ICatalogue, ISlide } from '../../interfaces/catalogue';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { Store } from '@ngrx/store';
import { AppState, selectMainState } from '../../store/app.states';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filterDateRoom, getNow, plusMonthDate } from '../../util/dates';
import { MAX_RESERVATION_CUSTOMER_MONTH } from '../../interfaces/reservation';
import * as fromActionsMain from '../../store/main.actions';
import { AuthUserService } from '../../services/auth-user.service';
import {
  bottomTop,
  bounceInDownAnimation,
  fadeInUpDown,
  gelatine,
  leftRight,
  observeElement,
  rubberBand,
  scaleIn,
  slideInX,
  slideInY
} from '../../util/animation';
import { AnimationAnimateMetadata, AnimationSequenceMetadata } from '@angular/animations';
import { isMobile } from '../../util/helper';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface ISocialLink {
  name: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK';
  delay: string;
  href: string;
  svgIcon: 'WHATSAPP-NO-COLOR' | 'WHATSAPP' | 'INSTAGRAM-NO-COLOR' | 'INSTAGRAM' | 'FACEBOOK-NO-COLOR' | 'FACEBOOK';
}

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  animations: [bottomTop, leftRight, slideInX, slideInY]
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('treatmentItem', { static: false }) private serviceItem?: ElementRef<HTMLDivElement>;
  @ViewChild('teamItem', { static: false }) private teamItem?: ElementRef<HTMLDivElement>;
  @ViewChild('factItem1', { static: false }) private factItem1?: ElementRef<HTMLDivElement>;
  @ViewChild('factItem2', { static: false }) private factItem2?: ElementRef<HTMLDivElement>;
  @ViewChild('factItem3', { static: false }) private factItem3?: ElementRef<HTMLDivElement>;
  @ViewChild('factItem4', { static: false }) private factItem4?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem1', { static: false }) private contactItem1?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem2', { static: false }) private contactItem2?: ElementRef<HTMLDivElement>;
  @ViewChild('contactItem3', { static: false }) private contactItem3?: ElementRef<HTMLDivElement>;

  treatmentItemState: BehaviorSubject<'open' | 'close'>;
  teamItemState: BehaviorSubject<'open' | 'close'>;
  factItem1State: BehaviorSubject<'open' | 'close'>;
  factItem2State: BehaviorSubject<'open' | 'close'>;
  factItem3State: BehaviorSubject<'open' | 'close'>;
  factItem4State: BehaviorSubject<'open' | 'close'>;
  contactItem1State: BehaviorSubject<'open' | 'close'>;
  contactItem2State: BehaviorSubject<'open' | 'close'>;
  contactItem3State: BehaviorSubject<'open' | 'close'>;

  treatmentTitle: AnimationAnimateMetadata;
  teamTitle: AnimationSequenceMetadata;
  storyText: AnimationSequenceMetadata;
  factTitle: AnimationSequenceMetadata;
  contactTitle: AnimationSequenceMetadata;
  contactText: AnimationSequenceMetadata;
  contactMap: AnimationAnimateMetadata;
  isSmall: boolean;
  isDark: boolean;
  isHandset: any;
  slides: ISlide[] = [];

  form!: UntypedFormGroup;
  groups: ITreatmentGroup[] | undefined;
  filteredGroup: Observable<ITreatmentGroup[] | undefined> | undefined;
  group: UntypedFormControl = new UntypedFormControl('', [requireMatch]);
  treatments: ITreatment[] | undefined;
  filteredTreatment: Observable<ITreatment[] | undefined> | undefined;
  treatment: UntypedFormControl = new UntypedFormControl('', [requireMatch]);

  maxDate: Date;
  minDate: Date;
  date: UntypedFormControl = new UntypedFormControl();

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

  imageObject: Array<object> = [];
  noImages: Array<object> = [
    {
      image: 'assets/home_page/img/banner.jpg',
      thumbImage: 'assets/home_page/img/banner.jpg'
    }, {
      image: 'assets/home_page/img/parallax/city.jpg',
      thumbImage: 'assets/home_page/img/parallax/city.jpg'
    }
  ];
  socialLinks: ISocialLink[] = [{
    name: 'WHATSAPP',
    delay: '1000ms',
    href: `https://api.whatsapp.com/send?phone=${ this.translate.instant('MAIN.CONTACT.PHONE') }
    &text=${ this.translate.instant('MAIN.CONTACT.SEND.HELLO') }`,
    svgIcon: 'WHATSAPP-NO-COLOR'
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

  private isAuthenticated = false;
  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private getState: Observable<any>;

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef, private viewportScroller: ViewportScroller,
              private translate: TranslateService, private router: Router, private formBuilder: UntypedFormBuilder,
              private snackBar: MatSnackBar, private authUserService: AuthUserService, private breakpointObserver: BreakpointObserver) {
    this.isSmall = isMobile();
    this.isDark = false;

    this.treatmentTitle = bounceInDownAnimation('500ms');
    this.teamTitle = fadeInUpDown('20px', '700ms');
    this.storyText = gelatine;
    this.factTitle = rubberBand;
    this.treatmentItemState = new BehaviorSubject<'open' | 'close'>('open');
    this.teamItemState = new BehaviorSubject<'open' | 'close'>('open');
    this.factItem1State = new BehaviorSubject<'open' | 'close'>('open');
    this.factItem2State = new BehaviorSubject<'open' | 'close'>('open');
    this.factItem3State = new BehaviorSubject<'open' | 'close'>('open');
    this.factItem4State = new BehaviorSubject<'open' | 'close'>('open');
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
    this.minDate = getNow();
    this.maxDate = plusMonthDate(this.minDate, MAX_RESERVATION_CUSTOMER_MONTH, this.minDate.getDate() + 1);

    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => this.isSmall = result.matches);
  }

  get book(): void {
    const data = { date: this.date.value, treatment: { id: this.treatment.value.id } };
    this.router.navigate(['me', 'reservation'], { state: data });
    return;
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

    this.filteredGroup = this.group.valueChanges.pipe(startWith(''), map(value => {
      if (typeof value === 'string') {
        return value;
      }
      this.treatments = value.treatments;
      this.treatment.setValue('');
      return value.name;
    }), map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups));
    this.filteredTreatment = this.treatment.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterTreatment(name) : this.treatments ? this.treatments.slice() : this.treatments)
    );
    this.cdRef.detectChanges();
  }

  ngAfterViewInit(): void {
    observeElement(this.treatmentItemState, this.serviceItem?.nativeElement, !this.isSmall);
    observeElement(this.teamItemState, this.teamItem?.nativeElement, !this.isSmall, 0.1);
    observeElement(this.factItem1State, this.factItem1?.nativeElement, !this.isSmall);
    observeElement(this.factItem2State, this.factItem2?.nativeElement, !this.isSmall);
    observeElement(this.factItem3State, this.factItem3?.nativeElement, !this.isSmall);
    observeElement(this.factItem4State, this.factItem4?.nativeElement, !this.isSmall);
    observeElement(this.contactItem1State, this.contactItem1?.nativeElement, !this.isSmall);
    observeElement(this.contactItem2State, this.contactItem2?.nativeElement, !this.isSmall);
    observeElement(this.contactItem3State, this.contactItem3?.nativeElement, !this.isSmall);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  setTreatmentAnimation(i: number): AnimationSequenceMetadata {
    return scaleIn(`${ i * (this.isSmall ? 0 : 300) }ms`);
  }

  onHover(social: ISocialLink, enter: boolean): void {
    const suffix = enter ? '' : '-NO-COLOR';
    social.svgIcon = `${ social.name }${ suffix }`;
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d);

  displayFnGroup(group: ITreatmentGroup): string {
    return group ? `${ group.name }` : '';
  }

  displayFnTreatment(treatment: ITreatment): string {
    return treatment ? `${ treatment.name }` : '';
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  keyDownGroup(event: any): void {
    this.treatments = undefined;
    this.keyDownHandler(event, this.treatment);
    this.keyDownHandler(event, this.group);
  }

  setGroup(group: ITreatmentGroup): void {
    this.group.setValue(group);
  }

  setTreatment(treatment: ITreatment): void {
    this.treatment.setValue(treatment);
    this.viewportScroller.scrollToAnchor('book');
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      email: this.email,
      subject: this.subject,
      body: this.body
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.groups) {
        this.groups = state.groups;
      }
      if (state.catalogue && Array.from(state.catalogue)) {
        state.catalogue.forEach((value: ICatalogue) => {
          if (value && value.blob) {
            // const slide = new Slide(`data:image/jpg;base64,${ value.blob }`);
            const img = `data:image/jpg;base64,${ value.blob }`;
            this.imageObject?.push({ image: img, thumbImage: img });
          }
        });
      }
      if (state.errorMessage || state.message) {
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
      }
    });
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

  private filterGroup(name: string): ITreatmentGroup[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterTreatment(name: string): ITreatment[] | undefined {
    const filterValue = name.toLowerCase();

    return this.treatments?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
