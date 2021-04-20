import { Injectable } from '@angular/core';
import { GeocoderResult, GeocoderStatus, MapsAPILoader } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, map, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  private geocoder: any;

  constructor(private mapLoader: MapsAPILoader) {
  }

  geocodeAddress(lat: number, lng: number): Observable<any> {
    return this.waitForMapsToLoad().pipe(
      // filter(loaded => loaded),
      switchMap(() => {
        return new Observable(observer => {
          const latLng = new google.maps.LatLng(lat, lng);
          this.geocoder.geocode({location: latLng}, (results: GeocoderResult[], status: GeocoderStatus) => {
            if (status === google.maps.GeocoderStatus.OK) {
              observer.next(results[0]);
            } else {
              console.error('Error - ', results, ' & Status - ', status);
              observer.next(undefined);
            }
            observer.complete();
          });
        });
      })
    );
  }

  private initGeocoder(): void {
    this.geocoder = new google.maps.Geocoder();
  }

  private waitForMapsToLoad(): Observable<boolean> {
    if (!this.geocoder) {
      return fromPromise(this.mapLoader.load())
        .pipe(
          tap(() => this.initGeocoder()),
          map(() => true)
        );
    }
    return of(true);
  }
}
