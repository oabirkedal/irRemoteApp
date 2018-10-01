import { Injectable } from '@angular/core';

/*
  Generated class for the ButtonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

export class Button {
  name: string;
  color: string;
  previousColor: string;
  originalColor: string;
  state: number;
  previousState: number;
  editMode: boolean;

  constructor (name: string, color: string, originalColor: string, state: number) {
    this.name = name;
    this.color = color;
    this.previousColor = this.color;
    this.state = state;
    this.previousState = this.state;
    this.editMode = false;
    this.originalColor = originalColor;
  }

  setColor(color: string) {
    this.color = color;
  }

  storePreviousColor() {
    this.previousColor = this.color;
  }

  setOriginalColor() {
    this.color = this.originalColor;
  }

  restorePreviousColor() {
    this.color = this.previousColor;
  }

  setState(state) {
    this.state = state;
  }

  storePreviousState() {
    this.previousState = this.state;
  }

  restorePreviousState() {
    this.state = this.previousState;
  }

  changeEditMode() {
    this.editMode = !this.editMode;
  }

}

//Track the state of the button in regards to receiving IR signals from TV remote
enum ButtonState {
  blank,
  ready,
  received
}

@Injectable()
export class ButtonProvider {

  //Array for storing button objects
  buttons: any[] = [];

  //Instances of Button class
  powerButton: any;
  upButton: any;
  downButton: any;

  //Instance of 'Find remote' button
  findRemoteButton: any;

  //Track state of buttons with enum
  buttonState: any;

  //Store last clicked button
  currentButton: any;

  //Color options for buttons
  color: any;

  //Enter and exit edit mode
  editMode: boolean = false;

  constructor() {

    //Set color options for buttons
    this.color = {
      red: "#f53d3d",
      green: "#32db64",
      blue: "#488aff",
      gray: "#ababab"
    }

    //Get enum for button states
    this.buttonState = ButtonState;

    //Instantiate each button. Push each object to buttons[]
    this.pushObjectsToArray(this.powerButton = new Button("Power", this.color.blue, this.color.red, this.buttonState.blank));
    this.pushObjectsToArray(this.upButton   = new Button("VolUp", this.color.blue, this.color.green, this.buttonState.blank));
    this.pushObjectsToArray(this.downButton = new Button("VolDown", this.color.blue, this.color.blue, this.buttonState.blank));

    //Instantiate 'Find remote' button
    this.findRemoteButton = {
      color: this.color.blue,
      state: this.buttonState.blank
    }
  }

  pushObjectsToArray(object) {
    this.buttons.push(object);
  }

  insertProperty(property, data) {
    for(let buttons of this.buttons) {
      buttons[property] = data;
    }
  }

  setButtonState(button) {
    for (let button of this.buttons) {
      button.setState(this.buttonState.ready);
    }
  }

  setOriginalButtonColors() {
    for (let button of this.buttons) {
      button.setOriginalColor();
    }
  }

  setEditModeButtonColors() {
    this.insertProperty("color", this.color.gray);
  }

  storePreviousColor() {
    return new Promise(resolve => {
      for (let button of this.buttons) {
        button.storePreviousColor();
      }
      resolve();
    });
  }

  restorePreviousColor() {
    for (let button of this.buttons) {
      button.restorePreviousColor();
    }
  }

  storePreviousState() {
    return new Promise(resolve => {
      for (let button of this.buttons) {
        button.storePreviousState();
      }
      resolve();
    });
  }

  restorePreviousState() {
    for (let button of this.buttons) {
      button.restorePreviousState();
    }
  }

}
