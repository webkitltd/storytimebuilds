// this is the stub

var $ = require('jquery');
var has3d = require('has-translate3d');
var Emitter = require('emitter');
var Dictionary = require('./dictionary');
var TextHighlighter = require('./texthighlighter');
var Gallery = require('./gallery');
var PageTurner = require('pageturner');

module.exports = function storytimeisland_book(bookselector, html, templates, data){

  var is_3d = has3d;

  var startpage = 0;

  var rendered = false;

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

  function book_factory(){

    var activedictionary = null;
    var activehighlighter = null;

    var dragging = null;
    var animating = false;
    var loading = false;
    var currentsize = {};
    var currentpos = {};

    var gallery = Gallery(templates.gallery);

    $(bookselector).html(html.join("\n"));

    var pagecount = $('.page').length;
    
    var book = new PageTurner({
      has3d:is_3d,
      bookselector:bookselector,
      pageselector:'.page',
      apply_pageclass:'bookpage',
      startpage:startpage,
      perspective:950
    })

      /*
    }
    else{
      var PageFader = require('pagefader');
      book = new PageFader({
        bookselector:bookselector,
        pageselector:'.page',
        apply_pageclass:'bookpage',
        startpage:startpage
      })
    }
    */
    
    var bookelem = $(bookselector);

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

    function open_gallery(){
      $('#gallery').css({
        top:'0px'
      })
      setTimeout(function(){
        gallery.active = true;
        $('#homebutton').show();
        $('#teddybutton .normal').hide();
        $('#teddybutton .highlight').show();
      }, 10)
      
      
    }

    function close_gallery(){
      $('#gallery').css({
        top:'-120px'
      })
      setTimeout(function(){
        gallery.active = false;
        $('#homebutton').hide();
        $('#teddybutton .normal').show();
        $('#teddybutton .highlight').hide();
      }, 10)
      
      
    }

    function clickteddy(){
      if(gallery.active){
        close_gallery();
      }
      else{
        open_gallery(); 
      }
    }

    function clickhome(){
      close_gallery();
      setTimeout(function(){
        book_factory.emit('gohome');  
      },500)
      
    }


    book.on('ready', function(){
      //$(bookselector).addClass('dropshadow');
    })

    book.on('resize', function(newsize){
      
      setTimeout(function(){
        currentsize = newsize;

        currentsize.ratio = currentsize.width / window.$storytimebook.config.width;

        var windowsize = {
          width:window.innerWidth,
          height:window.innerHeight
        }

        var xpos = windowsize.width/2 - newsize.width/2;
        var ypos = windowsize.height/2 - newsize.height/2;

        currentpos = {
          x:xpos,
          y:ypos
        }

        $(bookselector).css({
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
        $('.leftarrow').css({
          display:'none'
        })
      }
      else{
        $('.leftarrow').css({
          display:'block'
        }); 
      }

      if(index>=pagecount-1){
        $('.rightarrow').css({
          display:'none'
        })
      }
      else{
        $('.rightarrow').css({
          display:'block'
        })
      }

      $('#shadow').css({
        display:'block'
      })

      activedictionary = Dictionary(get_page_data(index), currentpos, currentsize);
      activehighlighter = TextHighlighter(html[index], data.config.highlighters ? data.config.highlighters[index] : []);
      activehighlighter.start();
      $('#book').append(activehighlighter.elem);

      activedictionary.on('sound', function(mp3){
        book_factory.emit('dictionary', mp3);
      })

      if(book.triggernext){
        book.triggernext();
        book.triggernext = null;
      }
      else{
        book_factory.emit('view:page', index);
      }

      gallery.set_current_page(index);

      
    })

    book.on('animate', function(side){
      if(activedictionary){
        activedictionary.reset();
      }

      if(activehighlighter){
        activehighlighter.reset();
      }

      if(book.currentpage==1 && side=='left'){
        apply_shadow(0);
      }
      else if(book.currentpage==pagecount-2 && side=='right'){
        apply_shadow(pagecount-1);
      }

      animating = true;
      book_factory.emit('animate');
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

    gallery.on('loadpage', function(index){
      close_gallery();
      book.animate_index(index);
    })

    book.ondragstart = function(ev){
      dragging = true;
    }

    book.ondrag = function(ev){
      if(!dragging){
        return;
      }

      if(ev.distance>=15){
        if(gallery.active){
          gallery.animate(ev.direction=='left' ? 1 : -1);
        }
        else{
          if(animating || loading){
            book.triggernext = function(){
              book.animate_direction(ev.direction=='left' ? 1 : -1);
            }
            return;
          }
          book.animate_direction(ev.direction=='left' ? 1 : -1);    
        }

        dragging = false;
      }

    }

    book.ondragend = function(ev){
      dragging = false;
    }

    book.onswipe = function(ev){
      if(gallery.active && ev.direction=='up'){
        close_gallery();
        return;
      }
    }

    book.ontap = function(ev){
      var elem = ev.originalEvent.srcElement;

      var teddy = $(elem).closest('#teddybutton');

      if(teddy.length>0){
        clickteddy();
        return;
      }

      var home = $(elem).closest('#homebutton');

      if(home.length>0){
        clickhome();
        return;
      }

      if(gallery.active){
        gallery.tap(ev);
        return;
      }

      if($(elem).hasClass('arrow')){
        taparrow($(elem));
        return;
      }
      else{
        var book = $(elem).closest(bookselector);

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

        if(activedictionary){
          activedictionary(evpos);
        }
      }
    }

    function get_page_data(forpage){
      return data.pages[arguments.length>0 ? forpage : book.currentpage];
    }

    book.render();

    book.destroy = function(){
      $(bookselector).html('');
      gallery.destroy();
    }

    return book;
  }

  for(var i in Emitter.prototype){
    book_factory[i] = Emitter.prototype[i];
  }

  return book_factory;
}

