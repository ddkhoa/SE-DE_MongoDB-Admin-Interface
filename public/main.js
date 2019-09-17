app.controller("AppCtrl", ["$scope", "$rootScope", "$state", function ($scope, $rootScope, $state) {


    if (!$rootScope.connection) {
        $state.go("connection");
    }

}]);