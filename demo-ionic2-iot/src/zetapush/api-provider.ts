import { NgZone } from '@angular/core';
import { ZetaPushClient, createApi } from './index';
import { BeaconApi, WebRtcApi } from './zetapush.service';

export function BeaconApiFactory(client: ZetaPushClient, zone: NgZone): BeaconApi {
    return createApi(client, zone, BeaconApi) as BeaconApi;
}

export function WebRtcApiFactory(client: ZetaPushClient, zone: NgZone): WebRtcApi {
    return createApi(client, zone, WebRtcApi) as WebRtcApi;
}

export const BeaconApiProvider = {
    provide: BeaconApi, useFactory: BeaconApiFactory, deps: [ZetaPushClient, NgZone]
}

export const WebRtcApiProvider = {
    provide: WebRtcApi, useFactory: WebRtcApiFactory, deps: [ZetaPushClient, NgZone]
}