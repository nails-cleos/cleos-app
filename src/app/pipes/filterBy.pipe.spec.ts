import { FilterByPipe } from './filterBy.pipe';

describe('FilterPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterByPipe();
    expect(pipe).toBeTruthy();
  });
});
