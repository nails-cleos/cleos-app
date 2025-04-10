import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare let google: any;

export enum MapStatus {
  ready,
  loading,
  notAvailable
}

@Injectable({
  providedIn: 'root',
})
export class GeocodeService {

  private http: HttpClient = inject(HttpClient);

  createMap = (): Observable<MapStatus> => {
    const showMap = environment.showMap;
    if (showMap) {
      const mapUrl = 'https://maps.googleapis.com/maps/api/js';
      return this.http.jsonp(
        `${ mapUrl }?libraries=geometry,places&key=${ environment.googleMapKey }&sensor=false`, 'callback')
        .pipe(map(() => MapStatus.ready),
          catchError((e) => {
            console.error(e);
            return of(MapStatus.notAvailable);
          }),
        );
    }
    return new Observable((observer) => observer.next(MapStatus.notAvailable));
  };

  geocodeAddress = (
    lat: number,
    lng: number,
    showDistance: boolean | undefined,
  ): Observable<any> => new Observable((observer) => {
    const latLng = new google.maps.LatLng(lat, lng);
    if (showDistance) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentLat = position.coords.latitude;
          const currentLong = position.coords.longitude;
          const currentLatLng = new google.maps.LatLng(currentLat, currentLong);
          const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, currentLatLng);
          observer.next({ distance });
        });
      }
    }
    new google.maps.Geocoder().geocode({ location: latLng }).then((response: any) => {
      const results = response.results;
      observer.next({ address: results[0] });
    });
  });
}
