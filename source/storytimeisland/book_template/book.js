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
  var startpage = 0;

  

  var html = window.$storytimebook.pages.map(function(page, index){

    var no = index + 1;
    var text = page.text.replace(/\n/g, "<br />");

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
      startpage:startpage,
      perspective:950
    })
  }
  else{
    var PageFader = require('pagefader');
    book = new PageFader({
      bookselector:'#book',
      pageselector:'.page',
      apply_pageclass:'bookpage',
      startpage:startpage
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
  var currentsize = {};
  var currentpos = {};

  function get_current_page(){
    return book.currentpage || startpage;
  }

  function shadow_offset(forpage){
    return (forpage==0 ? 1 : 0) * (currentsize.width/2);
  }

  function shadow_width(forpage){
    if(forpage==0 || forpage==pagecount-1){
      return currentsize.width/2 + (forpage==pagecount-1 ? (currentsize.width*0.025) : 0);
    }
    else{
      return currentsize.width;
    }
  }

  function apply_shadow(forpage){
    $('#shadow').css({
      'margin-left':shadow_offset(forpage)
    }).width(shadow_width(forpage))
  }

  book.on('ready', function(){
    $('#book').addClass('dropshadow');
  })

  book.on('resize', function(newsize){
    
    setTimeout(function(){
      currentsize = newsize;

      currentsize.ratio = currentsize.width / window.$storytimebook.config.width;

      var windowsize = {
        width:$(window).width(),
        height:$(window).height()
      }

      var xpos = windowsize.width/2 - newsize.width/2;
      var ypos = windowsize.height/2 - newsize.height/2;

      currentpos = {
        x:xpos,
        y:ypos
      }

      $('#book').css({
        left:xpos + 'px',
        top:ypos + 'px'
      })

      $('#shadow').css({
        left:xpos + 'px',
        top:ypos + 'px',
        'margin-left':shadow_offset(get_current_page())
      }).height(newsize.height).width(shadow_width(get_current_page()))

      book.load_page(book.currentpage);
    }, 10)
    
    
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

    $('#shadow').show();

    if(book.triggernext){
      book.triggernext();
      book.triggernext = null;
    }


  })

  book.on('animate', function(side){
    //apply_shadow(side);

    if(book.currentpage==1 && side=='left'){
      apply_shadow(0);
    }
    else if(book.currentpage==pagecount-2 && side=='right'){
      apply_shadow(pagecount-1);
    }

    animating = true;
  })

  book.on('animated', function(side){

    if(book.currentpage==0 && side=='right'){
      apply_shadow(1);
    }
    else if(book.currentpage==pagecount-1 && side=='left'){
      apply_shadow(pagecount-2);
    }

    animating = false;
    //apply_shadow(side);
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

  function taparrow(arrow){
    if(animating || loading){
      book.triggernext = function(){
        book.animate_direction(arrow.hasClass('leftarrow') ? -1 : 1);
      }
      return;
    }
    else{
      book.animate_direction(arrow.hasClass('leftarrow') ? -1 : 1);
    }
  }

  function find_dictionary(hit){
    var page = window.$storytimebook.pages[book.currentpage];
    var ret = null;

    for(var i in page.dictionary){
      var block = page.dictionary[i];

      var left = parseFloat(block.x);
      var right = left + (parseFloat(block.width));
      var top = parseFloat(block.y);
      var bottom = top + (parseFloat(block.height));

      if(hit.x>=left && hit.x<=right && hit.y>=top && hit.y<=bottom){
        ret = block;
        break;
      }
    }
    return ret;
  }

  hammertime.ontap = function(ev){
    var elem = ev.originalEvent.srcElement;

    if($(elem).hasClass('arrow')){
      taparrow($(elem));
      return;
    }
    else{
      var book = $(elem).closest('#book');

      if(book.length<=0){
        return;
      }

      /*
      
        where they clicked
        
      */
      var evpos = {
        x:ev.touches[0].x,
        y:ev.touches[0].y
      }

      /*
      
        where they clicked in relation to the book on the screen
        
      */
      var bookevpos = {
        x:evpos.x - currentpos.x,
        y:evpos.y - currentpos.y
      }

      /*
      
        the book coords scaled to match the original boundary from flash
        
      */
      var adjusted_evpos = {
        x:bookevpos.x * (1/currentsize.ratio),
        y:bookevpos.y * (1/currentsize.ratio)
      }

      var block = find_dictionary(adjusted_evpos);




/*
      var hit = {
        x:coords.pageX - $scope.mainbook.size.x,
        y:coords.pageY - $scope.mainbook.size.y,
        screenX:coords.pageX,
        screenY:coords.pageY
      }

      hit.scale = $scope.mainbook.size.scale;
      hit.bookX = $scope.mainbook.size.x;
      hit.bookY = $scope.mainbook.size.y;

      console.log('-------------------------------------------');
      console.log('book click');*/
    }

    
  }


  book.render();

}

