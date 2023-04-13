import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

declare let google: any;

export enum MapStatus {
  READY,
  LOADING,
  NOT_AVAILABLE
}

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {

  constructor(private httpClient: HttpClient) {
  }

  public createMap(): Observable<MapStatus> {
    const showMap = environment.production;
    if (showMap) {
      return this.httpClient.jsonp(
        `https://maps.googleapis.com/maps/api/js?libraries=geometry,places&key=${ environment.googleMapKey }&sensor=false`,
        'callback')
        .pipe(map(() => MapStatus.READY),
          catchError((e) => {
            console.error(e)
            return of(MapStatus.NOT_AVAILABLE)
          }),
        );
    }
    return new Observable((observer) => observer.next(MapStatus.NOT_AVAILABLE));
  }

  geocodeAddress(lat: number, lng: number, showDistance: boolean | undefined): Observable<any> {
    return new Observable((observer) => {
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
}
