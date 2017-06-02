import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Platform } from 'ionic-angular';

@Injectable()
export class NotificationService{

    constructor(private localNotification: LocalNotifications, private platform: Platform){}

    sendNotification(url: string, id: number){

      cordova.plugins.notification.local.schedule({
        id: id,
        title: "Beacon detected",
        text: url
      });

      // Trigger when click on notification
      cordova.plugins.notification.local.on('click', ( notification ) => {
        this.platform.ready().then(() => {
          open(String(notification.text), "_blank", "location=yes");
        });

      }, this);

      console.log("test");
    }



}
