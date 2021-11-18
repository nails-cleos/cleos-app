import { Injectable } from '@angular/core';
import { GeocoderResult, GeocoderStatus, MapsAPILoader } from '@agm/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

declare let google: any;

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  private geocoder: any;

  constructor(private mapLoader: MapsAPILoader) {
  }

  geocodeAddress(lat: number, lng: number, showDistance: boolean | undefined): Observable<any> {
    return this.waitForMapsToLoad().pipe(
      switchMap(() => new Observable(observer => {
        const latLng = new google.maps.LatLng(lat, lng);
        if (showDistance) {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              const currentLat = position.coords.latitude;
              const currentLong = position.coords.longitude;
              const currentLatLng = new google.maps.LatLng(currentLat, currentLong);
              const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, currentLatLng);
              observer.next({distance});
            });
          }
        }
        this.geocoder.geocode({location: latLng}, (results: GeocoderResult[], status: GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK) {
            observer.next({address: results[0]});
          } else {
            console.error('Error - ', results, ' & Status - ', status);
            observer.next(undefined);
          }
          observer.complete();
        });
      }))
    );
  }

  private initGeocoder(): void {
    this.geocoder = new google.maps.Geocoder();
  }

  private waitForMapsToLoad(): Observable<boolean> {
    if (!this.geocoder) {
      return fromPromise(this.mapLoader.load()).pipe(
        tap(() => this.initGeocoder()),
        map(() => true)
      );
    }
    return of(true);
  }
}
