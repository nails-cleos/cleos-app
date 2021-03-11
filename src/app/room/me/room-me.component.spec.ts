import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomMeComponent } from './room-me.component';

describe('RoomMeComponent', () => {
  let component: RoomMeComponent;
  let fixture: ComponentFixture<RoomMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomMeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
