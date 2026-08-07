import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GoogleMapForm } from './google-map.component';
import PlaceResult = google.maps.places.PlaceResult;

export type GoogleMapFormStub = {
  address: FormControl<string | undefined>;
  addressDescription: FormControl<string | undefined>;
};

@Component({
  selector: 'app-google-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class GoogleMapStubComponent {
  showDistance = input<boolean>(false);
  addressFormGroup = input<FormGroup<GoogleMapForm>>();
  latitudeMarker = input<number>();
  longitudeMarker = input<number>();
  types = input<string[]>([]);
  markInfo = input<string>();
  height = input<number | string>(400);
  width = input<number | string>(400);
  scrollwheel = input<boolean>(false);
  addressEmitter = output<PlaceResult>();
  distanceEmitter = output<number>();
}
