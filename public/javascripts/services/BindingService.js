angular.module('BindingServiceModule', []).factory(
		'BindingService',
		[
				'$http',
				function($http) {

					return {
						// get binding for template and user
						get: function(template, user) {
							console.log("user = " + user.uid)
							return $http.get('/api/bindings/' + template + '/' + user.uid);
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