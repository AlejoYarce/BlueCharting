angular.module('controller', [])

.controller('blueController', function($scope, $cordovaBluetoothSerial, $timeout, $interval) {
	$scope.name = '';
	$scope.deviceList = [];
	$scope.isConnected = false;

	var count = 0;

	Chart.defaults.global.animation = false;
	//Chart.defaults.global.responsive = false;

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

	$scope.graph = {};
	$scope.graph.series = ['Sensor_1', 'Sensor_2', 'Sensor_3'];
	$scope.graph.labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
	$scope.graph.data = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

	$scope.onClick = function (points, evt) {
		console.log(points, evt);
	};

	// Simulate async data update
	/*$interval(function () {
		$cordovaBluetoothSerial.readUntil('\n', function (data) {
		    console.log(data);
		    if ( data.charAt(0) === 'E' ) {
		    	alert('yeah!');
		    }
		});
	}, 1000); */

	$interval(function () {
		var sensorData = $scope.graph.data;
		sensorData[0].shift();
		sensorData[0].push(Math.random() * 100);
		$scope.graph.data = sensorData;

		var sensorLabels = $scope.graph.labels;
		sensorLabels.shift();
		$scope.graph.labels.push(count);
		$scope.graph.labels = sensorLabels;


		count = count + 2;
	}, 2000);

});

