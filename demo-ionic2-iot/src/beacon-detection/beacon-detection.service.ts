import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { BeaconApi, BeaconDetection } from '../zetapush/zetapush.service';


@Injectable()
export class BeaconDetectionService {

	// Variables
	beacons = {};
	timer: number;
	uuidDevice: number;


	constructor(private api: BeaconApi, private platform: Platform, private device: Device){

		// Get device informations
		this.platform.ready().then(() => {
			this.setUUID(this.device.uuid);
		})
	}

	// Called when the UI with beacon detection is shown
	start(): void {
		// Launch the scan
		this.timer = setInterval(() => {
			this.updateBeaconDetectionList()
		}, 2000);
		this.startScan();
	}

	setUUID(device){
		this.uuidDevice = device;
	}

	startScan(){
		this.platform.ready().then(readySource => {
			if (readySource === 'cordova'){
        		console.log("Scan in progress...");
        		evothings.eddystone.startScan(
          		(beacon) => {
            		beacon.timeStamp = Date.now();

            		// Detect URL >and< UID Eddystone beacon
            		if (beacon.url != undefined){
            			this.beacons[beacon.url] = beacon;
            		} else if (beacon.nid != undefined){
            			this.beacons[beacon.nid] = beacon;
            		}
          		},
          		(error) => {
            		console.log("Error during the scan :", error);
          		});
      		};
		})
	}

	// To call this function to stop the scan
	stop() {
		evothings.eddystone.stopScan();
		clearInterval(this.timer)
		console.log("Scan stopped");
	}

	// Called to delete the old beacons
	updateBeaconDetectionList() {

		// Remove old beacons
		var timeNow = Date.now();
		for (let key in this.beacons)
		{
			if (this.beacons[key].timeStamp + 10 < timeNow)				// We keep only the beacons updated the last 10 seconds
			{
				delete this.beacons[key];
			}
		}
	}

	// Called to get all beacon detections
	getAllBeaconDetections(): Promise<BeaconDetection[]> {
		// Display beacon detections in the UI
		let sortedList = this.beacons;					// Get the beacon detections list

		// Range the sortedList and update the ListBeaconDetection
		let allBeacons: BeaconDetection[] = [];
		for (let key in sortedList)
		{
			let beaconDetection = sortedList[key];
			let beacon: BeaconDetection;

			if (beaconDetection.timeStamp != undefined)
			{
				beacon = {
					data: undefined,
					timestamp: beaconDetection.timeStamp,
					device: String(this.uuidDevice),
					distance: evothings.eddystone.calculateAccuracy(beaconDetection.txPower, beaconDetection.rssi)
				};

				// Modify the beacon object regarding his type
				if (beaconDetection.url != undefined){ beacon.data = beaconDetection.url;}
				else if (beaconDetection.nid != undefined){ beacon.data = this.uint8ArrayToString(beaconDetection.nid) + " - " + this.uint8ArrayToString(beaconDetection.bid);}

				allBeacons.push(beacon);
			}

		}

		// Send beacon detections to the UI via Zetapush
		for (let key in allBeacons){
			// Send each beacon to the zetapush platform

			this.api.newBeaconDetection(allBeacons[key]).then( ( msg ) => {
				console.log("newBeaconDetection::sendToZetapush");
			}, (errors) => {
				console.error("newBeaconDetection::Error", errors);
			});
		}


		return Promise.resolve(allBeacons);
	}

	// Method to get only URL beacons
	getUrlBeacons(): Promise<BeaconDetection[]>{

		// Range the sortedList and update the ListBeaconDetection
		let urlBeacons: BeaconDetection[] = [];
		for (let key in this.beacons)
		{
			let beaconDetection = this.beacons[key];
			let beacon: BeaconDetection;

			if (beaconDetection.timeStamp != undefined && beaconDetection.url != undefined)
			{
				beacon = {
					data: beaconDetection.url,
					timestamp: beaconDetection.timeStamp,
					device: String(this.uuidDevice),
					distance: evothings.eddystone.calculateAccuracy(beaconDetection.txPower, beaconDetection.rssi)
				};

				urlBeacons.push(beacon);
			}

		}

		return Promise.resolve(urlBeacons);
	}

	// Method to transform UID namespace and instance to a String Object
	uint8ArrayToString(uint8Array) {
		function format(x)
		{
			var hex = x.toString(16);
			return hex.length < 2 ? '0' + hex : hex;
		}
		var result = '';
		for (var i = 0; i < uint8Array.length; ++i)
		{
			result += format(uint8Array[i]);
		}
		return result;
	}
}
