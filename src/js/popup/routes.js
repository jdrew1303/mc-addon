angular.module('mc-addon.popup.routes', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/popup/welcome.html'
    });
}]);