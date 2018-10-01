import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';


@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {

  exit: any;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
      public bluetooth: BluetoothProvider ) {
        this.exit = {
          name: "exit"
        }
  }

  ionViewDidEnter() {
    this.bluetooth.scan();
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  sendBluetoothMessage(data) {

  }

}
