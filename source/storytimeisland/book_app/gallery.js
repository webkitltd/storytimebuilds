// this is the stub

/*

  one of these is created every time a page is loaded

  it represents the active dictionary on the given page

  it emits 'sound' events for the application to handle

  you pass it the data for the page that is active
  
*/

var $ = require('jquery');
var Emitter = require('emitter');


module.exports = function storytimeisland_gallery(template){
  
  var gallery = {
    active:false
  };

  for(var i in Emitter.prototype){
    gallery[i] = Emitter.prototype[i];
  }

  var $elem = $('' + template);

  $('body').append($elem);

  var imageholder = $elem.find('.galleryimages');

  var total_width = imageholder.width();
  var visible_width = $elem.width();
  var max_offset = total_width-visible_width + 200;
  var current_offset = 0;

  gallery.destroy = function(){
    $elem.remove();
  }

  gallery.animate = function(direction){
    var new_offset = current_offset + (direction*(visible_width/4)*-1);
    if(new_offset>0){
      new_offset = 0;
    }
    else if(new_offset<-max_offset){
      new_offset = -max_offset;
    }

    imageholder.css({
      left:new_offset + 'px'
    })
    current_offset = new_offset;
  }

  gallery.set_current_page = function(index){
    $elem.find('span.badge').removeClass('badge-warning');
    $elem.find('span.badge').eq(index).addClass('badge-warning');
  }

  gallery.tap = function(ev){
    var target = ev.originalEvent.target;
    if(!target){
      return;
    }
    target = $(target);
    if(target.hasClass('arrowimg')){
      var direction = parseInt(target.attr('data-direction'));
      gallery.animate(direction); 
      return;
    }
    var galleryimage = target.closest('.gallerypage');
    if(galleryimage.length<=0){
      return;
    }

    var index = parseInt(galleryimage.attr('data-gallery-index'));
    gallery.emit('loadpage', index);
    
  }


/*
  var hammertime = new Hammer($elem.get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })

  hammertime.ontap = function(e){
    console.log('-------------------------------------------');
    console.log('tap');
    e.originalEvent.stopPropagation();
    
  }
*/


/*

        var $mask = $elem.find('.gallerymask');
        var $images = $mask.find('.galleryimages');
        var $arrowimgs = $mask.find('.arrowimg');

        var hammertime = Hammer($images[0], {
          
        })

        .on("swipeleft", function(event){

          $scope.movegallery(1);          
        })

        .on("swiperight", function(event){

          $scope.movegallery(-1);
        })


        var hammertime = Hammer($elem[0], {
          
        })

        .on("swipeup", function(event){

          $scope.$emit('swipeoptions');
        })

        $rootScope.$watch('gallerypages', function(pages){
          if(!pages){
            return;
          }
          $scope.gallerypages = [];//pages.splice(0, pages.length-3);  

          for(var i=0; i<pages.length; i++){
            $scope.gallerypages.push(pages[i]);
          }
        })

        //var pagenumber = elem.parent().index();

        //$scope.$emit('loadgallerypage', pagenumber);
        var currentoffset = 0;
        var windowwidth = 0;
        function setoffsetpage(galleryoffset){

          if(!$scope.gallerypages || $scope.gallerypages.length<=0){
            return;
          }

          if(galleryoffset<0){
            galleryoffset = 0;
          }

          var targetLeft = 50 + (-galleryoffset*115);
          var max = -(($scope.gallerypages.length*115)-$mask.width())-50;

          if(targetLeft<max){
            targetLeft = max;
          }
          else{
            currentoffset = galleryoffset;  
          }

          $images.stop().animate({
            left:targetLeft
          }, 250);
          
          
        }

        $images.css({
          'left':'50px'
        })

        $scope.$watch('windowsize', function(size){
          if(!size){
            return;
          }
          windowwidth = size.width;
          setoffsetpage(currentoffset);
        })

        $rootScope.$on('book:pageloaded', function(ev, index){
          setoffsetpage(index);
          setbadges(index);
        })
        
        function setbadges(page){
          var badges = $mask.find('.badge');
          badges.removeClass('badge-warning').addClass('badge-info');
          badges.eq(page).removeClass('badge-info').addClass('badge-warning');
        }

        $scope.$watch('currentpage', function(page){
          setbadges(page);  
        })

        $scope.loadpage = function(pagenumber){

          if(pagenumber===0){
            $rootScope.$broadcast('book:gohome');
            return;
          }

          $rootScope.$broadcast('book:trigger', pagenumber-1);  
          
          
          setTimeout(function(){
            $scope.$apply(function(){
              $scope.togglegallery();  
            })
            
          }, 1500);
        }

        $scope.movegallery = function(dir){
          setoffsetpage(currentoffset + (dir*3));
        }
*/



  return gallery;
}

