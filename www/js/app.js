angular.module('BlueChart', [
  'ionic',
  'controller',
  'ngCordova',
  'chart.js'
  ])

.run(function($ionicPlatform, $cordovaBluetoothSerial) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
