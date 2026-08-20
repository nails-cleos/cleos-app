import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomMeDetailsPageComponent } from './room-me-details-page.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapComponent } from '@app/shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '@app/util/stub/google-map-stub.component';
import { provideTranslateService } from '@ngx-translate/core';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';

describe('RoomMeDetailsPageComponent', () => {
  let component: RoomMeDetailsPageComponent;
  let fixture: ComponentFixture<RoomMeDetailsPageComponent>;

  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };

    await TestBed.configureTestingModule({
      imports: [RoomMeDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    })
      .overrideComponent(RoomMeDetailsPageComponent, {
        remove: { imports: [GoogleMapComponent] },
        add: { imports: [GoogleMapStubComponent] },
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
    const roomDetailsComponent =
      fixture.debugElement.children[0].componentInstance;

    expect(roomDetailsComponent.id()).toBe('room-123');
  });
});
