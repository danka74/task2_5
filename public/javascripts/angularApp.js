angular
		.module(
				'BindingApp',
				[ 'ngRoute', 'ui.bootstrap', 'MainControllerModule', 'DashboardControllerModule', 'ResultsControllerModule',
						'TemplateServiceModule', 'BindingServiceModule',
						'angular-jwt', 'hc.marked', 'sticky' ])
		.factory(
				'authInterceptor',
				function($rootScope, $q, $window) {
					return {
						request : function(config) {
							config.headers = config.headers || {};
							if ($window.sessionStorage.token) {
								config.headers.Authorization = 'Bearer '
										+ $window.sessionStorage.token;
							}
							return config;
						},
						response : function(response) {
							if (response.status === 401) {
								// handle the case where the user is not
								// authenticated
							}
							return response || $q.when(response);
						}
					};
				})
		.config(
				[
						'$routeProvider',
						'$httpProvider',
						function($routeProvider, $httpProvider) {
							$httpProvider.defaults.cache = false;
							if (!$httpProvider.defaults.headers.get) {
								$httpProvider.defaults.headers.get = {};
							}
							// disable IE ajax request caching
							$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
							$httpProvider.interceptors.push('authInterceptor');
						} ]);
