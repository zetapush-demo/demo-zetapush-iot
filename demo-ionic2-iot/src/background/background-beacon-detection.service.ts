import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { BackgroundMode } from '@ionic-native/background-mode';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BackgroundBeaconDetectionService{

	// Variables
	beacons = {};
	available: boolean = false;
	timer: number;


	constructor(private backgroundMode: BackgroundMode, private platform: Platform, private device: Device, private notifService: NotificationService){

		this.platform.ready().then(readySource => {
			if (readySource === 'cordova'){
				this.available = true;
			}
		});
	}

	startBackgroundScan(): void {
		// Scan beacon every 15 seconds
		this.timer = setInterval(() => {
			if (this.available){
				console.log("Background scan in progress...");
				evothings.eddystone.startScan(
          			(beacon) => {
            			beacon.timeStamp = Date.now();
            			// Detect only URL Eddystone beacon
          				if (beacon.url != undefined){ this.beacons[beacon.url] = beacon;}
          			},
          			(error) => {
            			console.error("Error during the background scan :", error);
          			});

				// Stop the scan after 2 seconds
				setTimeout(() => {
					evothings.eddystone.stopScan();
					console.log("Stop the background scan");
				}, 1500);

				// Show notification for each beacon detected
				let i = 0;
				for (let key in this.beacons){
					i++;
					console.log("Detected => ", this.beacons[key].url);
					this.notifService.sendNotification(this.beacons[key].url, i);
				}
			}
		}, 15000);
	}

	stopBackgroundScan(): void {
		clearInterval(this.timer);

	}
}
