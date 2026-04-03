export interface ISection {
  type: 'title' | 'subtitle' | 'subsubtitle' | 'image' | 'image-detail' | 'image-text' | 'detail' | 'list' | 'enum'
    | 'divider' | 'table';
  value: string;
  width?: number;
  height?: number;
  details?: ISection[];
  class?: string;
  description?: string;
  alt?: string;
}

export interface IMainTreatmentComparisonRow {
  label: string;
  biab: string;
  regularGels: string;
  acrylic: string;
}

export interface IBiabTreatmentTranslations {
  heroTitle: string;
  introLead: string;
  introBridge: string;
  comparisonLead: string;
  whyBestTitle: string;
  assessmentText: string;
  benefitsText: string;
  summaryLabel: string;
  standardsLead: string;
  standardsItems: string[];
  ctaTitle: string;
  advantagesTitle: string;
  advantagesIntro: string;
  productConfidenceText: string;
  essenceLabel: string;
  veganBenefitText: string;
  paletteText: string;
  paletteLeadIn: string;
  paletteCallout: string;
  hemaFreeText: string;
  frequencyReminderText: string;
  maintenanceTitle: string;
  maintenanceText: string;
  maintenanceCareTitle: string;
  maintenanceCareItems: string[];
  growthExampleTitle: string;
  growthExampleCaption: string;
  growthExampleText: string;
  restQuestionTitle: string;
  restQuestionIntro: string;
  restQuestionCallout: string;
  restQuestionServiceProof: string;
  restQuestionDeepDive: string;
  restQuestionAnswer: string;
  restQuestionTransition: string;
  restQuestionWhyTitle: string;
  restQuestionWhyText: string;
  restQuestionWarning: string;
  comparisonTable: {
    columns: {
      biab: string;
      regularGels: string;
      acrylic: string;
    };
    rows: IMainTreatmentComparisonRow[];
  };
}

export interface IMainTreatmentContent {
  id: string;
  translations: IBiabTreatmentTranslations;
}

export interface IMainTreatmentContentFile {
  treatments: IMainTreatmentContent[];
}

