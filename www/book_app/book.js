// this is the stub

var $ = require('jquery');
var Emitter = require('emitter');
var Hammer = require('hammer');
var BookFactory = require('storytimeisland-book');
var browser = require("browser-type").browser;
//var Gallery = require('storytimeisland-gallery');

module.exports = function storytimeisland_book(bookselector, data, global_settings){

  var bookactive = false;

  /*
  
    the book renderer
    
  */
  var book = BookFactory({
  	selector:'#bookviewer',
  	data:data,
  	allow3d:true,
  	is_phonegap:window.$phonegap,
  	perspective:950,
    dictionary:true,
    lastpagehtml:$('#lastpagetemplate').html(),
    play_speech:function(){
      return global_settings.voice_audio;
    }
  })

  book.begin = function(){
    bookactive = true;
    $('#teddybutton').css({
      display:'block'
    });
    $('#bookviewer').show();
    setTimeout(function(){
      book.activate();

      setTimeout(function(){
        $('.arrow').css({
          opacity:1
        })
      }, 100)
    }, 10)
  }

  var leftarrowelem = $('.leftarrow');
  var rightarrowelem = $('.rightarrow');
  var teddybuttonelem = $('#teddybutton');
  var homebuttonelem = $('#homebutton');

  book.on('loaded', function(index){
    if(index<=0){
      leftarrowelem.css({
        display:'none'
      })
    }
    else{
      leftarrowelem.css({
        display:'block'
      }); 
    }
    if(index>=book.pagecount-1){
      rightarrowelem.css({
        display:'none'
      })
    }
    else{
      rightarrowelem.css({
        display:'block'
      })
    }
  })

  book.on('gallery:open', function(){
    $('#homebutton').show();
    $('#teddybutton .normal').hide();
    $('#teddybutton .highlight').show();
  })

  book.on('gallery:close', function(){
    $('#homebutton').hide();
    $('#teddybutton .normal').show();
    $('#teddybutton .highlight').hide();
  })

  function left_arrow_click(){
    if(!bookactive){
      return;
    }
    book.goleft();
  }

  function right_arrow_click(){
    if(!bookactive){
      return;
    }
    book.goright();
  }

  function teddy_button_click(){
    if(!bookactive){
      return;
    }
    book.togglegallery();
  }

  function home_button_click(){
    if(!bookactive){
      return;
    }
    $('.arrow').css({
      opacity:0
    })
    bookactive = false;
    book.media.stopsounds();
    book.emit('gohome');
    book.resetgallery();
    $('#homebutton').hide();
    $('#teddybutton .normal').show();
    $('#teddybutton .highlight').hide();
  }

  var bodytap = new Hammer($('body').get(0), {
    tap_max_distance:30
  })

  bodytap.ontap = function(ev){
    var target = $(ev.originalEvent.srcElement);

    if(target.hasClass('leftarrow')){
      left_arrow_click();
    }
    else if(target.hasClass('rightarrow')){
      right_arrow_click(); 
    }
    else if(target.closest('#teddybutton').length>0){
      teddy_button_click();
    }
    else if(target.closest('#homebutton').length>0){
      home_button_click();
    }
    
  }

  if(browser.type=='mozilla'){
    $('.leftarrow').click(left_arrow_click);
    $('.rightarrow').click(right_arrow_click);
    $('#teddybutton').click(teddy_button_click);
    $('#homebutton').click(home_button_click);  
  }

  return book;

/*
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
*/     



    /*
    if(gallery.active && ev.direction=='up'){
      close_gallery();
      return;
    }*/





  /*
  
    GALLERY
    

  var gallery = Gallery({
    pages:bookdata.pages,
    append_to:bookelem.parent()
  });

  gallery.on('loadpage', function(index){
    close_gallery();
    if(index==0){
      apply_shadow(0);

    }
    else if(index==pagecount-1){
      apply_shadow(pagecount-1);
    }
    $('#lastpagehtml').hide();
    book.animate_index(index);
  })

  function open_gallery(){
    gallery.$elem.css({
      top:'0px'
    })
    setTimeout(function(){
      gallery.active = true;
      //$('#homebutton').show();
      //$('#teddybutton .normal').hide();
      //$('#teddybutton .highlight').show();
    }, 10)
  }

  function close_gallery(){
    gallery.$elem.css({
      top:'-120px'
    })
    setTimeout(function(){
      gallery.active = false;
      //$('#homebutton').hide();
      //$('#teddybutton .normal').show();
      //$('#teddybutton .highlight').hide();
    }, 10)
    
    
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

  var leftarrowelem = $('.leftarrow');
  var rightarrowelem = $('.rightarrow');


*/

}

