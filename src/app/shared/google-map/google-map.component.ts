import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlContainer, NgForm, UntypedFormGroup } from '@angular/forms';
import { GeocodeService, MapStatus } from '../../services/geocode.service';
import { MapInfoWindow, MapMarker } from "@angular/google-maps";
import PlaceResult = google.maps.places.PlaceResult;
import MapMouseEvent = google.maps.MapMouseEvent;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;

  @Input() showDistance?: boolean;
  @Input() addressFormGroup?: UntypedFormGroup;
  @Input() public latitudeMarker?: number;
  @Input() public longitudeMarker?: number;
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

  constructor(private geocodeService: GeocodeService) {
    this.latitude = 51.926517;
    this.longitude = 4.462456;
    this.isDraggable = false;
    this.mapStatus = MapStatus.LOADING;
    this.markerOptions = { draggable: this.isDraggable }
    this.center = { lat: this.latitude, lng: this.longitude }
    this.zoom = 10;
  }

  ngOnInit(): void {
    if (this.addressFormGroup) {
      this.isDraggable = true;
    }
  }

  ngAfterViewInit(): void {
    this.geocodeService.createMap().subscribe((mapStatus) => {
      this.mapStatus = mapStatus;
      switch (mapStatus) {
        case MapStatus.READY:
          this.setCurrentPosition();
          this.setAutocomplete();
          break;
        case MapStatus.NOT_AVAILABLE:
          this.mockResponse();
          break;
      }
    });
  }

  private setAutocomplete() {
    if (this.addressText?.nativeElement) {
      const options = {
        componentRestrictions: { country: "nl" },
        fields: ["address_components", "formatted_address", "geometry", "icon", "name"],
        strictBounds: false,
        types: ["establishment"],
      };

      const autocomplete = new google.maps.places.Autocomplete(this.addressText.nativeElement, options);

      google.maps.event.addListener(autocomplete, 'place_changed', () => this.setAddress(autocomplete.getPlace()));
    }
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

  openInfoWindow(marker: MapMarker) {
    this.infoWindow?.open(marker);
  }

  private setCurrentPosition(): void {
    if (this.latitudeMarker && this.longitudeMarker) {
      this.center = { lat: this.latitudeMarker, lng: this.longitudeMarker }
      this.markerPosition = { lat: this.latitudeMarker, lng: this.longitudeMarker }

      this.zoom = 15;
      this.markerOptions = { draggable: this.isDraggable }

      if (this.showDistance) {
        this.geocodeService.geocodeAddress(this.latitudeMarker, this.longitudeMarker, this.showDistance).subscribe(value => {
          if (value.distance) {
            this.distanceEmitter.emit(value.distance);
          }
          if (value.address) {
            this.setAddress(value.address);
          }
        });
      }

    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.center = { lat: position.coords.latitude, lng: position.coords.longitude }
        });
      }
    }
  }

  private setAddress(place: PlaceResult): void {
    if (place.geometry && place.geometry.location) {
      this.latitudeMarker = this.latitude = place.geometry.location.lat();
      this.longitudeMarker = this.longitude = place.geometry.location.lng();
      this.markerPosition = place.geometry.location.toJSON();
      this.center = place.geometry.location.toJSON()

      const address = place.formatted_address ? place.formatted_address : 'link'

      this.info = `<b>${ place.name ? place.name : 'Nails Cleos' }</b>
        <div>
            <a href="https://www.google.com/maps/dir/?api=1&z=15&destination=${ place.formatted_address }"
                rel="noreferrer" target="_blank">${ address }</a>
        </div>
        <div>${ this.addressFormGroup?.get("addressDescription")?.value || '' }</div>`;

      this.zoom = 15;
      this.markerOptions = { draggable: this.isDraggable }
      this.addressEmitter.emit(place);
    }
  }

  private mockResponse(): void {
    if (!this.addressFormGroup?.get('address')?.value) {
      const value = {
        address_components: [],
        formatted_address: `Mock address - ${new Date().getTime()}`,
        geometry: {
          location: {
            lat: () => this.getRandomInRange(-90, 90),
            lng: () => this.getRandomInRange(-180, 180),
            toJSON: () => 'toJSON mock',
            toString: () => 'toString mock'
          },
          bounds: null,
          location_type: null,
          viewport: null
        },
        partial_match: true,
        place_id: 'Mock placeId',
        postcode_localities: ['Mock postcode'],
        types: ['Mock type']
      } as unknown as PlaceResult;
      this.addressFormGroup?.get('address')?.setValue(value.formatted_address)
      this.addressEmitter.emit(value);
    }
  }

  private getRandomInRange(from: number, to: number, fixed: number = 3): number {
    return Number((Math.random() * (to - from) + from).toFixed(fixed)) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
  }
}
