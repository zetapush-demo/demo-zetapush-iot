import { Component, OnInit } from '@angular/core';
import { NavController, Tab } from 'ionic-angular';
import { BeaconDetectionService } from '../../beacon-detection/beacon-detection.service';
import { BeaconDetection } from '../../zetapush/zetapush.service';
import { Platform } from 'ionic-angular';
import { tab } from '../tabs/tabs';
import { BackgroundBeaconDetectionService } from '../../background/background-beacon-detection.service';
import { AlertController } from 'ionic-angular';
import { ServiceConfiguration } from '../../pages/service-configuration/service-configuration';
import { ZetapushService } from '../../zetapush/zetapush.service';

@Component({
  selector: 'page-detection',
  templateUrl: 'detection.html',
  providers: [BeaconDetectionService]
})

export class DetectionPage implements OnInit {

  // Variables
  timer:number;
  beaconDetectionList: BeaconDetection[] = [];

  constructor(private zpService: ZetapushService, private alertCtrl: AlertController, private tab: Tab, private navCtrl: NavController, private platform: Platform, private beaconService: BeaconDetectionService, private backDetection: BackgroundBeaconDetectionService) {

    // Detect when the app is in background
    document.addEventListener('pause', () => {
      console.log("Listener background");
      this.goToBackground();

    });

    // Detect when the app is in foreground
    document.addEventListener('resume', () => {
      console.log("Listener foreground");
      this.goToForeground();
    });

  }

  goToBackground(): void {
    this.ionViewWillLeave();
    this.backDetection.startBackgroundScan();

  }

  goToForeground(): void {
    if (tab === 1){
      this.ionViewDidEnter();
    }
    this.backDetection.stopBackgroundScan();
  }

  // Get all beacons detections
  getAllBeacons(): void {
  	this.beaconService.getAllBeaconDetections().then(beaconDetectionList => this.beaconDetectionList = beaconDetectionList);
  }

  // Stop setInterval on getAllBeacons
    stopTimerGetBeacons(): void {
    clearInterval(this.timer);
  }

  ionViewDidEnter(): void {
    console.log("Launch the foreground beacon Detection");

    // Launch the UI update
    this.timer = setInterval(() => { this.getAllBeacons(); }, 2000);

    // Start service
    this.beaconService.start();
  }

  ionViewWillLeave(): void {
    this.beaconService.stop();
    this.stopTimerGetBeacons();
  }

  ngOnInit(): void {

    // Zetapush connection and init the macro service
    this.platform.ready().then(() => {

        // Connection to the Zetapush platform
        this.zpService.onSubmit();

    })
  }

  configBeacon(url: string){
      this.navCtrl.push(ServiceConfiguration, {
          url: url
      });
  }

  GoToUrl(url: string){
      this.platform.ready().then(() => {
          open(String(url), "_blank", "location=yes");
      });
  }

  isUrl(s) {
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      return regexp.test(s);
  }

}
