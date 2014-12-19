(function() {
	app.controller("MainCtrl", function($scope, $http, $sce) {
		var urlMap = {
			services: "http://localhost:5556/services/serviceList"
		};

		$scope.features;
		$scope.currentFeature;

		function featuresRetrieved(data) {
			$scope.features = data;
		}

		$scope.logResponse = function(service) {
			$http.get("http://localhost:5556/services/" + service).success(function(data) {
				$scope.currentFeature = data;
			});
		}

		
		$scope.services = $http.get(urlMap.services,{
			headers: {
				'Content-type': 'application/json'
			}
	}).success(featuresRetrieved);

	});
}());