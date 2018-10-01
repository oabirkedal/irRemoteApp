import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { ScanPage } from '../pages/scan/scan';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BluetoothProvider } from '../providers/bluetooth/bluetooth';
import { ButtonProvider } from '../providers/button/button';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    ScanPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    ScanPage
  ],
  providers: [
    StatusBar,
    BLE,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BluetoothProvider,
    ButtonProvider
  ]
})
export class AppModule {}
