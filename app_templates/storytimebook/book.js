// this is the stub

var $ = require('jquery');
var Hammer = require('hammer');
var PageTurner = require('pageturner');

$(function(){

  document.ontouchmove = function(event){
      event.preventDefault();
  }

  
  var book = new PageTurner({
    bookselector:'#book',
    pageselector:'.page',
    apply_pageclass:'bookpage',
    startpage:5
    
  });

  book.render();

  var hammertime = new Hammer($('body').get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })

  var dragging = true;
  var animating = false;
  var loading = false;

  book.on('load', function(index){
    loading = true;
  })

  book.on('loaded', function(index){
    loading = false;
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
    if(ev.distance>=100){
      dragging = false;
      book.animate_direction(ev.direction=='left' ? 1 : -1);  
    }
  }

  hammertime.ondragend = function(ev){
    if(animating || loading){
      return;
    }
    dragging = false;
  }

/*
  hammertime.onswipe = function(ev){
    console.log('-------------------------------------------');
    console.log('swipe');
    book.animate_direction(ev.direction=='left' ? 1 : -1);

  };
*/  

})