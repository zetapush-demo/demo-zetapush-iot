import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, AlertController } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Device } from '@ionic-native/device';

import { MyApp } from './app.component';

import { BackgroundBeaconDetectionService } from '../background/background-beacon-detection.service';
import { NotificationService } from '../notification/notification.service';

import { OrderByDistancePipe } from '../pipes/orderByDistance.pipe';
import { WebRtcService } from '../webrtc/webrtc.service';

import { DetailsServices } from '../pages/details-services/details-services';
import { WebRtcPage } from '../pages/webrtc/webrtc';
import { BeaconConfigurationPage } from '../pages/beacon-configuration/beacon-configuration';
import { DetectionPage } from '../pages/detection/detection';
import { ServiceConfiguration } from '../pages/service-configuration/service-configuration';
import { TabsPage } from '../pages/tabs/tabs';

import { ZetaPushModule, ZetaPushClientConfig } from '../zetapush';
import { ZetapushService } from '../zetapush/zetapush.service';
import { BeaconApiProvider, WebRtcApiProvider } from '../zetapush/api-provider';
import { environment } from '../environments/environment';

import { FileApiProvider } from '../file/file-api.service';
import { FileUpload } from '../file/file-upload.service';

@NgModule({
  declarations: [
    MyApp,
    BeaconConfigurationPage,
    DetectionPage,
    WebRtcPage,
    ServiceConfiguration,
    DetailsServices,
    OrderByDistancePipe,
    TabsPage
  ],
  imports: [
    ZetaPushModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    WebRtcPage,
    BeaconConfigurationPage,
    DetectionPage,
    ServiceConfiguration,
    DetailsServices,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ZetapushService,
    BeaconApiProvider,
    WebRtcApiProvider,
    WebRtcService,
    Camera,
    Diagnostic,
    BackgroundMode,
    BackgroundBeaconDetectionService,
    NotificationService,
    LocalNotifications,
    InAppBrowser,
    AlertController,
    Device,
    BrowserModule,
    FileApiProvider, 
    FileUpload,
    { provide: ZetaPushClientConfig, useValue: environment.zetapush },
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
