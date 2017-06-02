import { Component, OnDestroy } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { WebRtcService } from '../../webrtc/webrtc.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'page-webrtc',
  templateUrl: 'webrtc.html'
})

export class WebRtcPage implements OnDestroy {

  // Variables
  loginUser: string;
  subscription: Subscription;
  stateConnection: string;

  constructor(
    public navCtrl: NavController,
    private webrtc: WebRtcService,
    private platform: Platform) {

      this.stateConnection = webrtc.stateConnection;
      this.subscription = webrtc.stateConnectionChange.subscribe((value) => {
        this.stateConnection = value;
      })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ionViewDidEnter(): void {
    console.log("Start the webRTC client");
    this.stateConnection = 'connection';
    this.platform.ready().then(() => {
      this.loginUser = this.generateName();
      this.webrtc.init(this.loginUser);
    })
  }

  ionViewWillLeave(): void {
    console.log("Leave the tab");
    this.webrtc.stopRTC();
  }

  changeView(): void {
    this.webrtc.changeView();
  }

  switchConnection(): void {
    this.webrtc.switchConnection();

  }

  generateName() {
    let text = "";
    let charset = "abcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < 10; i++ ) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return text;

  }


}
