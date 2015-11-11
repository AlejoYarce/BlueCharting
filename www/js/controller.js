angular.module('controller', [])

.controller('blueController', function($scope, $cordovaBluetoothSerial, $timeout, $interval) {
	$scope.name = '';
	$scope.deviceList = [];
	$scope.isConnected = false;

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
	$scope.graph.labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.graph.series = ['Series A', 'Series B', 'Series C'];
	$scope.graph.data = [
		[65, 59, 80, 81, 56, 55, 40],
		[28, 48, 40, 19, 86, 27, 90],
		[28, 48, 4, 1, 8, 20, 94]
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
		$scope.graph.data = [
			[28, 48, 04, Math.random(), 08, 20, 94],
			[28, 48, 40, 19, 86, 27, Math.random()],
			[65, 59, Math.random(), 81, 56, 55, 40]
		];
	}, 1000);

});

