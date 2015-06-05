angular.module('BindingServiceModule', []).factory(
		'BindingService',
		[
				'$http',
				function($http) {

					return {
						// call to get all templates
						get: function(user) {
							console.log("user = " + user.uid)
							return $http.get('/api/bindings/' + user.uid );
						},
						
						// save binding
						save: function(binding) {
							return $http.post('/api/bindings/', binding);
						}
					}

				} ]);