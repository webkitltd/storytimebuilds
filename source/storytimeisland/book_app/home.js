// this is the stub

var $ = require('jquery');
var Emitter = require('emitter');
var Teddy = require('./teddy');
var animate = require('animate');

module.exports = function storytimeisland_home(homeselector, templates, global_settings){

  var currenteddy = null;

   /*
  
    HOME PAGE SETUP
    
  */

  // donemode means we have already done the homepage
  // just display don't animate
  function homepage_factory(donemode){

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

    currenteddy = Teddy('#teddyholder', templates);

    currenteddy.on('speak', function(){
      homepage_factory.emit('teddysound');
    })

    var shaked = {};

    currenteddy.on('bubblemode', function(mode){
      var elemid = mode ? '#bubblebutton' : '#nobubblebutton';

      if(!shaked[elemid]){
        animate($(elemid).get(0), 'bounce')
        setTimeout(function(){
          $(elemid).removeClass('animate');
        }, 2000)
        shaked[elemid] = true;
      }
      
      //global_settings.voice_audio = mode;
      assign_audio_buttons();
    })

    currenteddy.on('teddybutton', function(mode){
      $('#teddybutton').show();
    })

    currenteddy.on('finished', function(){

      animate($('#frontpageimage').get(0), 'shake');

    })    

    currenteddy.on('flicker', function(){
      var mode = false;
      var counter = 0;
      function run_flicker(){
        mode = !mode;
        counter++;
        if(counter>=7){
          return;
        }
        if(mode){
          $('#teddybutton .normal').hide();
          $('#teddybutton .highlight').show();
        }
        else{
          $('#teddybutton .normal').show();
          $('#teddybutton .highlight').hide();
        }
        setTimeout(run_flicker, 500);
      }

      run_flicker();
    })

    if(!donemode){
      setTimeout(function(){
        currenteddy.animate();
      }, 1);  
    }
    else{
      console.log('-------------------------------------------');
      console.log('-------------------------------------------');
      console.log('home done');
    }
    

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

