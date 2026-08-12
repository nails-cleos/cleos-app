import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';

declare let google: any;

export enum MapStatus {
  ready,
  loading,
  notAvailable,
}

@Injectable({
  providedIn: 'root',
})
export class GeocodeService {
  private readonly env: EnvService = inject(EnvService);
  private http: HttpClient = inject(HttpClient);
  private mapLoader$?: Observable<MapStatus>;

  createMap = (): Observable<MapStatus> => {
    const showMap = this.env.showMap;
    if (!showMap) {
      return of(MapStatus.notAvailable);
    }

    if (typeof google !== 'undefined' && google?.maps) {
      return of(MapStatus.ready);
    }

    if (!this.mapLoader$) {
      const mapUrl = 'https://maps.googleapis.com/maps/api/js';
      this.mapLoader$ = this.http
        .jsonp(
          `${mapUrl}?libraries=geometry,places&key=${this.env.googleMapKey}&sensor=false`,
          'callback',
        )
        .pipe(
          map(() => MapStatus.ready),
          catchError((e) => {
            console.error(e);
            this.mapLoader$ = undefined;
            return of(MapStatus.notAvailable);
          }),
          shareReplay(1),
        );
    }

    return this.mapLoader$;
  };

  geocodeAddress = (
    lat: number,
    lng: number,
    showDistance: boolean | undefined,
  ): Observable<any> =>
    new Observable((observer) => {
      const latLng = new google.maps.LatLng(lat, lng);
      if (showDistance) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            const currentLat = position.coords.latitude;
            const currentLong = position.coords.longitude;
            const currentLatLng = new google.maps.LatLng(
              currentLat,
              currentLong,
            );
            const distance =
              google.maps.geometry.spherical.computeDistanceBetween(
                latLng,
                currentLatLng,
              );
            observer.next({ distance });
          });
        }
      }
      new google.maps.Geocoder()
        .geocode({ location: latLng })
        .then((response: any) => {
          const results = response.results;
          observer.next({ address: results[0] });
        });
    });
}
