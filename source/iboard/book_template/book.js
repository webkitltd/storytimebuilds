// this is the stub

var $ = require('jquery');
var Hammer = require('hammer');

function book_ready(){

  document.ontouchmove = function(event){
      event.preventDefault();
  }

  var is_3d = false;

  if(window.$phonegap){
    /*
    
      androids
      
    */
    if((device.platform || '').toLowerCase().match(/android/)){
      if(device.version<4){
        is_3d = false;
      }
    }
    
    $('#debug').html('3d = ' + is_3d);
  }
  
  var book;

  var pagecount = $('.page').length;
  if(is_3d){
    var PageTurner = require('pageturner')
    book = new PageTurner({
      bookselector:'#book',
      pageselector:'.page',
      apply_pageclass:'bookpage',
      startpage:0,
      perspective:950
    })
  }
  else{
    var PageFader = require('pagefader');
    book = new PageFader({
      bookselector:'#book',
      pageselector:'.page',
      apply_pageclass:'bookpage',
      startpage:0
    })
  }
  
  var bookelem = $('#book');

  var hammertime = new Hammer($('body').get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })

  var dragging = null;
  var animating = false;
  var loading = false;

  book.on('ready', function(){
    $('#book').addClass('dropshadow');
  })

  book.on('resize', function(newsize){
    
    var windowsize = {
      width:$(window).width(),
      height:$(window).height()
    }

    var xpos = windowsize.width/2 - newsize.width/2;
    var ypos = windowsize.height/2 - newsize.height/2;

    $('#book').css({
      left:xpos + 'px',
      top:ypos + 'px'
    })
  })

  book.on('load', function(index){
    loading = true;
  })

  book.on('loaded', function(index){
    loading = false;
    if(index<=0){
      $('.leftarrow').hide();
    }
    else{
      $('.leftarrow').show(); 
    }

    if(index>=pagecount-1){
      $('.rightarrow').hide();
    }
    else{
      $('.rightarrow').show(); 
    }
  })

  book.on('animate', function(side){
    animating = true;
  })

  book.on('animated', function(side){
    animating = false;
  })

  hammertime.ondragstart = function(ev){
    if(dragging || animating || loading){
      return;
    }

    dragging = true;

  }

  hammertime.ondrag = function(ev){
    if(!dragging || animating || loading){
      return;
    }

    if(ev.distance>=15){
      dragging = false;
      book.animate_direction(ev.direction=='left' ? 1 : -1);  
    }

  }

  hammertime.ondragend = function(ev){
    dragging = false;
  }

  hammertime.ontap = function(ev){
    var elem = ev.originalEvent.srcElement;

    if(!$(elem).hasClass('arrow')){
      return;
    }
    book.animate_direction($(elem).hasClass('leftarrow') ? -1 : 1);
  }


  book.render();

}

