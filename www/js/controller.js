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
		$scope.graph.labels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		$scope.graph.data1 = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
						sensorData2[1].shift();
						sensorData2[1].push(dataReceived[2]);
						$scope.graph.data2 = sensorData2;

						var sensorData3 = $scope.graph.data3;
						sensorData3[2].shift();
						sensorData3[2].push(dataReceived[3]);
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

	var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var labelsIndex = 0;
	var options = {timeout: 10000, enableHighAccuracy: true};
	var map, poly;

	$scope.centerMe = function() {
		$cordovaGeolocation.getCurrentPosition(options).then(
			function(position) {
				var mapOptions = {
					center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

		        map = new google.maps.Map(document.getElementById("map"), mapOptions);
		        labelsIndex = -1;

		        navigator.geolocation.getCurrentPosition(function(pos) {
		        	var positionLatLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
		        });

				$scope.map = map;

				// This event listener calls addMarker() when the map is clicked.
				google.maps.event.addListener(map, 'click', function(event) {
						$scope.addMarker(event.latLng, map);
				});

				poly = new google.maps.Polyline({
					strokeColor: '#000000',
					strokeOpacity: 1.0,
					strokeWeight: 5
				});
				poly.setMap(map);
			},
			function(error) {
				alert("GPS Disconnected!");
			}
		);
	};

	$scope.addMarker = function(positionLatLong, map) {
		labelsIndex++;
		var path = poly.getPath();
		path.push(positionLatLong);

        var marker = new google.maps.Marker({
            position: positionLatLong,
            map: map,
            label: labels[labelsIndex]
        });
	};

});

