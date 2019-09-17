app.controller("dbserverCtrl", ["$scope", "$rootScope", "$state", "$http", function ($scope, $rootScope, $state, $http) {


    $scope.load = function () {

        console.log("Database Server Ctrl");


        // get server database status
        let url = "/api/server/stat";
        let dbaccess = $rootScope.connection;

        $http.post(url, dbaccess)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.stats = data.data;
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );

        // get databases in server
        let urldbset = '/api/server/dbset';
        $http.post(urldbset, dbaccess)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.databases = data.data.map(item => {
                        item.sizeOnDisk = (item.sizeOnDisk / (1024 * 1024)).toFixed(2);
                        item.nbCollection = item.collections.length;
                        return item;
                    });
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.viewDb = function (dbname) {

        $state.go('db', { dbname: dbname });
    }

    $scope.compareDb = function () {
        $state.go('compare');
    }

    $scope.getDescriptionFile = function () {

        let url = '/api/server/description';
        var request = {
            method: "GET",
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            responseType: 'blob'
        }
        $http(request)
            .then(
                function (response) {

                    // success
                     
                    var filename = +Date.now().toString() + '.xlsx';

                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;

                    // Try to use a download link
                    var link = document.createElement("a");

                    // get content type of response
                    var contentTypeHeader = response.headers("Content-Type");

                    // Prepare a blob URL
                    var blob = new Blob([response.data], {
                        type: contentTypeHeader
                    });
                    var url = urlCreator.createObjectURL(blob);

                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);

                    // Simulate clicking the download link
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                },

                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.load();
}]);