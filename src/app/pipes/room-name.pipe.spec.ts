import { RoomNamePipe } from './room-name.pipe';
import { describe, expect, it } from 'vitest';

describe('RoomNamePipe', () => {
  it('create an instance', () => {
    const pipe = new RoomNamePipe();
    expect(pipe).toBeTruthy();
  });
});
