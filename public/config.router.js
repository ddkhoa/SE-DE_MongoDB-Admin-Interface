var app = angular.module("app");


app.config(
    ['$stateProvider',
        function ($stateProvider) {

            //define states

            $stateProvider

                .state('connection', {
                    url: '/connection',
                    templateUrl: 'component/connection/connection.html',
                    controller: 'connectionCtrl',
                })
                .state('dbserver', {
                    url: '/dbserver',
                    templateUrl: 'component/dbserver/dbserver.html',
                    controller: 'dbserverCtrl',
                })
                .state('db', {
                    url: '/database',
                    params: {
                        dbname: null,
                    },
                    templateUrl: 'component/db/db.html',
                    controller: 'dbCtrl',
                })
                .state('compare', {
                    url: '/compare',
                    templateUrl: 'component/dbserver/compare.html',
                    controller: 'compareCtrl',
                })
        }
    ])
    .config([
        'blockUIConfig',
        function (blockUIConfig) {

            // blockUIConfig.autoInjectBodyBlock = false; // prevent inject blockUI in body tags
            // blockUIConfig.autoBlock = false; // block manually
        }])

