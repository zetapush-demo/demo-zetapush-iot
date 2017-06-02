import {  Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BeaconService, BeaconApi } from '../../zetapush/zetapush.service';

@Component({
    selector: 'details-services',
    templateUrl: 'details-services.html',
    styleUrls: ['/src/pages/details-services/details-services.scss']
})

export class DetailsServices implements OnInit {

    constructor(private api: BeaconApi, public navCtrl: NavController){
        // Subscribe to get all available services
        api.onGetAllAvailableService.subscribe(( listOfAvailableServices ) => {
            if (listOfAvailableServices['allServices'] != null){

                for (let s of listOfAvailableServices['allServices']){
                    this.listBeaconServices.push(s);
                }
            }
        })
    }

    listBeaconServices: Array<BeaconService> = [];

    ngOnInit(){
        // Get all available services
        this.api.getAllAvailableService();

    }
}
