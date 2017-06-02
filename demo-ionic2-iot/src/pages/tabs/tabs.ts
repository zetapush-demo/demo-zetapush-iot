import { Component } from '@angular/core';

import { DetectionPage } from '../detection/detection';
import { BeaconConfigurationPage } from '../beacon-configuration/beacon-configuration';
import { WebRtcPage } from '../webrtc/webrtc';

@Component({
  templateUrl: 'tabs.html'
})


export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = DetectionPage;
  tab2Root: any = BeaconConfigurationPage;
  tab3Root: any = WebRtcPage;

  constructor() {

  }

  selectDetection(){
  	tab = 1;
  }

  selectBeaconConfiguration(){
  	tab = 2;
  }

  selectWebRTC(){
    tab = 3;
  }
}

export let tab:number = 1;
