// this is the stub

var $ = require('jquery');
var Hammer = require('hammer');
var has3d = require('has-translate3d');

function book_ready(){

  document.ontouchmove = function(event){
      event.preventDefault();
  }

  var is_3d = has3d;

  if(window.$phonegap){
    /*
    
      androids
      
    */
    if((device.platform || '').toLowerCase().match(/android/)){
      if(device.version<4){
        is_3d = false;
      }
    }
  }
  
  var book;

  

  var html = window.$storytimebook.pages.map(function(page, index){

    var no = index + 1;
    var text = page.text.replace(/\n/g, "<br />");

    console.dir(page);

    var offset = page.extra_config.textoffset || {};
    var offsetleft = offset.x || 0;

    var elemhtml = [
      '<div class="page">',
      '  <div class="pagebg pagebg' + no + '">',
      '    <div class="pagetext" style="text-align:' + page.alignment + ';">' + text + '</div>',
      '  </div>',
      '</div>'
    ].join("\n");

    return elemhtml;

  })

  $('#book').html(html.join("\n"));

  var pagecount = $('.page').length;
  if(is_3d){
    var PageTurner = require('pageturner')
    book = new PageTurner({
      bookselector:'#book',
      pageselector:'.page',
      apply_pageclass:'bookpage',
      startpage:18,
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

    $('#hshadow').css({
      left:(xpos) + 'px',
      top:(ypos + newsize.height) + 'px',
      width:(newsize.width) + 'px'
    })

    $('#vshadow').css({
      left:(xpos + newsize.width) + 'px',
      top:(ypos) + 'px',
      height:(newsize.height) + 'px'
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

    if(book.triggernext){
      book.triggernext();
      book.triggernext = null;
    }
  })

  book.on('animate', function(side){
    if(book.currentpage==pagecount-2 && side=='right'){
      $('#vshadow').hide();
    }
    animating = true;
  })

  book.on('animated', function(side){
    if(book.currentpage==pagecount-1 && side=='left'){
      $('#vshadow').show();
    }
    animating = false;
  })

  hammertime.ondragstart = function(ev){
    dragging = true;
  }

  hammertime.ondrag = function(ev){
    if(!dragging){
      return;
    }

    if(ev.distance>=15){
      if(animating || loading){
        book.triggernext = function(){
          book.animate_direction(ev.direction=='left' ? 1 : -1);    
        }
        return;
      }
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

    if(animating || loading){
      book.triggernext = function(){
        book.animate_direction($(elem).hasClass('leftarrow') ? -1 : 1);
      }
      return;
    }
    else{
      book.animate_direction($(elem).hasClass('leftarrow') ? -1 : 1);
    }
  }


  book.render();

}

