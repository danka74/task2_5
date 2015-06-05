angular
		.module('MainControllerModule', [])
		.directive('bindHtmlCompile', [ '$compile', function($compile) {
			return {
				restrict : 'A',
				link : function(scope, element, attrs) {
					scope.$watch(function() {
						return scope.$eval(attrs.bindHtmlCompile);
					}, function(value) {
						element.html(value);
						$compile(element.contents())(scope);
					});
				}
			};
		} ])
		.controller(
				'MainController',
				[
						'$scope',
						'TemplateService',
						'BindingService',
						function($scope, templateService, bindingService) {

							$scope.currentCaseTemplate = null;
							$scope.currentCaseBinding = null;
							$scope.caseBindings = [];
							$scope.selectedCase = null;
							$scope.terminologies = [ {
								name : "SNOMED CT"
							}, {
								name : "ICD10"
							}, {
								name : "ATC"
							}, {
								name : "LOINC"
							} ]; // add regexp for validation?

							// for testing
							$scope.user = {
								uid : 'foo@bar.com'
							};

							templateService.get().success(function(data) {
								$scope.caseTemplates = data;
							});

							bindingService.get($scope.user).success(
									function(data) {
										$scope.caseBindings = data;
									});

							$scope.showCase = function($index) {
								if($scope.bindingForm.$dirty) {
									$scope.save(); // TODO: a modal?
								}
								
								var caseTemplate = $scope.caseTemplates[$index];

								console.log($index);
								console.log($scope.caseBindings);

								$scope.selectedCase = $index;

								$scope.currentCaseTemplate = caseTemplate;
								$scope.cancel();
								templateService.getTemplateHTML(caseTemplate)
										.success(function(data) {
											$scope.caseHtml = data;
										});
							}

							$scope.save = function() {
								$scope.caseBindings[$scope.selectedCase] = angular
										.copy($scope.currentCaseBinding);
								bindingService.save($scope.currentCaseBinding).success(function() {
									$scope.bindingForm.$setPristine();
								});
							}

							$scope.cancel = function() {
								if (!$scope.caseBindings[$scope.selectedCase]) {
									$scope.currentCaseBinding = {};
									$scope.currentCaseBinding.rhsBindings = [];
								}
								else {
									console.log($scope.selectedCase);
									$scope.currentCaseBinding = {};
									$scope.currentCaseBinding = $scope.caseBindings[$scope.selectedCase];
								}
								$scope.bindingForm.$setPristine();
								$scope.currentCaseBinding.user = $scope.user;
								$scope.currentCaseBinding.template = $scope.caseTemplates[$scope.selectedCase]._id;
							}

						} ]);
