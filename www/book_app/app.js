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

 
  // the teddy homepage speaking
  home.on('teddysound', function(){
    book.media.playsound('audio/teddy/all');
  })

  book.on('begin', function(done){
    home.$elem.fadeOut(function(){
      home.destroy();
      done && done();
    })
  })

  // the media has loaded - tell buddy to hide
  // show the homepage
  // anmiate the teddy
  var loaddone = false;
  book.on('media:loaded', function(){
    if(loaddone){
      return;
    }

    loaddone = true;

    setTimeout(function(){

      book.activate();


      setTimeout(function(){

        $('#homeloading').fadeOut(function(){

          setTimeout(function(){
            $('#bookviewer').fadeIn();

            $('#homeloaded').fadeIn(function(){
              setTimeout(function(){
                home.start();
              }, 1000)    
            })  
          }, 100)
          
        
          
        })

      }, 1000)
      
    }, 500)
  })

  book.on('gohome', function(){
    home.$elem.fadeIn();
    $('#teddy').hide();
  })

  // tell the book media to load + teddy audio
  setTimeout(function(){
    book.load({
      sounds:['audio/teddy/all']
    })
  }, 500)
  

}

