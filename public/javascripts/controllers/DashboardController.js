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

							$scope.chartNo = 0;
							$scope.dataLoaded = false;
							$scope.statistics = "";
							$scope.title = "";
							$scope.maxChart = 4;

							$scope.nextChart = function() {
								if (!$scope.dataLoaded)
									return;

								console.log("next chart");

								switch ($scope.chartNo) {
								case 0: {
									var totCount = [ 0, 0 ];
									var users = [];
									for (b in $scope.results) {
										var binding = $scope.results[b]._id;
										if (binding.target != undefined) {
											if (binding.scenario == "SCT")
												totCount[0]++;
											else
												totCount[1]++;
										}

										var user = users.indexOf(binding.user);
										if (user == -1) {
											users.push(binding.user);
										}
									}
									$scope.series = [ 'SCT', 'ALT' ];
									$scope.labels = [ 'Total' ];
									$scope.data = [ [ totCount[0] ],
											[ totCount[1] ] ];
									$scope.statistics = "total count = "
											+ (totCount[0]
											+ totCount[1])
											+ ", no. of users = "
											+ users.length;
									$scope.title = "Total count";
									$scope.type = 'Bar';
									break;
								}
								case 1: {
									var assessmentCount = {
										sct : [],
										alt : []
									};
									for (var i = 0; i < 5; i++) {
										assessmentCount.sct[i] = 0;
										assessmentCount.alt[i] = 0;
									}

									for (b in $scope.results) {
										var binding = $scope.results[b]._id;
										if (binding.scenario == "SCT")
											assessmentCount.sct[binding.assessment - 1]++;
										else
											assessmentCount.alt[binding.assessment - 1]++;
									}

									$scope.labels = [ 'Full', 'Inferred',
											'Partial', 'No', 'OOS' ];
									$scope.series = [ 'SCT', 'ALT' ];

									$scope.data = [ assessmentCount.sct,
											assessmentCount.alt ];

									$scope.type = 'Bar';

									var chi2 = $scope.chi2([
											assessmentCount.sct,
											assessmentCount.alt ]);
									var df = 1 * (assessmentCount.sct.length - 1);

									$scope.statistics = "df = " + df
											+ ", chi2 = " + chi2;
									$scope.title = "Coverge";
									break;
								}
								case 2: {
									var groupCount = [ 0, 0 ];
									for (b in $scope.results) {
										var binding = $scope.results[b]._id;
										if (binding.target != undefined) {
											if (binding.scenario == "SCT")
												if (binding.target.indexOf(";") == -1)
													groupCount[0]++;
												else
													groupCount[1]++;
										}
									}
									$scope.labels = [ 'Single code', 'Grouped' ];
									$scope.series = [ 'SCT', 'ALT' ];
									$scope.data = groupCount;
									var groupings = (100 * (groupCount[1] / (groupCount[0] + groupCount[1])))
											.toFixed(2);
									$scope.statistics = "groupings "
											+ groupings + " %";
									$scope.title = "Grouping (SNOMED CT)";
									$scope.type = 'Pie';
									break;
								}
								case 3: {
									var groupCount = [ 0, 0 ];
									for (b in $scope.results) {
										var binding = $scope.results[b]._id;
										if (binding.target != undefined) {
											if (binding.scenario == "ALT")
												if (binding.target.indexOf(";") == -1)
													groupCount[0]++;
												else
													groupCount[1]++;
										}
									}
									$scope.data = groupCount;
									var groupings = (100 * (groupCount[1] / (groupCount[0] + groupCount[1])))
											.toFixed(2);
									$scope.statistics = "groupings "
											+ groupings + " %";
									$scope.title = "Grouping (Alternative)";

								}
								}
								$scope.chartNo++;
								if ($scope.chartNo == $scope.maxChart)
									$scope.chartNo = 0;
							}

							bindingService.getStats().success(function(data) {
								$scope.results = data;

								$scope.dataLoaded = true;

								$scope.nextChart();

							}).error(function() {
								$scope.results = [];
							});

							$scope.chi2 = function(data) { // an n x m array
								var lenX = data.length;
								var lenY = data.reduce(function(a, b) {
									return Math.min(a.length, b.length);
								});

								console.log(data);
								console.log(lenX);
								console.log(lenY);

								var expected = [];
								var sumX = [];
								var sumY = [];
								var total = 0;
								for (var i = 0; i < lenY; i++)
									sumX[i] = 0.0;

								for (var iX = 0; iX < lenX; iX++) {
									sumY[iX] = 0.0;
									for (var iY = 0; iY < lenY; iY++) {
										sumY[iX] += data[iX][iY];
										sumX[iY] += data[iX][iY];
									}
									total += sumY[iX];
								}

								console.log(total);
								console.log(sumX);
								console.log(sumY);

								for (var iX = 0; iX < lenX; iX++) {
									expected[iX] = [];
									for (var iY = 0; iY < lenY; iY++) {
										expected[iX][iY] = sumX[iY] * sumY[iX]
												/ total;
									}
								}

								console.log(expected);

								var criticalValue = 0.0;
								for (var iX = 0; iX < lenX; iX++) {
									for (var iY = 0; iY < lenY; iY++) {
										var sqr = data[iX][iY]
												- expected[iX][iY];
										criticalValue += sqr * sqr
												/ expected[iX][iY];
									}
								}

								if (criticalValue <= 0.0)
									return 0;

								return criticalValue;

							}

						} ]);