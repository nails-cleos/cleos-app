import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { MapGeocoder } from "@angular/google-maps";

declare let google: any;

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  apiLoaded: Observable<boolean>;

  constructor(private httpClient: HttpClient, private geocoder: MapGeocoder) {
    this.apiLoaded = httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ environment.googleMapKey }`, 'callback')
      .pipe(map(() => true),
        catchError(() => of(false)),
      );
  }

  // geocodeAddress(lat: number, lng: number, showDistance: boolean | undefined): Observable<any> {
  // TODO is it necessary?
  // return this.waitForMapsToLoad().pipe(
  //   switchMap(() => new Observable(observer => {
  //     const latLng = new google.maps.LatLng(lat, lng);
  //     if (showDistance) {
  //       if ('geolocation' in navigator) {
  //         navigator.geolocation.getCurrentPosition((position) => {
  //           const currentLat = position.coords.latitude;
  //           const currentLong = position.coords.longitude;
  //           const currentLatLng = new google.maps.LatLng(currentLat, currentLong);
  //           const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, currentLatLng);
  //           observer.next({ distance });
  //         });
  //       }
  //     }
  //     this.geocoder.geocode({ location: latLng }).subscribe(response => {
  //       const results = response.results;
  //       const status = response.status;
  //       if (status === google.maps.GeocoderStatus.OK) {
  //         observer.next({ address: results[0] });
  //       } else {
  //         console.error('Error - ', results, ' & Status - ', status);
  //         observer.next(undefined);
  //       }
  //       observer.complete();
  //     })
  //   })));
  // }

  private initGeocoder(): void {
    this.geocoder = new google.maps.Geocoder();
  }

  private waitForMapsToLoad(): Observable<boolean> {
    if (!this.geocoder) {
      return fromPromise(this.apiLoaded.toPromise()).pipe(
        tap(() => this.initGeocoder()),
        map(() => true)
      );
    }
    return of(true);
  }
}
