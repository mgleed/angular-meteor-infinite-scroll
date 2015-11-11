if (Meteor.isClient) {
    var module = angular.module('scroll-demo', ['angular-meteor', 'infinite-scroll', 'formly', 'formlyBootstrap', "ui.select", "ui.bootstrap", 'ngSanitize']);

    module.run(['formlyConfig', function(formlyConfig) {
      formlyConfig.setType({
        name: 'ui-select',
        extends: 'select',
        template: [
          '<ui-select data-ng-model="model[options.key]" data-required="{{to.required}}" data-disabled="{{to.disabled}}" theme="bootstrap">',
            '<ui-select-match placeholder="{{to.placeholder}}" data-allow-clear="true">{{$select.selected[to.labelProp]}}</ui-select-match>',
            '<ui-select-choices data-repeat="{{to.ngOptions}}">',
              '<div ng-bind-html="option[to.labelProp] | highlight: $select.search"></div>',
            '</ui-select-choices>',
          '</ui-select>'
        ].join('')
      });
      formlyConfig.setType({
        name: 'ui-select-multiple',
        extends: 'select',
        template: [
          '<ui-select multiple data-ng-model="model[options.key]" data-required="{{to.required}}" data-disabled="{{to.disabled}}" theme="bootstrap">',
            '<ui-select-match placeholder="{{to.placeholder}}">{{$item[to.labelProp]}}</ui-select-match>',
            '<ui-select-choices data-repeat="{{to.ngOptions}}">',
              '<div ng-bind-html="option[to.labelProp] | highlight: $select.search"></div>',
            '</ui-select-choices>',
          '</ui-select>'
        ].join('')
      });    
    }]);    
    
    module.controller('ngInfiniteScrollCtrl', ['$scope', '$meteor', '$log',
        function($scope, $meteor) {
            // some ideas from here...
            // https://github.com/ndxbxrme/generator-angular-meteor/blob/master/generators/app/templates/bootstrap/client/main/main.controller(js).ng.js       
          
            // initialize Angular-Formly form //
            $scope.options = {};
            $scope.model = {
              shotBy: null,
              category: null,
              sort: {dateSubmitted: -1},
            };  
         
            // infinite-scroll logic & collection subscription //
            $scope.currentPage = 1;
            $scope.perPage = 12;
            $scope.orderProperty = '-1';
            $scope.query = {};
                      
            $scope.images = $scope.$meteorCollection(function() {
              query={};            
              // if filtered by a user...
              if ($scope.getReactively('model.shotBy')) {
                query.shotBy = $scope.model.shotBy;
              };
              // if category filter(s) are selected...
              if ($scope.getReactively('model.category', true)) {
                if ($scope.model.category.length > 0){
                  var categories = [];
                  for (var i=0; i < $scope.model.category.length; i++){            
                    categories.push($scope.model.category[i]);
                  }
                  query.category = {$in: categories};
                }
              };
              $scope.currentPage = 1; // reset
              return Images.find(query, { sort: $scope.getReactively('model.sort')});
            });
            
            $meteor.autorun($scope, function() {
              if ($scope.getReactively('images')){
                console.log('send filtered signal to infinite-scroll');
                $scope.$emit('list:filtered');    
              }
            });
            
            $meteor.autorun($scope, function() {
              console.log('inside autorun');
              console.log('limit is');
              console.log(parseInt($scope.getReactively('perPage')));
              console.log('skip is');
              console.log(parseInt(($scope.getReactively('currentPage') - 1) * $scope.getReactively('perPage')));
              console.log('  current page is');
              console.log($scope.getReactively('currentPage'));
              console.log('  per page is');
              console.log($scope.getReactively('perPage'));
              console.log('sort is');
              console.log($scope.getReactively('model.sort'));              
              $scope.$meteorSubscribe('images', {
                limit: parseInt($scope.getReactively('perPage'))*parseInt(($scope.getReactively('currentPage'))),
                skip: 0,
                sort: $scope.getReactively('model.sort')
              });
            });              
            
            $scope.loadMore = function() {
              console.log('loading more');
              $scope.currentPage += 1;
            };         
            
            function setSortObj(value) {
              var tmpObj = new Object;
              tmpObj[value] = -1;
              return tmpObj;
            }                      
            
            // Formly fields //
            $scope.fields = [
              {
                type: 'ui-select',
                key: 'shotBy',
                templateOptions: {
                  optionsAttr: 'bs-options',
                  ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',                  
                  label: 'Filter by photographer',
                  placeholder: 'Choose photographer',
                  required: false,
                  options:[
                    {name: "Steve"},
                    {name: "Rachel"},
                    {name: "Sally"},
                    {name: "Mark"},
                  ],
                  valueProp: 'name',
                  labelProp: 'name',
                },
              },
              {     
                type: 'ui-select-multiple',
                key: 'category',
                templateOptions: {
                  label: 'Filter by category',
                  placeholder: '  Choose categories',
                  required: false,
                  options:[
                    {name: "Sports"},
                    {name: "Technology"},
                    {name: "Nature"},
                  ],
                  valueProp: 'name',
                  labelProp: 'name', 
                  optionsAttr: 'bs-options',
                  ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',          
                },      
              },   
              {     
                type: 'ui-select',
                key: 'sort',
                parsers: [setSortObj],
                templateOptions: {
                  label: 'Sort results',
                  placeholder: '  Choose criteria',
                  required: false,
                  options:[
                    {label: "Date Submitted", value: "dateSubmitted"},
                    {label: "Index", value: "index"},
                    {label: "Favorites", value: "favorites"},
                  ],
                  valueProp: 'value',
                  labelProp: 'label',                   
                  optionsAttr: 'bs-options',
                  ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',          
                },      
              },              
            ];              
            
        }]);
}
