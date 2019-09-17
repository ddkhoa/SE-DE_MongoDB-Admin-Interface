app.controller("connectionCtrl", ["$scope", "$rootScope", "$state", "$http", function ($scope, $rootScope, $state, $http) {


    $scope.load = function () {

        console.log("Connnection Ctrl");

        // hold db connection information
        $rootScope.connection = {};

        // default value
        $scope.authentication = false;

        // to work with ng-if (which create a child scope)
        $scope.secret = {
            user: "",
            password: ""
        }

        // get connection set
        let url = "/api/connections";
        $http.get(url)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.connSet = data.data;

                    for (let key in $scope.connSet) {
                        $scope.connSet[key].name = key;
                    }
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.saveConnection = function () {
        let connection = {
            name: $scope.name,
            server: $scope.server,
            port: $scope.port,
            authentication: $scope.authentication
        }

        if ($scope.authentication) {
            connection.user = $scope.secret.user;
            connection.password = $scope.secret.password;
        }

        // save new connection
        let url = "/api/connections";
        $http.post(url, connection)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.connSet = data.data;
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.connect = function () {

        // get connection set
        let url = "/api/server/connect";
        $http.post(url, $scope.connection)
            .then(
                function (response) {

                    let data = response.data;
                    if (data.success) {

                        // connect to database successfully 
                        $rootScope.connection = $scope.connection;
                        $state.go('dbserver');
                    }
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );

    }

    $scope.load();
}]);