// this is the stub

window.$storytimeisland_home = function(homeselector, templates, global_settings){

  var $ = require('jquery');
  var Emitter = require('emitter');

  var currenteddy = null;

   /*
  
    HOME PAGE SETUP
    
  */
  function homepage_factory(){

    $(homeselector).html(templates.homepage);

    function assign_audio_buttons(){
      $('#nobubblebutton').css({
        opacity:global_settings.voice_audio ? .5 : 1
      })
      $('#bubblebutton').css({
        opacity:global_settings.voice_audio ? 1 : .5
      })
    }

    assign_audio_buttons();

    currenteddy = window.$storytimeisland_teddy('#teddyholder', templates);

    currenteddy.on('speak', function(){
      homepage_factory.emit('teddysound');
    })

    currenteddy.on('bubblemode', function(mode){
      if(mode){
        $('#bubblebutton').css({
          'visibility':'visible'
        })
      }
      else{
        $('#nobubblebutton').css({
          'visibility':'visible'
        })
      }
      global_settings.voice_audio = mode;
      assign_audio_buttons();
    })

    currenteddy.on('teddybutton', function(mode){
      $('#teddybutton').show();
    })

    currenteddy.on('flicker', function(mode){

    })

    setTimeout(function(){
      currenteddy.animate();
    }, 1);

    var actions = {
      frontpageimage:function(){
        homepage_factory.emit('loadbook');
      },
      nobubblebutton:function(){
        global_settings.voice_audio = false;
        assign_audio_buttons();
      },
      bubblebutton:function(){
        global_settings.voice_audio = true;
        assign_audio_buttons();
      }
    }

    return {
      destroy:function(){
        $(homeselector).html('');
        currenteddy.destroy();    
      },
      ontap:function(ev){
        var elem = ev.originalEvent.srcElement;
        var button = $(elem).closest('.tapbutton');
        if(button.length<=0){
          return;
        }
        var fn = actions[button.attr('id')];
        if(!fn){
          return;
        }
        fn();
      }
    };
  }

  for(var i in Emitter.prototype){
    homepage_factory[i] = Emitter.prototype[i];
  }

  return homepage_factory;
}

