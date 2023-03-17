import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
// import { Appearance } from '@angular-material-extensions/google-maps-autocomplete';
import { ControlContainer, NgForm, UntypedFormGroup } from '@angular/forms';
import { GeocodeService } from '../../services/geocode.service';
import { environment } from '../../../environments/environment';
import { Observable } from "rxjs";
import { MapInfoWindow, MapMarker } from "@angular/google-maps";
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class GoogleMapComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;

  @Input() showDistance: boolean | undefined;
  @Input() addressFormGroup: UntypedFormGroup | undefined;
  @Input() public latitudeMarker: number | undefined;
  @Input() public longitudeMarker: number | undefined;
  @Output() addressEmitter = new EventEmitter<GeocoderResult>();
  @Output() distanceEmitter = new EventEmitter<number>();

  // public appearance = Appearance;
  public zoom: number;
  public options: google.maps.MapOptions
  public markerOptions: google.maps.MarkerOptions;
  public latitude: number;
  public longitude: number;
  public isDraggable: boolean;
  public info: string | undefined;
  public isMapLoading: Observable<boolean>;
  public showMap = environment.production;

  constructor(private geocodeService: GeocodeService) {
    this.latitude = -31.42008329999999;
    this.longitude = -64.1887761;
    this.zoom = 10;
    this.isDraggable = false;
    this.isMapLoading = geocodeService.apiLoaded;
    this.options = {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: this.zoom
    };
    this.markerOptions = { draggable: this.isDraggable }
  }

  ngOnInit(): void {
    if (this.addressFormGroup && this.showMap) {
      this.addressFormGroup.get('address')?.valueChanges.subscribe(value => {
        this.setAddress(value);
      });
      this.isDraggable = true;
    }
    this.setCurrentPosition();
    this.mockResponse();
  }

  markerDragEnd($event: any): void {
    // TODO drag event
    // this.isMapLoading = true;
    // this.geocodeService.geocodeAddress($event.coords.lat, $event.coords.lng, this.showDistance)
    //   .subscribe(value => {
    //     if (value.address) {
    //       this.addressFormGroup?.get('address')?.setValue(value.address);
    //     }
    //   });
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow?.open(marker);
  }

  private setCurrentPosition(): void {
    // TODO set current position
    // this.isMapLoading = true;
    // if (this.latitudeMarker && this.longitudeMarker) {
    //   this.geocodeService.geocodeAddress(this.latitudeMarker, this.longitudeMarker, this.showDistance)
    //     .subscribe(value => {
    //       if (value.distance) {
    //         this.distanceEmitter.emit(value.distance);
    //       }
    //       if (value.address) {
    //         if (this.addressFormGroup) {
    //           this.addressFormGroup.get('address')?.setValue(value.address);
    //         } else {
    //           this.setAddress(value.address);
    //         }
    //       }
    //     });
    // } else {
    //   if ('geolocation' in navigator) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //       this.latitude = position.coords.latitude;
    //       this.longitude = position.coords.longitude;
    //       // this.isMapLoading = false;
    //     });
    //   }
    // }
  }

  private setAddress(value: GeocoderResult): void {
    this.latitudeMarker = this.latitude = value.geometry.location.lat();
    this.longitudeMarker = this.longitude = value.geometry.location.lng();
    this.info = value.formatted_address;
    this.zoom = 15;

    this.options = {
      center: { lat: this.latitudeMarker, lng: this.longitudeMarker },
      zoom: this.zoom
    };
    this.markerOptions = { draggable: this.isDraggable }
    // this.isMapLoading = false;
    this.addressEmitter.emit(value);
  }

  private mockResponse(): void {
    if (!this.showMap && !this.addressFormGroup?.get('address')?.value) {
      const value = {
        address_components: [],
        formatted_address: 'Mock address',
        geometry: {
          location: {
            lat: () => this.latitude,
            lng: () => this.longitude,
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
      } as unknown as GeocoderResult;
      this.addressEmitter.emit(value);
      this.addressFormGroup?.get('address')?.setValue(value);
    }
  }
}
