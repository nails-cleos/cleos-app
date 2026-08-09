import { ReservationIconPipe } from './reservation-icon.pipe';
import { describe, expect, it } from 'vitest';

describe('ReservationIconPipe', () => {
  it('create an instance', () => {
    const pipe = new ReservationIconPipe();
    expect(pipe).toBeTruthy();
  });
});
