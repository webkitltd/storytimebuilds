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
    drag_min_distance:15,
    tap_max_distance:14
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


  bodytap.ondragstart = function(ev){
    book.ondragstart(ev);
  }

  bodytap.ondrag = function(ev){
    book.ondrag(ev);
  }

  bodytap.ondragend = function(ev){
    book.ondragend(ev);
  }

  if(browser.type=='mozilla'){
    $('.leftarrow').click(left_arrow_click);
    $('.rightarrow').click(right_arrow_click);
    $('#teddybutton').click(teddy_button_click);
    $('#homebutton').click(home_button_click);  
  }

  return book;
}

