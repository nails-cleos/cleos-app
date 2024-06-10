export interface ISection {
  type: 'title' | 'subtitle' | 'subsubtitle' | 'image' | 'image-detail' | 'image-text' | 'detail' | 'list' | 'enum' | 'divider' | 'table';
  value: string;
  width?: number;
  height?: number;
  details?: ISection[];
  class?: string;
  description?: string;
  alt?: string;
}

export interface IMainTreatment {
  id: string;
  title: string;
  sections: ISection[];
  translations: any;
}

export const sections = (translations: any): ISection[] => {
  return [
    {
      type: 'title',
      value: translations.value_43,
      class: 'center'
    },
    {
      type: 'detail',
      value: translations.value_2,
    },
    {
      type: 'detail',
      value: translations.value_88,
    },
    {
      type: 'detail',
      value: translations.value_44,
    },
    {
      type: 'table',
      value: '',
      class: 'margin-bottom',
      details: comparativeTable(translations)
    },
    {
      type: 'subtitle',
      value: translations.value_1,
      class: 'center'
    },
    {
      type: 'image-detail',
      value: 'assets/home_page/img/treatment/biab-1.webp',
      height: 250,
      width: 228,
      class: 'margin-5',
      details: [
        {
          type: 'detail',
          value: translations.value_3
        },
        {
          type: 'detail',
          value: translations.value_4
        },
        {
          type: 'detail',
          value: translations.value_5
        }
      ]
    },
    {
      type: 'detail',
      value: translations.value_6
    },
    {
      type: 'list',
      value: '',
      details: [
        {
          type: 'detail',
          value: translations.value_7
        },
        {
          type: 'detail',
          value: translations.value_8
        },
        {
          type: 'detail',
          value: translations.value_9
        }
      ]
    },
    {
      type: 'subsubtitle',
      value: translations.value_10
    },
    {
      type: 'divider',
      value: ''
    },
    {
      type: 'subtitle',
      value: translations.value_33
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
          value: translations.value_34
        }
      ]
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
          value: translations.value_35,
          class: 'margin-bottom-10'
        },
        {
          type: 'detail',
          value: translations.value_37
        }
      ]
    },
    {
      type: 'subsubtitle',
      value: translations.value_36
    },
    {
      type: 'image',
      value: 'assets/home_page/img/treatment/biab-7.webp',
      height: 250,
      width: 500
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
          value: translations.value_38,
          class: 'bold'
        },
        {
          type: 'detail',
          value: translations.value_39,
          class: 'bold'
        },
        {
          type: 'subtitle',
          value: translations.value_40
        }
      ]
    },
    {
      type: 'detail',
      value: translations.value_41
    },
    {
      type: 'detail',
      value: translations.value_42,
    },
    {
      type: 'divider',
      value: ''
    },
    {
      type: 'subtitle',
      value: translations.value_11
    },
    {
      type: 'detail',
      value: translations.value_12,
      class: 'margin-bottom'
    },
    {
      type: 'subsubtitle',
      value: translations.value_13
    },
    {
      type: 'enum',
      value: '',
      details: [
        {
          type: 'detail',
          value: translations.value_14
        },
        {
          type: 'detail',
          value: translations.value_15
        },
        {
          type: 'detail',
          value: translations.value_16
        },
        {
          type: 'detail',
          value: translations.value_17
        },
        {
          type: 'detail',
          value: translations.value_18
        }
      ]
    },
    {
      type: 'image',
      value: 'assets/home_page/img/treatment/biab-2.webp',
      height: 250,
      width: 500
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
          value: translations.value_20,
          class: 'top-text bold'
        },
        {
          type: 'detail',
          value: translations.value_19,
          class: 'bottom-tex'
        },
        {
          type: 'detail',
          value: translations.value_21,
          class: 'bottom-tex'
        }
      ]
    },
    {
      type: 'divider',
      value: ''
    },
    {
      type: 'subtitle',
      value: translations.value_23,
      class: 'margin-bottom'
    },
    {
      type: 'detail',
      value: translations.value_24
    },
    {
      type: 'detail',
      value: translations.value_25,
      class: 'center bold margin-bottom'
    },
    {
      type: 'detail',
      value: translations.value_26
    },
    {
      type: 'detail',
      value: translations.value_27
    },
    {
      type: 'detail',
      value: translations.value_28
    },
    {
      type: 'detail',
      value: translations.value_29
    },
    {
      type: 'subsubtitle',
      value: translations.value_30
    },
    {
      type: 'detail',
      value: translations.value_31
    },
    {
      type: 'detail',
      value: translations.value_32,
      class: 'bold'
    }
  ];
};

const comparativeTable = (translations: any): ISection[] => {
  const title = [{
    type: 'subtitle',
    value: '',
    details: [
      {
        type: 'detail',
        value: '',
        class: 'inner-border table-header'
      },
      {
        type: 'detail',
        value: translations.value_45,
        class: 'inner-border center table-header'
      },
      {
        type: 'detail',
        value: translations.value_46,
        class: 'inner-border center table-header'
      },
      {
        type: 'detail',
        value: translations.value_47,
        class: 'inner-border center table-header'
      }
    ]
  } as ISection];

  let details: ISection[] = [];
  const start = 48;
  for (let i = 0; i < 10; i++) {
    details = [...details, {
      type: 'detail',
      value: '',
      details: [
        {
          type: 'detail',
          value: translations[`value_${ start + (i * 4) }`],
          class: 'inner-border bold center table-column-header'
        },
        {
          type: 'detail',
          value: translations[`value_${ start + 1 + (i * 4) }`],
          class: 'inner-border center'
        },
        {
          type: 'detail',
          value: translations[`value_${ start + 2 + (i * 4) }`],
          class: 'inner-border center'
        },
        {
          type: 'detail',
          value: translations[`value_${ start + 3 + (i * 4) }`],
          class: 'inner-border center'
        }
      ]
    }];
  }

  return title.concat(details);
};
