angular.module('TemplateServiceModule', []).factory(
		'TemplateService',
		[
				'$http',
				function($http) {

					return {
						// call to get all templates
						get : function() {
							return $http.get('/api/case_templates');
						},
						getTemplateHTML : function(caseTemplate) {
							return $http.get('partials/case_templates/'
									+ caseTemplate.templateURL);
						}
					}

				} ]);