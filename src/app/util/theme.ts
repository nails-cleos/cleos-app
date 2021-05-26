import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

// TODO color.
export const timeTheme = (): NgxMaterialTimepickerTheme => ({
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#e4c27c'
    },
    dial: {
      dialBackgroundColor: '#e4c27c'
    },
    clockFace: {
      clockFaceBackgroundColor: '#e3e3e3',
      clockHandColor: '#e4c27c',
      clockFaceTimeInactiveColor: '#000',
      clockFaceInnerTimeInactiveColor: '#000'
    }
  } as NgxMaterialTimepickerTheme);
