import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import {filter, map} from 'rxjs/operators';

function promptUser(event: VersionReadyEvent): boolean {
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(swUpdate: SwUpdate) {
    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(evt => {
        if (promptUser(evt)) {
          // Reload the page to update to the latest version.
          document.location.reload();
        }
      });
  }
}
