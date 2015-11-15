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
							
							$scope.assessments = [ "0", "Full", "inferred", "Partial", "No coverage", "N/A" ]; 
							
							bindingService.getAll(false).success(function(data) {
								$scope.case_templates = data;
								console.log(data);
							}).error(function() {
								$scope.case_templates = [];
							});
								
							
						} ]);