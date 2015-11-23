angular.module('controller', [])

.controller('DroneController', function(
	$scope,
	$cordovaBluetoothSerial,
	$timeout,
	$interval,
	$cordovaGeolocation
) {
	//$scope.name = '';
	$scope.sensorsSelected = false;
	$scope.mapsSelected = false;
	$scope.deviceList = [];
	$scope.isConnected = false;

	var count = 0;
	var recording;
	Chart.defaults.global.animation = false;
	//Chart.defaults.global.responsive = false;

	$scope.showSensors = function() {
		$scope.mapsSelected = false;
		$scope.sensorsSelected = true;

		$scope.graph = {};
		$scope.graph.series = ['Sensor_VS_Time'];
//		$scope.graph.labels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		$scope.graph.labels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		$scope.graph.data1 = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];
		$scope.graph.data2 = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];
		$scope.graph.data3 = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];

		if ( !$scope.isConnected ) {
			alert("Bluetooh Disconnected!");
		}
	};

	$scope.showMaps = function() {
		$scope.mapHeight = window.screen.height;
		$scope.sensorsSelected = false;
		$scope.mapsSelected = true;

		$scope.stopSensorData();
		count = 0;
	};

	$scope.getDevices = function() {
	    $cordovaBluetoothSerial.isEnabled().then(
	      function() {
			$cordovaBluetoothSerial.list().then(
		      function(listData) {
		        if ( listData ) {
		        	for (var i = 0; i < listData.length; i++) {
		        		$scope.deviceList.push({
							address: listData[i].address,
			        		id: listData[i].id,
			        		name: listData[i].name
		        		})
		        	};
		        }
		      },
		      null
			);
	      },
	      function() {
	      	alert("Bluetooh Disabled!");
	      }
	    );
	};

	$scope.deviceSelected = function() {
		var device = $scope.currSelect;
		$cordovaBluetoothSerial.connect(device.address).then(
			function() {
				$timeout(
					function() {
						$scope.isConnected = true;
						alert("Connected! " + $scope.isConnected);
					},
					3000
				);
			},
			function() {
				alert("Connection failed!");
				$scope.isConnected = false;
			}
		);
	};

	$scope.send = function(param) {
		$cordovaBluetoothSerial.isConnected().then(
			function() {
				if ( param ) {
					$cordovaBluetoothSerial.write(param);
				} else {
					$cordovaBluetoothSerial.write($scope.dataToSend);
					$scope.dataToSend = '';
				}
			},
			function() {
				alert("Connection failed!");
			}
		);
	};

	$scope.pwmChanged = function() {
		var pwm = $scope.pwm;

		if ( pwm % 10 == 0 ) {
			$scope.send(pwm);
		}
	};

	$scope.getSensorData = function() {
		$scope.startRecord();
		$scope.isGettingSensorData = true;
	};

	$scope.startRecord = function() {

		recording = $interval(function () {
			$cordovaBluetoothSerial.readUntil('\n').then(
				function (data) {
			    	console.log(data);
			    	var dataReceived = [];
			    	dataReceived = data.split('-');
				    if ( dataReceived[0] === 'R' ) {
						var sensorData1 = $scope.graph.data1;
						sensorData1[0].shift();
						sensorData1[0].push(dataReceived[1]);
						$scope.graph.data1 = sensorData1;

						var sensorData2 = $scope.graph.data2;
						sensorData1[1].shift();
						sensorData1[1].push(dataReceived[2]);
						$scope.graph.data2 = sensorData2;

						var sensorData3 = $scope.graph.data3;
						sensorData1[2].shift();
						sensorData1[2].push(dataReceived[3]);
						$scope.graph.data3 = sensorData3;

						var sensorLabels = $scope.graph.labels;
						sensorLabels.shift();
						$scope.graph.labels.push(count);
						$scope.graph.labels = sensorLabels;

						count = count++;
				    }
				}
			);
		}, 200);
	};

	$scope.stopSensorData = function() {
		$interval.cancel(recording);
		$scope.isGettingSensorData = false;
	};

	/*$scope.onClick = function (points, evt) {
		console.log(points, evt);
	};*/

/////////////////////// MAPS ///////////////////////

	var options = {timeout: 10000, enableHighAccuracy: true};
	$scope.centerMe = function() {
		$cordovaGeolocation.getCurrentPosition(options).then(
			function(position) {
				//var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var latLng = new google.maps.LatLng(37.3000, -120.4833);
				var mapOptions = {
					center: latLng,
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

		        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
		 
		        navigator.geolocation.getCurrentPosition(function(pos) {
		            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		            var myLocation = new google.maps.Marker({
		                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
		                map: map,
		                title: "My Location"
		            });
		        });

				$scope.map = map;

			},
			function(error) {
				console.log("Could not get location");
			}
		) 	;
	};

});

