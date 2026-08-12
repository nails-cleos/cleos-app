import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { RoomMeDetailsPageComponent } from './room-me-details-page.component';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
  selector: 'app-room-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class RoomDetailsPageStubComponent {
  id = input.required<string>();
}

describe('RoomMeDetailsPageComponent', () => {
  let component: RoomMeDetailsPageComponent;
  let fixture: ComponentFixture<RoomMeDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomMeDetailsPageComponent],
    })
      .overrideComponent(RoomMeDetailsPageComponent, {
        remove: { imports: [RoomDetailsPageComponent] },
        add: { imports: [RoomDetailsPageStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoomMeDetailsPageComponent);
    fixture.componentRef.setInput('id', 'room-123');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass id to the room details page', () => {
    const roomDetailsComponent = fixture.debugElement.children[0]
      .componentInstance as RoomDetailsPageStubComponent;

    expect(roomDetailsComponent.id()).toBe('room-123');
  });
});
