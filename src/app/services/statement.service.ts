import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class StatementService {

  private url = 'statements';
  private urlV1 = `v1/${this.url}`;
  private officeUrl = 'offices';

  private http: HttpClient = inject(HttpClient);

  uploadStatement = (
    officeId: string,
    blob: Blob,
    fileName: string,
  ): Observable<void> => {
    const formData = new FormData();
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });
    formData.append('file', file, file.name);

    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.post<void>(toUrl(this.urlV1, this.officeUrl, officeId), formData, { headers });
  };
}
