import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByDay'
})
export class FilterByDayPipe implements PipeTransform {

  transform(items?: any[], filter?: any[]): any[] | undefined {
    return !items || !filter ? items : items.filter(item => filter.includes(item.day));
  }
}
