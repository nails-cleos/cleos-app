import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MainState } from '../../store/reducers/main.reducers';
import { MainTreatmentComponent } from './main-treatment.component';
import { IBiabTreatmentTranslations, IMainTreatmentContent } from '../../util/MainTreatment';
import { TranslateLoaderFactory } from '../../shared/translate-loader.factory';

describe('MainTreatmentComponent', () => {
  let component: MainTreatmentComponent;
  let fixture: ComponentFixture<MainTreatmentComponent>;

  let lang$: BehaviorSubject<string | undefined>;

  let storeSpy: jasmine.SpyObj<Store<MainState>>;

  const createTranslations = (overrides: Partial<IBiabTreatmentTranslations> = {}): IBiabTreatmentTranslations => {
    const defaults: IBiabTreatmentTranslations = {
      heroTitle: 'heroTitle',
      introLead: 'introLead',
      introBridge: 'introBridge',
      comparisonLead: 'comparisonLead',
      whyBestTitle: 'whyBestTitle',
      assessmentText: 'assessmentText',
      benefitsText: 'benefitsText',
      summaryLabel: 'summaryLabel',
      standardsLead: 'standardsLead',
      standardsItems: ['standardsItems1', 'standardsItems2', 'standardsItems3'],
      ctaTitle: 'ctaTitle',
      advantagesTitle: 'advantagesTitle',
      advantagesIntro: 'advantagesIntro',
      productConfidenceText: 'productConfidenceText',
      essenceLabel: 'essenceLabel',
      veganBenefitText: 'veganBenefitText',
      paletteText: 'paletteText',
      paletteLeadIn: 'paletteLeadIn',
      paletteCallout: 'paletteCallout',
      hemaFreeText: 'hemaFreeText',
      frequencyReminderText: 'frequencyReminderText',
      maintenanceTitle: 'maintenanceTitle',
      maintenanceText: 'maintenanceText',
      maintenanceCareTitle: 'maintenanceCareTitle',
      maintenanceCareItems: [
        'maintenanceCareItems1',
        'maintenanceCareItems2',
        'maintenanceCareItems3',
        'maintenanceCareItems4',
        'maintenanceCareItems5',
      ],
      growthExampleTitle: 'growthExampleTitle',
      growthExampleCaption: 'growthExampleCaption',
      growthExampleText: 'growthExampleText',
      restQuestionTitle: 'restQuestionTitle',
      restQuestionIntro: 'restQuestionIntro',
      restQuestionCallout: 'restQuestionCallout',
      restQuestionServiceProof: 'restQuestionServiceProof',
      restQuestionDeepDive: 'restQuestionDeepDive',
      restQuestionAnswer: 'restQuestionAnswer',
      restQuestionTransition: 'restQuestionTransition',
      restQuestionWhyTitle: 'restQuestionWhyTitle',
      restQuestionWhyText: 'restQuestionWhyText',
      restQuestionWarning: 'restQuestionWarning',
      comparisonTable: {
        columns: {
          biab: 'comparisonTable.columns.biab',
          regularGels: 'comparisonTable.columns.regularGels',
          acrylic: 'comparisonTable.columns.acrylic',
        },
        rows: [
          { label: 'row1', biab: 'row1-biab', regularGels: 'row1-regularGels', acrylic: 'row1-acrylic' },
          { label: 'row2', biab: 'row2-biab', regularGels: 'row2-regularGels', acrylic: 'row2-acrylic' },
          { label: 'row3', biab: 'row3-biab', regularGels: 'row3-regularGels', acrylic: 'row3-acrylic' },
          { label: 'row4', biab: 'row4-biab', regularGels: 'row4-regularGels', acrylic: 'row4-acrylic' },
          { label: 'row5', biab: 'row5-biab', regularGels: 'row5-regularGels', acrylic: 'row5-acrylic' },
          { label: 'row6', biab: 'row6-biab', regularGels: 'row6-regularGels', acrylic: 'row6-acrylic' },
          { label: 'row7', biab: 'row7-biab', regularGels: 'row7-regularGels', acrylic: 'row7-acrylic' },
          { label: 'row8', biab: 'row8-biab', regularGels: 'row8-regularGels', acrylic: 'row8-acrylic' },
          { label: 'row9', biab: 'row9-biab', regularGels: 'row9-regularGels', acrylic: 'row9-acrylic' },
          { label: 'row10', biab: 'row10-biab', regularGels: 'row10-regularGels', acrylic: 'row10-acrylic' },
        ],
      },
    };

    return { ...defaults, ...overrides };
  };

  const createTreatments = (): IMainTreatmentContent[] => ([
    { id: 'biab-treatment', translations: createTranslations() },
  ]);

  const createComponent = (): void => {
    fixture = TestBed.createComponent(MainTreatmentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'biab-treatment');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    lang$ = new BehaviorSubject<string | undefined>('en-GB');

    storeSpy = jasmine.createSpyObj<Store<MainState>>('Store', ['pipe', 'dispatch']);
    (storeSpy.pipe as any).and.returnValue(lang$.asObservable());

    spyOn(TranslateLoaderFactory, 'loadJson').and.returnValue(of({
      treatments: [],
    }) as any);

    await TestBed.configureTestingModule({
      imports: [MainTreatmentComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(storeSpy.pipe).toHaveBeenCalled();
    expect(TranslateLoaderFactory.loadJson).toHaveBeenCalledWith('treatment/main', 'en-GB');
  });

  it('should return sections when treatment id exists in translations', () => {
    (TranslateLoaderFactory.loadJson as jasmine.Spy).and.returnValue(of({
      treatments: createTreatments(),
    }) as any);

    createComponent();
    fixture.detectChanges();

    expect(component.sections()).toBeDefined();
    expect((component.sections() ?? []).length).toBeGreaterThan(0);
  });

  it('should request localized treatment content when language changes', () => {
    createComponent();
    (TranslateLoaderFactory.loadJson as jasmine.Spy).calls.reset();

    lang$.next('nl');
    fixture.detectChanges();

    expect(TranslateLoaderFactory.loadJson).toHaveBeenCalledWith('treatment/main', 'nl');
  });

  it('should return undefined sections when treatment id is unknown', () => {
    (TranslateLoaderFactory.loadJson as jasmine.Spy).and.returnValue(of({
      treatments: createTreatments(),
    }) as any);

    createComponent();
    fixture.componentRef.setInput('id', 'unknown');
    fixture.detectChanges();

    expect(component.sections()).toBeUndefined();
  });
});
