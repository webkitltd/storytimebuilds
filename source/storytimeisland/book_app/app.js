// this is the stub

var $ = require('jquery');
var Hammer = require('hammer');
var Book = require('./book');
var Home = require('./home');
var Media = require('./media');
var gesture = require('gesture');

module.exports = function storytimeisland_application(){

  document.ontouchmove = function(event){
    event.preventDefault();
  }

  /*
  
    grab the source of the book
    
  */
  var html = window.$storytimebook.pages.map(function(page, index){

    var no = index + 1;
    var text = (page.text || '').replace(/\n/g, "<br />");

    var offset = page.extra_config.textoffset || {};
    var offsetleft = offset.x || 0;

    if(index==0){
      text = '';
    }

    var elemhtml = [
      '<div class="page">',
      '  <div class="pagebg pagebg' + no + '">',
      '    <div class="pagetext" style="text-align:' + page.alignment + ';">' + text + '</div>',
      '  </div>',
      '</div>'
    ].join("\n");

    return elemhtml;

  })

  /*
  
    activemodule is the object we delegate events to
    
  */
  var activemodule = null;


  var global_settings = {
    voice_audio:true
  };

  var templates = {
    homepage:$('#homepagetemplate').text().replace(/^\s+/, ''),
    teddy:$('#teddytemplate').text().replace(/^\s+/, ''),
    gallery:$('#gallerytemplate').text().replace(/^\s+/, '')
  };

  var book_factory = Book('#book', html, templates);
  var home_factory = Home('#home', templates, global_settings);
  var media = Media(window.$storytimebook, global_settings);

  media.on('loaded:all', function(){
    show_home();
  })

  media.on('loaded:sound', function(src){
    
  })


  home_factory.on('teddysound', function(){
    media.playsound('audio/teddy/all');
  })

  home_factory.on('loadbook', function(){
    media.stopsounds();
    activemodule.destroy();
    setTimeout(function(){
      show_book();  
    }, 10)
    
  })



  book_factory.on('view:page', function(index){
    media.playpagesounds(index);
  })

  book_factory.on('animate', function(){
    media.stopsounds();
  })

  book_factory.on('dictionary', function(mp3){
    media.playdictionarysound(mp3);
  })

  book_factory.on('gohome', function(mp3){
    media.stopsounds();
    activemodule.destroy();
    setTimeout(function(){
      show_home();  
    }, 10)
  })


  /*
  
    PAGE DRAG EVENTS
    
  */
  var hammertime = new Hammer($('body').get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })


  hammertime.ondragstart = function(ev){
    if(activemodule && activemodule.ondragstart){
      activemodule.ondragstart(ev);
    }
  }

  hammertime.ondrag = function(ev){
    if(activemodule && activemodule.ondrag){
      activemodule.ondrag(ev);
    }
  }

  hammertime.ondragend = function(ev){
    if(activemodule && activemodule.ondragend){
      activemodule.ondragend(ev);
    }
  }

  hammertime.ontap = function(ev){
    if(activemodule && activemodule.ontap){
      activemodule.ontap(ev);
    }
  }

  hammertime.onswipe = function(ev){
    if(activemodule && activemodule.onswipe){
      activemodule.onswipe(ev);
    }
  }




  function show_home(){
    $('#teddybutton').css({
      display:'none'
    });
    $('#bookviewer').css({
      display:'none'
    });
    activemodule = home_factory();
  }

  function show_book(){
    $('#teddybutton').css({
      display:'block'
    });
    $('#bookviewer').css({
      display:'block'
    });
    activemodule = book_factory();
  }

  function load_all(){
    media.load({
      sounds:['audio/teddy/all']
    })
  }

  setTimeout(load_all, 100);

}

