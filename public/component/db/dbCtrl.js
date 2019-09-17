app.controller("dbCtrl", ["$scope", "$rootScope", "$state", "$http", function ($scope, $rootScope, $state, $http) {


    $scope.load = function () {

        console.log("Database Ctrl");

        // get database statistics
        let dbname = $state.params.dbname;
        let url = "/api/database/info?dbname=" + dbname;

        $http.get(url)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.stats = data.data.stats;
                    $scope.collections = data.data.collections;
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.saveInfo = function () {
        let url = "/api/database/info";
        let dbname = $state.params.dbname;
        let collections = $scope.collections;
        let params = { dbname, collections };

        $http.post(url, params)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.stats = data.data.stats;
                    $scope.collections = data.data.collections;
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.load();
}]);