// this is the stub

window.$storytimeisland_home = function(homeselector, templates, global_settings){

  var $ = require('jquery');
   /*
  
    HOME PAGE SETUP
    
  */
  function homepage_factory(){

    $(homeselector).html(templates.homepage);

    function assign_audio_buttons(){
      $('#nobubbleimage').css({
        opacity:global_settings.voice_audio ? .3 : 1
      })
      $('#bubbleimage').css({
        opacity:global_settings.voice_audio ? 1 : .3
      })
    }

    $('#frontpageimage').click(function(){

    })

    $('#nobubbleimage').click(function(){
      global_settings.voice_audio = false;
      assign_audio_buttons();
    })

    $('#bubbleimage').click(function(){
      global_settings.voice_audio = true;
      assign_audio_buttons();
    })

    assign_audio_buttons();
  }

  homepage_factory.destroy = function(){
    $(homeselector).html('');
  }

  return homepage_factory;
}

