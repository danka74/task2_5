angular
		.module('ResultsControllerModule', [ ])
		.controller(
				'ResultsController',
				[
						'$scope',
						'$location',
						'$window',
						'jwtHelper',
						'BindingService',
						function($scope, $location, $window, jwtHelper,
								bindingService) {

							var url = $location.$$absUrl;
							var tokenIndex = url.indexOf("?token=");
							if (tokenIndex != -1) {
								var token = url.substring(url
										.indexOf("?token=") + 7, url.length);
								console.log(token);
								$window.sessionStorage.token = token;
								$scope.user = jwtHelper.decodeToken(token);
							}
							
							$scope.assessments = [ "0", "Full", "Inferred", "Partial", "No", "N/A" ]; 
							
							// // SCT only or Alternative study arm, false=SCT,
							// // true=Alternative
							$scope.scenario = false;
							$scope.scenarioSwitch = false;
							$scope.changeScenario = function(switchTo) {
								console.log("changeScenario " + switchTo)
								if (switchTo == null)
									$scope.scenario = !$scope.scenario;
								else if (switchTo == true)
									$scope.scenario = true;
								else
									$scope.scenario = false;
								$scope.scenarioSwitch = $scope.scenario;
								bindingService.getAll($scope.scenario).success(function(data) {
									$scope.case_templates = data;
									console.log(data);
								}).error(function() {
									$scope.case_templates = [];
								});
							};
							
							bindingService.getAll($scope.scenario).success(function(data) {
								$scope.case_templates = data;
								console.log(data);
							}).error(function() {
								$scope.case_templates = [];
							});
								
							
						} ]);