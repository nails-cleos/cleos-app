import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Appearance } from '@angular-material-extensions/google-maps-autocomplete';
import { ControlContainer, UntypedFormGroup, NgForm } from '@angular/forms';
import { GeocodeService } from '../../services/geocode.service';
import { GeocoderResult } from '@agm/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class GoogleMapComponent implements OnInit {

  @Input() showDistance: boolean | undefined;
  @Input() addressFormGroup: UntypedFormGroup | undefined;
  @Input() public latitudeMarker: number | undefined;
  @Input() public longitudeMarker: number | undefined;
  @Output() addressEmitter = new EventEmitter<GeocoderResult>();
  @Output() distanceEmitter = new EventEmitter<number>();

  public appearance = Appearance;
  public zoom: number;
  public latitude: number;
  public longitude: number;
  public isDraggable: boolean;
  public info: string | undefined;
  public isMapLoading: boolean;
  public showMap = environment.production;

  constructor(private geocodeService: GeocodeService) {
    this.latitude = -31.42008329999999;
    this.longitude = -64.1887761;
    this.zoom = 10;
    this.isDraggable = false;
    this.isMapLoading = false;
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
    this.isMapLoading = true;
    this.geocodeService.geocodeAddress($event.coords.lat, $event.coords.lng, this.showDistance)
      .subscribe(value => {
        if (value.address) {
          this.addressFormGroup?.get('address')?.setValue(value.address);
        }
      });
  }

  private setCurrentPosition(): void {
    this.isMapLoading = true;
    if (this.latitudeMarker && this.longitudeMarker) {
      this.geocodeService.geocodeAddress(this.latitudeMarker, this.longitudeMarker, this.showDistance)
        .subscribe(value => {
          if (value.distance) {
            this.distanceEmitter.emit(value.distance);
          }
          if (value.address) {
            if (this.addressFormGroup) {
              this.addressFormGroup.get('address')?.setValue(value.address);
            } else {
              this.setAddress(value.address);
            }
          }
        });
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.isMapLoading = false;
        });
      }
    }
  }

  private setAddress(value: GeocoderResult): void {
    this.latitudeMarker = this.latitude = value.geometry.location.lat();
    this.longitudeMarker = this.longitude = value.geometry.location.lng();
    this.info = value.formatted_address;
    this.zoom = 15;
    this.isMapLoading = false;
    this.addressEmitter.emit(value);
  }

  private mockResponse(): void {
    if (!this.showMap && !this.addressFormGroup?.get('address')?.value) {
      const value = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        address_components: [],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        formatted_address: 'Mock address',
        geometry: {
          location: {
            lat: () => this.latitude,
            lng: () => this.longitude,
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
      } as unknown as GeocoderResult;
      this.addressEmitter.emit(value);
      this.addressFormGroup?.get('address')?.setValue(value);
    }
  }
}
