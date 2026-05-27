import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ControlContainer, FormControl, FormGroup, NgForm } from '@angular/forms';
import { GeocodeService, MapStatus } from '../../services/geocode.service';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { AuthUserService } from '../../services/auth-user.service';
import { SharedModule } from '../shared.module';
import { EnvService } from '../../services/env.service';
import PlaceResult = google.maps.places.PlaceResult;
import MapMouseEvent = google.maps.MapMouseEvent;

export type GoogleMapForm = {
  address: FormControl<string | undefined>;
  addressDescription: FormControl<string | undefined>;
}

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  imports: [SharedModule, GoogleMap, MapInfoWindow, MapMarker],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleMapComponent {
  infoWindow = viewChild(MapInfoWindow);
  addressText = viewChild<any>('addressText');

  showDistance = input<boolean>(false);
  addressFormGroup = input<FormGroup<GoogleMapForm>>();
  latitudeMarker = input<number>();
  longitudeMarker = input<number>();
  types = input<string[]>([]);
  markInfo = input<string>();
  height = input<number | string>(400);
  width = input<number | string>('100%');
  scrollwheel = input<boolean>(false);
  addressEmitter = output<PlaceResult>();
  distanceEmitter = output<number>();

  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly env: EnvService = inject(EnvService);

  private authUserSignal = this.authUserService.authUser;

  private isDarkMode = computed(() => this.authUserSignal().isDarkMode ?? false);

  public markerOptions: google.maps.marker.AdvancedMarkerElementOptions;
  public markerPosition?: google.maps.LatLngLiteral;
  public latitude: number;
  public longitude: number;
  public isDraggable: boolean;
  public info: any;
  public mapStatus: MapStatus;

  public center: google.maps.LatLngLiteral;
  public zoom: number;
  public options: any = {};

  constructor(private geocodeService: GeocodeService) {
    this.latitude = 51.926517;
    this.longitude = 4.462456;
    this.isDraggable = false;
    this.mapStatus = MapStatus.loading;
    this.markerOptions = { gmpDraggable: this.isDraggable };
    this.center = { lat: this.latitude, lng: this.longitude };
    this.zoom = 10;

    effect(() => {
      const addressFormGroup = this.addressFormGroup();
      if (!addressFormGroup) {
        return;
      }
      this.isDraggable = true;
    });

    effect(() => {
      this.options.scrollwheel = this.scrollwheel();
      if (this.isDarkMode()) {
        this.options.styles = [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }],
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }],
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }],
          },
        ];
      }
      this.geocodeService.createMap().subscribe((mapStatus) => {
        this.mapStatus = mapStatus;
        switch (mapStatus) {
          case MapStatus.ready:
            this.setCurrentPosition();
            this.setAutocomplete();
            break;
          case MapStatus.notAvailable:
            this.mockResponse();
            break;
        }
      });
    });

    effect(() => {
      const latitudeMarker = this.latitudeMarker();
      const longitudeMarker = this.longitudeMarker();

      if (latitudeMarker === null || longitudeMarker === null || typeof google === 'undefined' || !google?.maps) {
        return;
      }

      this.setCurrentPosition(latitudeMarker, longitudeMarker);
    });
  }

  get getForm(): GoogleMapForm | undefined {
    return this.addressFormGroup()?.controls;
  }

  markerDragEnd = ($event: MapMouseEvent): void => {
    if ($event.latLng) {
      this.geocodeService.geocodeAddress($event.latLng.lat(), $event.latLng.lng(), this.showDistance())
        .subscribe(value => {
          if (value.address) {
            this.addressEmitter.emit(value.address);
            this.getForm?.address?.setValue(value.address.formatted_address);
          }
        });
    }
  };

  openInfoWindow = (marker: MapMarker): void => this.infoWindow()?.open(marker);

  private setAutocomplete = (): void => {
    const addressText = this.addressText();
    if (addressText?.nativeElement) {
      const options = {
        componentRestrictions: { country: 'nl' },
        fields: ['address_components', 'formatted_address', 'geometry', 'icon', 'name'],
        strictBounds: false,
        types: this.types(),
      };

      const autocomplete = new google.maps.places.Autocomplete(addressText.nativeElement, options);

      google.maps.event.addListener(autocomplete, 'place_changed', () => this.setAddress(autocomplete.getPlace()));
    }
  };

  private setCurrentPosition = (
    latitudeMarker = this.latitudeMarker(),
    longitudeMarker = this.longitudeMarker(),
  ): void => {
    if (latitudeMarker && longitudeMarker) {
      this.center = { lat: latitudeMarker, lng: longitudeMarker };
      this.markerPosition = { lat: latitudeMarker, lng: longitudeMarker };

      this.zoom = 15;
      this.markerOptions = { gmpDraggable: this.isDraggable };
      const showDistance = this.showDistance();

      if (showDistance) {
        this.geocodeService.geocodeAddress(latitudeMarker, longitudeMarker, showDistance)
          .subscribe(value => {
            if (value.distance) {
              this.distanceEmitter.emit(value.distance);
            }
            if (value.address) {
              this.setAddress(value.address);
            }
          });
      } else if (!this.info) {
        this.info = this.markInfo;
      }
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.center = { lat: position.coords.latitude, lng: position.coords.longitude };
        });
      }
    }
  };

  private setAddress = (place: PlaceResult): void => {
    if (place.geometry && place.geometry.location) {
      this.latitude = place.geometry.location.lat();
      this.longitude = place.geometry.location.lng();
      this.markerPosition = place.geometry.location.toJSON();
      this.center = place.geometry.location.toJSON();

      const address = place.formatted_address ? place.formatted_address : 'link';

      this.info = `<b>${ place.name ? place.name : this.env.title }</b>
        <div>
            <a href="https://www.google.com/maps/dir/?api=1&z=15&destination=${ place.formatted_address }"
                rel="noreferrer" target="_blank">${ address }</a>
        </div>
        <div>${ this.getForm?.addressDescription?.value || '' }</div>`;

      this.zoom = 15;
      this.markerOptions = { gmpDraggable: this.isDraggable };
      this.addressEmitter.emit(place);
    }
  };

  private mockResponse = (): void => {
    if (!this.getForm?.address?.value) {
      const value = {
        // eslint-disable-next-line camelcase
        address_components: [],
        // eslint-disable-next-line camelcase
        formatted_address: `Mock address - ${ new Date().getTime() }`,
        geometry: {
          location: {
            lat: () => this.getRandomInRange(-90, 90),
            lng: () => this.getRandomInRange(-180, 180),
            toJSON: () => 'toJSON mock',
            toString: () => 'toString mock',
          },
          bounds: null,
          // eslint-disable-next-line camelcase
          location_type: null,
          viewport: null,
        },
        // eslint-disable-next-line camelcase
        partial_match: true,
        // eslint-disable-next-line camelcase
        place_id: 'Mock placeId',
        // eslint-disable-next-line camelcase
        postcode_localities: ['Mock postcode'],
        types: ['Mock type'],
      } as unknown as PlaceResult;
      if (value.formatted_address) {
        this.getForm?.address?.setValue(value.formatted_address);
      }
      this.addressEmitter.emit(value);
    }
  };

  private getRandomInRange = (
    from: number,
    to: number,
    fixed: number = 3,
  ): number => Number((Math.random() * (to - from) + from).toFixed(fixed));
}
