import { Injectable, Component, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { NavController, ToastController, Events } from 'ionic-angular';

/*
  Generated class for the BluetoothProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.

  This provider relies on the 'connect' example by Don Coleman
  See https://github.com/don/ionic-ble-examples/tree/master/connect/src

*/

const serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const txCharacteristic = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const rxCharacteristic = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

enum BluetoothConnection {
  disconnected,
  connected
}

@Injectable()
export class BluetoothProvider {

  devices: any[] = [];
  peripheral: any = {};
  statusMessage: string;

  connection: any;

  constructor(private ble: BLE, private toastCtrl: ToastController, private ngZone: NgZone,
        public events: Events ) {

    console.log('Hello BluetoothProvider Provider');

  }

  scan() {
    this.setStatus('Scanning for Bluetooth LE Devices');
    this.devices = [];  // clear list
    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
  );

  setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
}

onDeviceDiscovered(device) {
  console.log('Discovered ' + JSON.stringify(device, null, 2));
  this.ngZone.run(() => {
    this.devices.push(device);
  });
}

// If location permission is denied, you'll end up here
scanError(error) {
  this.setStatus('Error ' + error);
  let toast = this.toastCtrl.create({
    message: 'Error scanning for Bluetooth low energy devices',
    position: 'middle',
    duration: 5000
  });
  toast.present();
}

setStatus(message) {
  console.log(message);
  this.ngZone.run(() => {
    this.statusMessage = message;
  });
}

connect(device) {
  this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );
}

onConnected(peripheral) {
    this.connection = BluetoothConnection.connected;

    this.ngZone.run(() => {
      this.setStatus('');
      this.peripheral = peripheral;
    });

    // Subscribe for notifications when the temperature changes
    this.ble.startNotification(peripheral.id, serviceUUID, rxCharacteristic).subscribe(
      data => this.onReceiveChange(data, peripheral),
      () => this.setStatus('Unexpected Error')
    )

    // Update the UI with the current state of the switch characteristic
    this.ble.read(peripheral.id, serviceUUID, rxCharacteristic).then(
      buffer => {
        this.ngZone.run(() => {

        });

      });
  }

  onDeviceDisconnected(peripheral) {

    this.connection = BluetoothConnection.disconnected;

    this.publishEvent("disconnected");

    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  //Receive bytes of data from peripheral
  onReceiveChange(buffer:ArrayBuffer, peripheral) {

    var data = new Uint8Array(buffer);

    //Notify home page about incoming data
    this.publishEvent(this.bytesToString(data));

    //Convert bytes to string
    console.log("String: " + this.bytesToString(data));

    this.ngZone.run(() => {

    });
  }

  sendBluetoothMessage(data, peripheral) {
    this.ble.writeWithoutResponse(peripheral.id, serviceUUID, txCharacteristic, this.stringToBytes(data)).then(
      () => console.log("Success"),
      () => console.log("Unexpected Error")
    );
  }

  checkBluetoothConnection(peripheral) {
    this.ble.isConnected(peripheral.id).then(
      () => this.connection = BluetoothConnection.connected,
      () => this.connection = BluetoothConnection.disconnected);
  }

  disconnect(peripheral) {
    this.ble.disconnect(peripheral.id).then(
      () => console.log("successful disconnect"),
      () => console.log("error: disconnect failed"));
  }

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
     }
    return array.buffer;
  }


  publishEvent(data) {
    console.log("Message received");
    this.events.publish('message:received', data, Date.now());
  }

}
