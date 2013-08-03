// this is the stub

window.$storytimeisland_application = function(){

  var $ = require('jquery');
  var Hammer = require('hammer');

  document.ontouchmove = function(event){
    event.preventDefault();
  }

  /*
  
    grab the source of the book
    
  */
  var html = window.$storytimebook.pages.map(function(page, index){

    var no = index + 1;
    var text = page.text.replace(/\n/g, "<br />");

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
    homepage:$('#homepagetemplate').text(),
    teddy:$('#teddytemplate').text()
  };

  var book_factory = window.$storytimeisland_book('#book', html);
  var home_factory = window.$storytimeisland_home('#home', templates, global_settings);
  var media = window.$storytimeisland_media(window.$storytimebook, global_settings);

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
    show_book();
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




  function show_home(){
    activemodule = home_factory();
  }

  function show_book(){
    activemodule = book_factory();
  }

  function load_all(){
    media.load({
      sounds:['audio/teddy/all']
    })
  }
  

  setTimeout(load_all, 100);




}

