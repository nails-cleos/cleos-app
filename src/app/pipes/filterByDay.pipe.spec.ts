import { FilterByDayPipe } from './filterByDay.pipe';

describe('FilterPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterByDayPipe();
    expect(pipe).toBeTruthy();
  });
});
