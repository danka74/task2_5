angular.module('BindingServiceModule', []).factory(
		'BindingService',
		[
				'$http',
				function($http) {

					return {
						// get bindings for template (and user provided by JWT)
						get: function(template) {
							return $http.get('/api/bindings/' + template);
						},
						
						// save binding
						save: function(binding) {
							console.log("save: " + binding);
							return $http.post('/api/bindings/', binding);
						},
						
						// update binding
						update: function(id, binding) {
							return $http.put('/api/bindings/' + id, binding);
						}
					}

				} ]);