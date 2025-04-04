import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy',
  standalone: true
})
export class SortByPipe implements PipeTransform {

  transform = (value: any, order = '', column: string = ''): any[] => {
    if (!value || order === '' || !order) {
      return value;
    }
    if (value.length <= 1) {
      return value;
    }
    if (!column || column === '') {
      if (order === 'asc') {
        return value.sort();
      } else {
        return value.sort().reverse();
      }
    }
    value.sort((a: any, b: any) => {
      const sort = order === 'asc' ? 1 : -1;
      if (a[column] > b[column]) {
        return sort * 1;
      }
      if (a[column] < b[column]) {
        return sort * -1;
      }
      return 0;
    });

    return value;
  };
}
