angular.module('MainControllerModule', [])
		// .filter('toTrusted', [ '$sce', function($sce) {
		// return function(text) {
		// return $sce.trustAsHtml(text);
		// };
		// } ])
		// directive to allow AngularJS HTML in the cases
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
		.controller('ModalInstanceCtrl', function($scope, $modalInstance) {

			$scope.ok = function() {
				$modalInstance.close();
			};
		})
		.directive(
				'conceptInput',
				function() {
					return {
						restrict : 'EA',
						replace : true,
						scope : {
							name : '@',
							partDescription : '@',
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
							$scope._delete = function(comment) {
								console.log(comment);
								var index = $scope.partBinding.comments
										.indexOf(comment.comment);
								console.log("index = " + index);
								$scope.partBinding.comments.splice(index, 1);
								$scope.$parent.bindingForm.$setDirty();
							}
						},
						link : function(scope, element, attrs) {
							if (scope.partBinding === undefined) {
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
						'$q',
						'$location',
						'$window',
						'$modal',
						'jwtHelper',
						'TemplateService',
						'BindingService',
						function($scope, $q, $location, $window, $modal,
								jwtHelper, templateService, bindingService) {

							$scope.currentCaseTemplate = null;
							$scope.currentCaseBinding = null;
							$scope.selectedCase = null;
							$scope.terminologies = [ [ {
								name : "Precoord. SNOMED CT",
								regexp : "/[1-9]\d*(|[^|]|)?/"
							}, {
								name : "Grouping SNOMED CT"
							} ], [ {
								name : "ICD10"
							}, {
								name : "ATC"
							}, {
								name : "LOINC"
							}, {
								name : "MeSH"
							} ] ]; // add regexp for validation?

							// // SCT only or Alternative study arm, false=SCT,
							// // true=Alternative
							$scope.scenario = false;
							$scope.scenarioSwitch = false;
							$scope.changeScenario = function(switchTo) {
								console.log("changeScenario " + switchTo)
								if ($scope.bindingForm.$dirty) {
									alert("Save or cancel changes before switching!");
									return;
								}
								if (switchTo == null)
									$scope.scenario = !$scope.scenario;
								else if (switchTo == true)
									$scope.scenario = true;
								else
									$scope.scenario = false;
								$scope.scenarioSwitch = $scope.scenario;
								$scope.showCase($scope.selectedCase);
							};
							// $scope.$watch('scenario', function() {
							// if ($scope.selectedCase != null)
							// $scope.showCase($scope.selectedCase);
							// });

							var url = $location.$$absUrl;
							var tokenIndex = url.indexOf("?token=");
							if (tokenIndex != -1) {
								var token = url.substring(url
										.indexOf("?token=") + 7, url.length);
								console.log(token);
								$window.sessionStorage.token = token;
								$scope.user = jwtHelper.decodeToken(token);
							}

							bindingService.getCount().success(function(data) {
								$scope.bindingCount = data;
							}).error(function() {
								$scope.bindingCount = 0;
							});

							$scope.countElements = function() {
								var count = 0;
								for (caseIndex = 0; caseIndex < $scope.caseTemplates.length; caseIndex++) {

									var _case = $scope.caseTemplates[caseIndex];
									count += _case.rhs.length;
									if (_case.lhs != undefined)
										count++;
									if (_case.templateURL == "default_template.html")
										count++;
								}
								// times 2 for SNOMED CT and Alternative
								return count * 2;
							}
							templateService
									.get()
									.success(
											function(data) {
												$scope.caseTemplates = data;
												$scope.totalElements = $scope
														.countElements();
											})
									.error(
											function(data, status) {
												$scope.caseTemplates = [];
												if (status == 401)
													$scope.caseHtml = "<h3>Cannot authenticate user</h3>";
											});

							$scope.addComment = function(commentText) {
								if ($scope.currentCaseBinding.comments)
									$scope.currentCaseBinding.comments.push({
										text : commentText,
										date : Date.now()
									});
								else {
									$scope.currentCaseBinding.comments = [ {
										text : commentText,
										date : Date.now()
									} ];
								}
								$scope.caseCommentText = "";
							};

							$scope._delete = function(comment) {
								console.log(comment);
								var index = $scope.currentCaseBinding.comments
										.indexOf(comment.comment);
								console.log("index = " + index);
								$scope.currentCaseBinding.comments.splice(
										index, 1);
							}

							$scope.showCase = function($index) {

								if ($scope.bindingForm.$dirty) {
									alert("Save or cancel before switching");
									return;
								}
								// if ($scope.bindingForm.$dirty) {
								// $scope.save(); // TODO: a modal?
								// }

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

							$scope.createBasicStructure = function() {
								$scope.currentCaseBinding.scenario = $scope.scenario;
								if ($scope.currentCaseTemplate.lhs
										&& $scope.currentCaseBinding.lhsBinding === undefined) {
									$scope.currentCaseBinding.lhsBinding = {};
									$scope.currentCaseBinding.lhsBinding.source = $scope.currentCaseTemplate.lhs.name;
								}
								if ($scope.currentCaseBinding.rhsBindings === undefined)
									$scope.currentCaseBinding.rhsBindings = [];
								for (var i = 0; i < $scope.currentCaseTemplate.rhs.length; i++) {
									if ($scope.currentCaseBinding.rhsBindings[i] === undefined)
										$scope.currentCaseBinding.rhsBindings[i] = {};
									$scope.currentCaseBinding.rhsBindings[i].source = $scope.currentCaseTemplate.rhs[i].name;
									$scope.currentCaseBinding.rhsBindings[i].sourceTemplatePart = $scope.currentCaseTemplate.rhs[i]._id;
								}
								$scope.currentCaseBinding.date = Date.now();
							}

							$scope.save = function() {
								if ($scope.currentCaseBinding._id) {
									// recreate it just in case not all fields
									// are filled in
									console
											.log($scope.currentCaseBinding.lhsBinding);
									$scope.createBasicStructure();
									bindingService
											.update(
													$scope.currentCaseBinding._id,
													$scope.currentCaseBinding)
											.success(
													function(data) {
														console
																.log("updated!!!");
														$scope.currentCaseBinding = data;
														$scope.bindingForm
																.$setPristine();
														bindingService
																.getCount()
																.success(
																		function(
																				data) {
																			$scope.bindingCount = data;
																		})
													});
								} else {
									$scope.createBasicStructure();
									bindingService
											.save($scope.currentCaseBinding)
											.success(
													function(data) {
														console.log("saved!");
														$scope.currentCaseBinding = data;
														$scope.bindingForm
																.$setPristine();
														bindingService
																.getCount()
																.success(
																		function(
																				data) {
																			$scope.bindingCount = data;
																		})
													});
								}
							}

							$scope.cancel = function() {
								// fetch the last saved version of the binding,
								// if possible
								bindingService
										.get($scope.currentCaseTemplate._id,
												$scope.scenario)
										.success(
												function(data) {
													if (data) {
														console
																.log("Found binding  ");
														console.log(data);
														// if last saved is
														// available
														$scope.currentCaseBinding = data;
													} else {
														// no previous binding
														// saved in database
														console
																.log("Did not find binding");
														// clear entry fields
														// and assign basic
														// structure
														$scope.currentCaseBinding = {};
														$scope.currentCaseBinding.template = $scope.caseTemplates[$scope.selectedCase]._id;
														// $scope.currentCaseBinding.scenario
														// = $scope.scenario;
														$scope
																.createBasicStructure();
														console
																.log($scope.currentCaseBinding);
													}
												});

								$scope.bindingForm.$setPristine();

							}

						} ]);
