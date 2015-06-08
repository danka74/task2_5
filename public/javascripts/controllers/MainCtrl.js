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
		.directive(
				'conceptInput',
				function() {
					return {
						restrict : 'EA',
						replace : true,
						scope : {
							name : '@',
							partBinding : '=',
							terminologies : '='
						},
						templateUrl : 'partials/concept_input.html',
						controller : function($scope) {
							$scope.commentText = "";
							$scope.addComment = function(commentText) {
								console.log($scope);
								if ($scope.partBinding.comments)
									$scope.partBinding.comments.push({
										text : commentText,
										date : Date.now()
									});
								else {
									$scope.partBinding.comments = [ {
										text : commentText,
										date : Date.now()
									} ];
								}
								$scope.commentText = "";
							};
						},
						link : function(scope, element, attrs) {
							if(scope.partBinding === undefined) {
								scope.partBinding = {};
							}
							var commentButton = angular.element(element[0]
									.querySelector('.glyphicon-comment'));
							commentButton.bind('click', function() {
								var commentArea = angular.element(element[0]
										.querySelector('.commentXXX'));
								if (commentArea.hasClass("collapse"))
									commentArea.removeClass("collapse");
								else
									commentArea.addClass("collapse");
							});
						}
					}
				})
		.controller(
				'MainController',
				[
						'$scope',
						'TemplateService',
						'BindingService',
						function($scope, templateService, bindingService) {

							$scope.currentCaseTemplate = null;
							$scope.currentCaseBinding = null;
							$scope.selectedCase = null;
							$scope.terminologies = [ {
								name : "SNOMED CT",
								regexp : "/[1-9]\d*(|[^|]|)?/"
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

							// bindingService.get($scope.user).success( // TODO:
							// load each binding as needed??
							// function(data) {
							// $scope.caseBindings = data;
							// });

							$scope.showCase = function($index) {
								if ($scope.bindingForm.$dirty) {
									$scope.save(); // TODO: a modal?
								}

								$scope.selectedCase = $index;

								var caseTemplate = $scope.caseTemplates[$scope.selectedCase];
								$scope.currentCaseTemplate = caseTemplate;

								console.log("selected case = "
										+ $scope.selectedCase);

								$scope.cancel();

								templateService.getTemplateHTML(caseTemplate)
										.success(function(data) {
											$scope.caseHtml = data;
										});
							}

							$scope.save = function() {
								if ($scope.currentCaseBinding._id) {
									bindingService
											.update(
													$scope.currentCaseBinding._id,
													$scope.currentCaseBinding)
											.success(
													function(data) {
														$scope.currentCaseBinding = data;
														$scope.bindingForm
																.$setPristine();
													});
								} else {
									bindingService
											.save($scope.currentCaseBinding)
											.success(
													function(data) {
														$scope.currentCaseBinding = data;
														$scope.bindingForm
																.$setPristine();
													});
								}
								// $scope.currentCaseBinding._id = data._id;

							}

							$scope.cancel = function() {
								bindingService
										.get($scope.currentCaseTemplate._id,
												$scope.user)
										.success(
												function(data) {
													if (data) {
														console
																.log("Found binding");
														$scope.currentCaseBinding = data;
													} else {
														console
																.log("Did not find binding");
														$scope.currentCaseBinding = {};
														$scope.currentCaseBinding.user = $scope.user;
														$scope.currentCaseBinding.template = $scope.caseTemplates[$scope.selectedCase]._id;
													}
												});

								$scope.bindingForm.$setPristine();

							}

						} ]);
