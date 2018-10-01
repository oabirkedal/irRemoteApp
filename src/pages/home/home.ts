import { Component } from '@angular/core';
import { NavController, ModalController, ActionSheetController, ToastController, Events } from 'ionic-angular';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';
import { ButtonProvider } from '../../providers/button/button';
import { ScanPage } from '../scan/scan';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  //Show and hide html message
  waitingForRemote: boolean = false;

  constructor(public navCtrl: NavController, public bluetooth: BluetoothProvider,
    public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController, public events: Events, public button: ButtonProvider ) {

      //Subscribe to incoming bluetooth message from bluetooth provider
      events.subscribe('message:received', (msg, time) => {
        this.actOnBluetoothMessage(msg);
        console.log('Received an event message: ' + msg + ' at ' + time);
      });
  }

  //When button is clicked, either edit button to learn new IR signal or send the IR signal already learned
  buttonClicked(button) {
    //Record which button was last clicked
    this.button.currentButton = button.name;
    //Check for BLE connection before attempting to send a command
    if(!this.bluetooth.connection) {
      //If there is no bluetooth device connecte, let user know what to do next
      this.setToast("Find remote first", 1200, 'middle');
    } else {
      //Check whether button has already learned an IR signal
      if (button.state === this.button.buttonState.received) {
        //If button has already learned an IR signal, tell peripheral to emit that signal
        this.bluetooth.sendBluetoothMessage('s'+button.name, this.bluetooth.peripheral);
        this.setToast("Sent " + button.name + " Command", 1200, 'bottom');
      } else {
        //If button has not learned an IR signal yet, ask for confirmation to learn it
        this.presentActionSheet(button, "Ready to aim remote at peripheral?", "Yes");
      }
    }
  }

  //Tell peripheral to learn an IR signal. Signal to user that button is in edit mode
  sendEditMode(data) {
    //Check for bluetooth connection before attempting to send data
    if (this.bluetooth.connection) {
      this.bluetooth.sendBluetoothMessage('e'+data.name, this.bluetooth.peripheral);
      this.setButtonInEditMode(data);
    } else {
      this.setToast("Peripheral unexpectedly disconnected", 2000, 'middle');
    }
  }

  setButtonInEditMode(data) {
    data.color = this.button.color.gray;
    this.waitingForRemote = true;
  }

  //When user clicks 'Edit Buttons,' change button colors to gray and button state
  editButtons() {
    this.button.editMode = !this.button.editMode;
    if (this.button.editMode) {
      this.setEditMode();
    } else {
      this.exitEditMode();
    }
  }

  setEditMode() {
    //Store current state of buttons before setting them all in edit mode
    this.button.storePreviousState().then(() => {
      this.button.setButtonState(this.button.buttonState.ready);
    });

    //Store current button colors before setting them to gray
    this.button.storePreviousColor().then(() => {
      this.button.setEditModeButtonColors();
    })
  }

  exitEditMode() {
    this.button.restorePreviousState();
    this.button.restorePreviousColor();
  }

  //When 'Find remote' btn is clicked, open modal page that scans for BLE devices
  openScanModal(instruction) {
    if (instruction === 0) {
      let scanModal = this.modalCtrl.create(ScanPage);

      scanModal.onDidDismiss(data => {
        if (data.name === "exit") {
          //Do nothing. The user exited scanModal without connecting to peripheral
        } else if (data.id){
          //Store the peripheral data received from bluetooth.scan()
          this.bluetooth.peripheral = data;
          //Connect to bluteooth peripheral
          this.bluetooth.connect(data);
          //Gray out 'Find remote' button to signal that user is connected. Color will change back to blue if peripheral disconnects
          this.button.findRemoteButton.color = this.button.color.gray;
          //Set state of 'Find remote' button. Value will toggle if peripheral disconnects.
          this.button.findRemoteButton.state = 1;
        } else {
          console.log("error from scanModal");
        }
      });
      scanModal.present();
    } else {
      //Present action sheet if user wants to connect to a different peripheral
      this.presentActionSheet("scanBluetooth", "Connect to another peripheral?", "Yes");
    }
  }

  //Identify incoming bluetooth message and what action to take
  actOnBluetoothMessage(msg) {
    //Identify message sent from peripheral by comparing strings
    this.compareString(msg).then(object => {
      //If the returned button object matches the button last pressed, change button color and state
      if (object["name"] === this.button.currentButton) {
        //Signal that the button has learned an IR command
        object["state"] = this.button.buttonState.received;
        object["previousState"] = this.button.buttonState.received;
        object["color"] = object["originalColor"];
        object["previousColor"] = object["originalColor"];
        //Hide html text
        this.waitingForRemote = false;
      }
    });
  }

  compareString(string) {
    return new Promise((resolve, reject) => {

      let object: any = {};

      if (string === 'disconnected') {
        //If peripheral disconnects, signal to user by changing button color to blue
        this.button.findRemoteButton.color = this.button.color.blue;
      } else if (string === 'irReady') { //Peripheral is ready to receive IR signal from remote
        //Do nothing for now
      } else if (string === 'irReceived'){ //Peripheral received IR signal from remote
        //Find which button received message from peripheral and return the button object
        for (let button of this.button.buttons) {
          if (button.name === this.button.currentButton) {
            object = button;
          }
        }
      } else {
        console.log("error: incorrect bluetooth message at this stage");
        reject();
      }
      resolve(object);
    });
  }

  presentActionSheet(data, heading, buttonText) {
   let actionSheet = this.actionSheetCtrl.create({
     title: heading,
     buttons: [
       {
         text: buttonText,
         handler: () => {
           if (data === 'scanBluetooth') {
             this.button.findRemoteButton.state = 0;
             this.bluetooth.disconnect(this.bluetooth.peripheral);
             this.openScanModal(this.button.findRemoteButton.state);
           } else {
             this.sendEditMode(data);
           }
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('Cancel clicked');
         }
       }
     ]
    });
    actionSheet.present();
  }

  setToast(msg, duration, position) {
   let toast = this.toastCtrl.create({
     message: msg,
     duration: duration,
     position: position
   });
   toast.present();
  }

  ionViewDidLeave() {
    console.log("Left View")
  }

}
