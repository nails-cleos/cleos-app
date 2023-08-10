import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlContainer, NgForm, UntypedFormGroup } from '@angular/forms';
import { GeocodeService, MapStatus } from '../../services/geocode.service';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import PlaceResult = google.maps.places.PlaceResult;
import MapMouseEvent = google.maps.MapMouseEvent;
import { AuthUserService } from '../../services/auth-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class GoogleMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;

  @Input() showDistance?: boolean;
  @Input() addressFormGroup?: UntypedFormGroup;
  @Input() public latitudeMarker?: number;
  @Input() public longitudeMarker?: number;
  @Input() public types: string[];
  @Input() public markInfo?: string;
  @ViewChild('addressText') addressText: any;
  @Output() addressEmitter = new EventEmitter<PlaceResult>();
  @Output() distanceEmitter = new EventEmitter<number>();

  public markerOptions: google.maps.MarkerOptions;
  public markerPosition?: google.maps.LatLngLiteral;
  public latitude: number;
  public longitude: number;
  public isDraggable: boolean;
  public info: any;
  public mapStatus: MapStatus;

  public center: google.maps.LatLngLiteral;
  public zoom: number;
  public options: any = {};

  private authUserServiceSubscription: Subscription;
  private isDarkMode: boolean;

  constructor(private geocodeService: GeocodeService, private authUserService: AuthUserService) {
    this.latitude = 51.926517;
    this.longitude = 4.462456;
    this.isDraggable = false;
    this.mapStatus = MapStatus.loading;
    this.markerOptions = { draggable: this.isDraggable };
    this.center = { lat: this.latitude, lng: this.longitude };
    this.zoom = 10;
    this.types = [];
    this.isDarkMode = false;
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => this.isDarkMode = value.isDarkMode);
  }

  ngOnInit(): void {
    if (this.addressFormGroup) {
      this.isDraggable = true;
    }
  }

  ngAfterViewInit(): void {
    if (this.isDarkMode) {
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
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }

  markerDragEnd($event: MapMouseEvent): void {
    if ($event.latLng) {
      this.geocodeService.geocodeAddress($event.latLng.lat(), $event.latLng.lng(), this.showDistance)
        .subscribe(value => {
          if (value.address) {
            this.addressEmitter.emit(value.address);
            this.addressFormGroup?.get('address')?.setValue(value.address.formatted_address);
          }
        });
    }
  }

  openInfoWindow(marker: MapMarker): void {
    this.infoWindow?.open(marker);
  }

  private setAutocomplete(): void {
    if (this.addressText?.nativeElement) {
      const options = {
        componentRestrictions: { country: 'nl' },
        fields: ['address_components', 'formatted_address', 'geometry', 'icon', 'name'],
        strictBounds: false,
        types: this.types,
      };

      const autocomplete = new google.maps.places.Autocomplete(this.addressText.nativeElement, options);

      google.maps.event.addListener(autocomplete, 'place_changed', () => this.setAddress(autocomplete.getPlace()));
    }
  }

  private setCurrentPosition(): void {
    if (this.latitudeMarker && this.longitudeMarker) {
      this.center = { lat: this.latitudeMarker, lng: this.longitudeMarker };
      this.markerPosition = { lat: this.latitudeMarker, lng: this.longitudeMarker };

      this.zoom = 15;
      this.markerOptions = { draggable: this.isDraggable };

      if (this.showDistance) {
        this.geocodeService.geocodeAddress(this.latitudeMarker, this.longitudeMarker, this.showDistance).subscribe(value => {
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
  }

  private setAddress(place: PlaceResult): void {
    if (place.geometry && place.geometry.location) {
      this.latitudeMarker = this.latitude = place.geometry.location.lat();
      this.longitudeMarker = this.longitude = place.geometry.location.lng();
      this.markerPosition = place.geometry.location.toJSON();
      this.center = place.geometry.location.toJSON();

      const address = place.formatted_address ? place.formatted_address : 'link';

      this.info = `<b>${ place.name ? place.name : 'Nails Cleos' }</b>
        <div>
            <a href="https://www.google.com/maps/dir/?api=1&z=15&destination=${ place.formatted_address }"
                rel="noreferrer" target="_blank">${ address }</a>
        </div>
        <div>${ this.addressFormGroup?.get('addressDescription')?.value || '' }</div>`;

      this.zoom = 15;
      this.markerOptions = { draggable: this.isDraggable };
      this.addressEmitter.emit(place);
    }
  }

  private mockResponse(): void {
    if (!this.addressFormGroup?.get('address')?.value) {
      const value = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        address_components: [],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        formatted_address: `Mock address - ${ new Date().getTime() }`,
        geometry: {
          location: {
            lat: () => this.getRandomInRange(-90, 90),
            lng: () => this.getRandomInRange(-180, 180),
            toJSON: () => 'toJSON mock',
            toString: () => 'toString mock'
          },
          bounds: null,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          location_type: null,
          viewport: null
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        partial_match: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        place_id: 'Mock placeId',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postcode_localities: ['Mock postcode'],
        types: ['Mock type']
      } as unknown as PlaceResult;
      this.addressFormGroup?.get('address')?.setValue(value.formatted_address);
      this.addressEmitter.emit(value);
    }
  }

  private getRandomInRange(from: number, to: number, fixed: number = 3): number {
    return Number((Math.random() * (to - from) + from).toFixed(fixed)) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
  }
}
