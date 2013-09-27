// this is the stub

var $ = require('jquery');

module.exports = function storytimeisland_application(){
  var Home = require('./home');
  var Book = require('./book');

  document.ontouchmove = function(event){
    event.preventDefault();
  }

  var homepage_done = false;

  var global_settings = {
    voice_audio:true
  };

  var templates = {
    homepage:$('#homepagetemplate').text().replace(/^\s+/, ''),
    teddy:$('#teddytemplate').text().replace(/^\s+/, '')
  };

  var startedfirst = false;
  var home = Home('#home', templates, global_settings);
  var book = Book('#bookviewer', window.$storytimebook, global_settings);

  // hide the homepage and bring the book in
  function show_book(){
    home.$elem.hide();
    home.destroy();
    book.begin();

    setTimeout(function(){
      if(!startedfirst){
        book.media.playpagesounds(0, true);
        startedfirst = true;
      }
      
    }, 1000);
  }

  // the teddy homepage speaking
  home.on('teddysound', function(){
    book.media.playsound('audio/teddy/all');
  })

  // they clicked the 'start' button
  home.on('loadbook', show_book);

  // the media has loaded - tell buddy to hide
  // show the homepage
  // anmiate the teddy
  book.on('media:loaded', function(){

    setTimeout(function(){
      $('#homeloading').hide()
      $('#homeloaded').show();

      setTimeout(function(){
        home.start();
      }, 500)
    }, 500)
  })

  book.on('gohome', function(){
    $('#bookviewer').hide();
    home.$elem.show();
  })

  // tell the book media to load + teddy audio
  setTimeout(function(){
    book.load({
      sounds:['audio/teddy/all']
    })
  }, 500)
  
  /*
  function show_home(){
    $('#teddybutton').css({
      display:'none'
    });
    $('#bookviewer').css({
      display:'none'
    });
    activemodule = home_factory(homepage_done);
    homepage_done = true;
  }

  function show_book(){
    $('#teddybutton').css({
      display:'block'
    });
    $('#bookviewer').css({
      display:'block'
    });
    activemodule = book_factory();
    $('#book').hide();
    setTimeout(function(){
      $('#book').fadeIn();
    }, 1000)
  }

  show_home();


  home_factory.on('loadbook', function(){

  })
  */

  /*

  book_factory.on('view:page', function(index){
    setTimeout(function(){
      media.playpagesounds(index);  
    }, 300)

    if(index<window.$storytimebook.pages.length-1){
      $('#lastpagehtml').hide();
    }
    else{
      $('#lastpagehtml').show();
    }
    
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





  function show_home(){
    $('#teddybutton').css({
      display:'none'
    });
    $('#bookviewer').css({
      display:'none'
    });
    activemodule = home_factory(homepage_done);
    homepage_done = true;
  }

  function show_book(){
    $('#teddybutton').css({
      display:'block'
    });
    $('#bookviewer').css({
      display:'block'
    });
    activemodule = book_factory();
    $('#book').hide();
    setTimeout(function(){
      $('#book').fadeIn();
    }, 1000)
  }

  function load_all(){
    media.load({
      sounds:['audio/teddy/all']
    })
  }

  setTimeout(load_all, 100);
    */

}

