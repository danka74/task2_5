angular.module('BindingServiceModule', []).factory(
		'BindingService',
		[
				'$http',
				function($http) {

					return {
						// call to get all templates
						get : function(user) {
							console.log("user = " + user.uid)
							return $http.get('/api/bindings/' + user.uid );
						}
					}

				} ]);