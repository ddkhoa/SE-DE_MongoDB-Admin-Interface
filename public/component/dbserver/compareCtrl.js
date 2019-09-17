app.controller("compareCtrl", ["$scope", "$rootScope", "$state", "$http", function ($scope, $rootScope, $state, $http) {

    $scope.load = function () {

        console.log("Database Compare Ctrl");
        $scope.loaded = false;

        // get connection set
        let url = "/api/connections";
        $http.get(url)
            .then(
                function (response) {

                    // success 
                    let data = response.data;
                    $scope.connSet = {};

                    // exclude the current connection from list
                    for (let key in data.data) {
                        if (data.data.hasOwnProperty(key) && key !== $rootScope.connection.name) {
                            $scope.connSet[key] = data.data[key];
                            $scope.connSet[key].name = key;
                        }
                    }
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.compare = function () {

        let url = "/api/server/compare";
        let params = { dbdes: $scope.dbdes };
        $http.post(url, params)
            .then(
                function (response) {

                    // success 
                    // construct table represent the difference between 2 structures
                    // each row in table contains 2 columns
                    // the left column represent the structure of current server
                    // the right column represent the structure of the server to compare

                    let data = response.data.data;

                    // style use in table
                    let style = {
                        new: { "background-color": "#e6ffe6" },
                        deleted: { "background-color": "#ffe6e6" },
                        indent: { "padding-left": "30px" }
                    }

                    // each item in this array is a row in table
                    let src_data = [];

                    for (let key in data) {

                        if (data[key].state == "new") {

                            // new database & collection : leave the left column blank, set background to green for the right column
                            src_data.push([
                                { label: "", style: {} },
                                { label: key, style: style.new }]);

                            for (let i = 0; i < data[key].collections.length; i = i + 1) {
                                src_data.push([
                                    { label: "", style: {} },
                                    { label: data[key].collections[i].name, style: { ...style.new, ...style.indent } }]);
                            }
                        }

                        if (data[key].state == "deleted") {

                            // database & collection deleted : leave the left column blank, set background to green for the right column
                            src_data.push([
                                { label: key, style: style.deleted },
                                { label: "", style: {} }]);

                            for (let i = 0; i < data[key].collections.length; i = i + 1) {
                                src_data.push([
                                    { label: data[key].collections[i].name, style: { ...style.deleted, ...style.indent } },
                                    { label: "", style: style.indent }]);
                            }
                        }

                        if (!data[key].state) {

                            // database doesn't change : no style
                            src_data.push([
                                { label: key, style: {} },
                                { label: key, style: {} }]);

                            let hasChanged = false;
                            for (let i = 0; i < data[key].collections.length; i = i + 1) {

                                // style for new collection
                                if (data[key].collections[i].state == "new") {
                                    src_data.push([
                                        { label: "", style: style.indent },
                                        { label: data[key].collections[i].name, style: { ...style.new, ...style.indent } }]);
                                    hasChanged = true;
                                }

                                // style for deleted collection
                                if (data[key].collections[i].state == "deleted") {
                                    src_data.push([
                                        { label: data[key].collections[i].name, style: { ...style.deleted, ...style.indent } },
                                        { label: "", style: style.indent }]);
                                    hasChanged = true;
                                }

                                // collection doesn't change : no style
                                // if (data[key].collections[i].state == "") {
                                //     src_data.push([
                                //         { label: data[key].collections[i].name, style: style.indent },
                                //         { label: data[key].collections[i].name, style: style.indent }]);
                                // }
                            }

                            if (!hasChanged) src_data.pop();
                        }


                    }
                    $scope.obj = { src_data: src_data };
                    $scope.loaded = true;
                },
                function (response) {

                    // failure 
                    console.log(response);
                }
            );
    }

    $scope.load();
}]);

// let tree_data = [];
// for (let i = 0; i < data.length; i = i + 1) {
//     tree_data.push({
//         label: data[i].name,
//         children: [],
//         data: { state: data[i].state }
//     });
//     for (let j = 0; j < data[i].collections.length; j = j + 1) {
//         tree_data[i].children.push({
//             label: data[i].collections[j].name,
//             data: { state: data[i].collections[j].state }
//         })
//     }
// }
// $scope.tree_data = tree_data;
// $scope.tree_control = tree = {};
// $scope.loaded = true;
// console.log($scope.tree_data);
// let i = 0;
// for (let key in data) {
//     tree_data.push({
//         label: key,
//         children: [],
//         data: { state: data[key].state || "" }
//     })
//     for (let j = 0; j < data[key].collections.length; j = j + 1) {
//         tree_data[i].children.push({
//             label: data[key].collections[j].name,
//             data: { state: data[key].collections[j].state }
//         })
//     }
//     i = i + 1;
// }
// $scope.tree_data = tree_data;
// $scope.tree_control = tree = {};
// $scope.loaded = true;
// console.log($scope.tree_data);