export const sections = (translations: IBiabTreatmentTranslations): ISection[] => {
  return [
    {
      type: 'title',
      value: translations.heroTitle,
      class: 'center',
    },
    {
      type: 'detail',
      value: translations.introLead,
    },
    {
      type: 'detail',
      value: translations.introBridge,
    },
    {
      type: 'detail',
      value: translations.comparisonLead,
    },
    {
      type: 'table',
      value: '',
      class: 'margin-bottom',
      details: comparativeTable(translations.comparisonTable),
    },
    {
      type: 'subtitle',
      value: translations.whyBestTitle,
      class: 'center',
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-1.webp',
      height: 250,
      width: 228,
      details: [
        {
          type: 'detail',
          value: translations.assessmentText,
        },
        {
          type: 'detail',
          value: translations.benefitsText,
        },
        {
          type: 'detail',
          value: translations.summaryLabel,
        },
      ],
    },
    {
      type: 'detail',
      value: translations.standardsLead,
    },
    {
      type: 'list',
      value: '',
      details: mapDetails(translations.standardsItems),
    },
    {
      type: 'subsubtitle',
      value: translations.ctaTitle,
    },
    {
      type: 'divider',
      value: '',
    },
    {
      type: 'subtitle',
      value: translations.advantagesTitle,
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-4.webp',
      class: 'margin-5',
      width: 150,
      height: 210,
      details: [
        {
          type: 'detail',
          value: translations.advantagesIntro,
        },
      ],
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-5.webp',
      width: 300,
      height: 327,
      class: 'left',
      details: [
        {
          type: 'detail',
          value: translations.productConfidenceText,
          class: 'margin-bottom-10',
        },
        {
          type: 'detail',
          value: translations.veganBenefitText,
        },
      ],
    },
    {
      type: 'subsubtitle',
      value: translations.essenceLabel,
    },
    {
      type: 'image',
      value: 'assets/home_page/img/treatment/biab-7.webp',
      width: 300,
      height: 150,
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-6.webp',
      width: 235,
      height: 210,
      class: 'margin-5 center',
      details: [
        {
          type: 'detail',
          value: translations.paletteText,
          class: 'bold',
        },
        {
          type: 'detail',
          value: translations.paletteLeadIn,
          class: 'bold',
        },
        {
          type: 'subtitle',
          value: translations.paletteCallout,
        },
      ],
    },
    {
      type: 'detail',
      value: translations.hemaFreeText,
    },
    {
      type: 'detail',
      value: translations.frequencyReminderText,
    },
    {
      type: 'divider',
      value: '',
    },
    {
      type: 'subtitle',
      value: translations.maintenanceTitle,
    },
    {
      type: 'detail',
      value: translations.maintenanceText,
      class: 'margin-bottom',
    },
    {
      type: 'subsubtitle',
      value: translations.maintenanceCareTitle,
    },
    {
      type: 'enum',
      value: '',
      details: mapDetails(translations.maintenanceCareItems),
    },
    {
      type: 'image',
      value: 'assets/home_page/img/treatment/biab-2.webp',
      width: 500,
      height: 250,
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-3.webp',
      height: 250,
      width: 209,
      class: 'left text-center center',
      details: [
        {
          type: 'detail',
          value: translations.growthExampleTitle,
          class: 'top-text bold',
        },
        {
          type: 'detail',
          value: translations.growthExampleCaption,
          class: 'bottom-tex',
        },
        {
          type: 'detail',
          value: translations.growthExampleText,
          class: 'bottom-tex',
        },
      ],
    },
    {
      type: 'divider',
      value: '',
    },
    {
      type: 'subtitle',
      value: translations.restQuestionTitle,
      class: 'margin-bottom',
    },
    {
      type: 'detail',
      value: translations.restQuestionIntro,
    },
    {
      type: 'detail',
      value: translations.restQuestionCallout,
      class: 'center bold margin-bottom',
    },
    {
      type: 'detail',
      value: translations.restQuestionServiceProof,
    },
    {
      type: 'detail',
      value: translations.restQuestionDeepDive,
    },
    {
      type: 'detail',
      value: translations.restQuestionAnswer,
    },
    {
      type: 'detail',
      value: translations.restQuestionTransition,
    },
    {
      type: 'subsubtitle',
      value: translations.restQuestionWhyTitle,
    },
    {
      type: 'detail',
      value: translations.restQuestionWhyText,
      class: 'bottom',
    },
    {
      type: 'detail',
      value: translations.restQuestionWarning,
      class: 'bold center-50',
    },
  ];
};

const comparativeTable = (comparisonTable: IBiabTreatmentTranslations['comparisonTable']): ISection[] => {
  const title = [{
    type: 'subtitle',
    value: '',
    details: [
      {
        type: 'detail',
        value: '',
        class: 'inner-border table-header',
      },
      {
        type: 'detail',
        value: comparisonTable.columns.biab,
        class: 'inner-border center table-header',
      },
      {
        type: 'detail',
        value: comparisonTable.columns.regularGels,
        class: 'inner-border center table-header',
      },
      {
        type: 'detail',
        value: comparisonTable.columns.acrylic,
        class: 'inner-border center table-header',
      },
    ],
  } as ISection];

  const details = comparisonTable.rows.map((row: IMainTreatmentComparisonRow) => ({
    type: 'detail',
    value: '',
    details: [
      {
        type: 'detail',
        value: row.label,
        class: 'inner-border bold center table-column-header',
      },
      {
        type: 'detail',
        value: row.biab,
        class: 'inner-border center',
      },
      {
        type: 'detail',
        value: row.regularGels,
        class: 'inner-border center',
      },
      {
        type: 'detail',
        value: row.acrylic,
        class: 'inner-border center',
      },
    ],
  } as ISection));

  return title.concat(details);
};

const mapDetails = (values: string[]): ISection[] => values.map((value: string) => ({
  type: 'detail',
  value,
}));
