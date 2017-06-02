import {  Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BeaconService, BeaconApi } from '../../zetapush/zetapush.service';
import { DetailsServices } from '../details-services/details-services';

@Component({
    selector: 'service-configuration',
    templateUrl: 'service-configuration.html',
    styleUrls: ['/src/pages/service-configuration/service-configuration.scss']
})

export class ServiceConfiguration implements OnInit {

    constructor(private api: BeaconApi, public navCtrl: NavController, public params: NavParams){
        this.url = params.get("url");

        // Subscribe to get the url service from the url beacon
        api.onGetServiceFromUrlBeacon.subscribe(( urlService ) => {
            if (urlService['res'].name != null){
                this.textLinkedService = " This beacon is linked with the service : ";
                this.textResLinkedLine = urlService['res'].name;
            }
        });

        // Subscribe to get all available services
        api.onGetAllAvailableService.subscribe(( listOfAvailableServices ) => {
            if (listOfAvailableServices['allServices'] != null){

                this.allAvailableServices = [];

                for (let s of listOfAvailableServices['allServices']){
                    this.allAvailableServices.push(s);
                }
            }
        })
    }

    // Variables
    url: string;
    linkedService: BeaconService;
    textLinkedService = "This beacon is not linked to any service";
    textResLinkedLine: string;
    allAvailableServices: BeaconService[] = [];
    serviceSelected: string;

    ngOnInit(){

        // Get the service from the url beacon
        this.api.getServiceFromUrlBeacon(this.url);

        // Get all available services
        this.api.getAllAvailableService();

    }

    goToDetails(): void {
        this.navCtrl.push(DetailsServices);
    }

    submitService(){

        console.log("service selected :", this.serviceSelected);
        this.api.setServiceFromUrlBeacon(this.serviceSelected, this.url);

        // Timeout to ensure that the modification is made
        setTimeout( () => {
            this.api.getServiceFromUrlBeacon(this.url);
        }, 100);

    }
}
