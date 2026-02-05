import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvService {
  appServer = environment.appServer;

  title = environment.title;
  version = environment.version;
  baseUrl = environment.baseUrl;
  appDomain = environment.appDomain;

  showMap = environment.showMap;
  googleMapKey = environment.googleMapKey;

  get awsExtractEnable(): boolean {
    return environment.awsExtractEnable;
  }
  awsIdentityPoolId = environment.awsIdentityPoolId;
  awsLoginsKey = environment.awsLoginsKey;

  firebase = environment.firebase;
  firebaseMessaging = environment.firebaseMessaging;

  get googleDriveUploadFile(): boolean {
    return environment.googleDriveUploadFile;
  }
}
