import { Injectable } from '@angular/core';
import { ZetaPushConnection } from './core';
import { Api } from './index';
import { Observable } from 'rxjs/Observable';


// Login and password to the Zetapush connection
class Credentials {
    public login = 'smartphone';
    public password = 'password';
}

export interface BeaconDetection {
	data: string;
	device: string;
	timestamp: number;
	distance: number;
}

export interface BeaconService {
    name: string;
    url: string;
    description: string;
}

export interface WebRtcMessage {
    type: string;
    data: any;
    src: string;
    dest: string;  
}

export interface uploadMessage {
    guid: string;
    metadata: any;
    tags: any;
}

@Injectable()
export class ZetapushService {

    // Variables
    credentials: Credentials;


    constructor(private connection: ZetaPushConnection){
        this.credentials = new Credentials();
    }

    // Method the connect the device to the zetapush platform
    onSubmit() {
        console.log("Connection::Zetapush", { credentials: this.credentials});
        this.connection.connect(this.credentials).then(() => this.onConnectionSuccess(), () => this.onConnectionError());
    }

    // The connection to the zetapush platform successed
    onConnectionSuccess() {
        console.log("Connection::onConnectionSuccess");
    }

    // The connection to the zetapush platform return an error
    onConnectionError() {
        console.log("Connection::onConnectionError");
    }
}

// Macro API
export class BeaconApi extends Api {

    onGetAllAvailableService: Observable<Array<BeaconService>>;
    onGetServiceFromUrlBeacon: Observable<BeaconService>;

    // Method to call macroscript : 'newBeaconDetection'
    newBeaconDetection({ timestamp, data, distance, device }: BeaconDetection) {
        return this.$publish('newBeaconDetection', { timestamp, data, distance, device});
    }

    // Method to call macroscript : 'getAllAvailableService'
    getAllAvailableService(): Promise<Array<BeaconService>> {
        return this.$publish('getAllAvailableService', { });
    }

    // Method to call macroscript : 'getServiceFromUrlBeacon'
    getServiceFromUrlBeacon(urlBeacon: string): Promise<BeaconService>{
        return this.$publish('getServiceFromUrlBeacon', { urlBeacon });
    }

    // Method to call macroscript : 'setServiceFromUrlBeacon'
    setServiceFromUrlBeacon(nameService: string, urlBeacon: string) {
        return this.$publish('setServiceFromUrlBeacon', { nameService, urlBeacon });
    }
}

export class WebRtcApi extends Api {

    onLogin: Observable<WebRtcMessage>;
    onAnswer: Observable<WebRtcMessage>;
    onCandidate: Observable<WebRtcMessage>;
    onOffer: Observable<WebRtcMessage>;
    onPhoto: Observable<string>;
    onListPictures: Observable<Array<string>>;

    login(login: WebRtcMessage): Promise<WebRtcMessage> {
        return this.$publish('login', { login });
    }

    answer(answer: WebRtcMessage): Promise<WebRtcMessage> {
        return this.$publish('answer', { answer });
    }

    candidate(candidate: WebRtcMessage): Promise<WebRtcMessage> {
        return this.$publish('candidate', { candidate });
    }

    offer(offer: WebRtcMessage): Promise<WebRtcMessage> {
        return this.$publish('offer', { offer });
    }

    photo(user: string, order: string): Promise<string> {
        return this.$publish('photo', { user, order });
    }

    listPictures(): Promise<Array<string>> {
        return this.$publish('listPictures', {});
    }

    disconnection(disconnection: WebRtcMessage): Promise<WebRtcMessage> {
        return this.$publish('disconnection', { disconnection });
    }
}
