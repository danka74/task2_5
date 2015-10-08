angular
		.module('DashboardControllerModule', [ 'chart.js' ])
		.controller(
				'DashboardController',
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

							var assessmentCount = {
								sct : [],
								alt : []
							};
							for (var i = 0; i < 5; i++) {
								assessmentCount.sct[i] = 0;
								assessmentCount.alt[i] = 0;
							}

							bindingService
									.getStats()
									.success(
											function(data) {
												$scope.results = data;

												for (b in $scope.results) {
													var binding = $scope.results[b]._id;
													if (binding.scenario == "SCT")
														assessmentCount.sct[binding.assessment-1]++;
													else
														assessmentCount.alt[binding.assessment-1]++;
												}

												$scope.labels = [ 'Full', 'Inferred',
														'Partial', 'No', 'OOS' ];
												$scope.series = [ 'SCT', 'ALT' ];

												$scope.data = [
														assessmentCount.sct,
														assessmentCount.alt ];

												console.log(assessmentCount);

											}).error(function() {
										$scope.results = [];
									});

						} ]);