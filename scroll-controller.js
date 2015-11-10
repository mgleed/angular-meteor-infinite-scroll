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
            
            var page = 6;
            // function executed when scrolling to the bottom
            $scope.loadMore = function() {
              var len = $scope.images.length;
              $meteor.subscribe('images', {
                skip: len,
                limit: page,
                sort: { dateSubmitted: -1 }
              });
            };
            
            $meteor.autorun($scope, function() {
              $meteor.subscribe('images', {
                skip: 0,
                limit: 2 * page,
                sort: { dateSubmitted: -1 }
              }).then(function() {
                $scope.images = $meteor.collection(function() {
                  var query={};
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
                  return Images.find(query);
                });
              });
            });            

            
            // start Angular-Formly form
            $scope.options = {};
            $scope.model = {
              shotBy: null,
              category: null,
            };  
            
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
            ];              
            
        }]);
}
