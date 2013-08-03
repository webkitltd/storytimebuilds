// this is the stub

window.$storytimeisland_book = function(bookselector, html){

  var $ = require('jquery');
  var has3d = require('has-translate3d');

  var is_3d = has3d;

  var startpage = 0;

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

    var book;
    var activedictionary = null;
    var dragging = null;
    var animating = false;
    var loading = false;
    var currentsize = {};
    var currentpos = {};

    $(bookselector).html(html.join("\n"));

    var pagecount = $('.page').length;
    if(is_3d){
      var PageTurner = require('pageturner')
      book = new PageTurner({
        bookselector:bookselector,
        pageselector:'.page',
        apply_pageclass:'bookpage',
        startpage:startpage,
        perspective:950
      })
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


    book.on('ready', function(){
      $(bookselector).addClass('dropshadow');
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

      activedictionary = window.$storytimeisland_dictionary(get_page_data(index), currentpos, currentsize);


    })

    book.on('animate', function(side){
      //apply_shadow(side);

      if(activedictionary){
        activedictionary.reset();
      }
      

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

    book.ondragstart = function(ev){
      dragging = true;
    }

    book.ondrag = function(ev){
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

    book.ondragend = function(ev){
      dragging = false;
    }

    book.ontap = function(ev){
      var elem = ev.originalEvent.srcElement;

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
      return window.$storytimebook.pages[arguments.length>0 ? forpage : book.currentpage];
    }

    book.render();

    return book;
  }

  book_factory.destroy = function(){
    $(bookselector).html('');
  }

  return book_factory;

}

