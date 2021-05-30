import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

export const timeTheme = (): NgxMaterialTimepickerTheme => ({
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#a06c3f'
    },
    dial: {
      dialBackgroundColor: '#a06c3f'
    },
    clockFace: {
      clockFaceBackgroundColor: '#e3e3e3',
      clockHandColor: '#a06c3f',
      clockFaceTimeInactiveColor: '#000',
      clockFaceInnerTimeInactiveColor: '#000'
    }
  } as NgxMaterialTimepickerTheme);
