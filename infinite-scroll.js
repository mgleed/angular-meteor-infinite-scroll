Images = new Mongo.Collection('images');

if (Meteor.isClient) {
    angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 500);  
    
    Meteor.startup(function() {
        angular.bootstrap(document, ['scroll-demo']);
    });
}

if (Meteor.isServer) {
  var tmpShotBy, tmpCategory;
  if (!Images.find().count()) {
    for (var i = 0; i < 500; i++) {
      switch (i%4){
        case 0:
          tmpShotBy = 'Steve';
          break;
        case 1:
          tmpShotBy = 'Sally';
          break;
        case 2:
          tmpShotBy = 'Mark';
          break;
        case 3:
          tmpShotBy = 'Rachel';
          break;
      }
      switch (i%3){
        case 0:
          tmpCategory = 'Sports';
          break;
        case 1:
          tmpCategory = 'Technology';
          break;
        case 2:
          tmpCategory = 'Nature';
          break;
      }            
      Images.insert({
        index: i,
        dateSubmitted: new Date(),
        shotBy: tmpShotBy,
        category: tmpCategory,
        favorites: Math.floor((Math.random() * 100) + 1),                
      });
    }
  }

  Meteor.publish('images', function(opts) {
    if (opts === undefined){
      return Images.find({});
    } else {
      return Images.find({}, {
        skip: opts.skip,
        limit: opts.limit,
        sort: opts.sort,
      });
    };
  });
}
