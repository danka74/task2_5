angular.module('BindingServiceModule', []).factory(
		'BindingService',
		[
				'$http',
				function($http) {

					return {
						// get bindings for template (and user provided by JWT)
						get: function(template, scenario) {
							return $http.get('/api/bindings/' + template + '/' + scenario);
						},

						// get number of bindings for the current user
						getCount: function() {
							console.log("get number of bindings");
							return $http.get('/api/bindings');
						},

						// save binding
						save: function(binding) {
							console.log("save: " + JSON.stringify(binding));
							return $http.post('/api/bindings/', binding);
						},

						// update binding
						update: function(id, binding) {
							return $http.put('/api/bindings/' + id, binding);
						}
					}

				} ]);