import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true,
})
export class FilterByPipe implements PipeTransform {

  transform = (items?: any[], filter?: any, key?: string): any[] | undefined => {
    if (!items || !filter) {
      return items;
    }

    if (Array.isArray(filter)) {
      return items.filter(item => filter.includes(key ? item[key] : item));
    }

    return items.filter(item => filter === (key ? item[key] : item));
  };
}
