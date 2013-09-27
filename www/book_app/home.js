// this is the stub

var $ = require('jquery');
var Emitter = require('emitter');
var Teddy = require('./teddy');
var gesture = require('gesture');
var Hammer = require('hammer');

module.exports = function storytimeisland_home(homeselector, templates, global_settings){

  var $elem = $(homeselector).html(templates.homepage);

  var active = true;

  function assign_audio_buttons(){
    $('#nobubblebutton').css({
      opacity:global_settings.voice_audio ? .5 : 1
    })
    $('#bubblebutton').css({
      opacity:global_settings.voice_audio ? 1 : .5
    })
  }

  assign_audio_buttons();

  var currenteddy = Teddy('#teddyholder', templates);

  var shaked = {};

  currenteddy.on('bubblemode', function(mode){
    if(!active){
      return;
    }
    var elemid = mode ? '#bubblebutton' : '#nobubblebutton';

    if(!shaked[elemid]){
      $(elemid).addClass('animated').addClass('bounce');
      setTimeout(function(){
        $(elemid).removeClass('animated').removeClass('bounce');
      }, 2000)
      shaked[elemid] = true;
    }
    
    //global_settings.voice_audio = mode;
    assign_audio_buttons();
  })

  currenteddy.on('teddybutton', function(mode){
    if(!active){
      return;
    }
    $('#teddybutton').show();
  })

  currenteddy.on('finished', function(){
    if(!active){
      return;
    }

    $('#frontpageimage').addClass('animated').addClass('tada');
    setTimeout(function(){
      $('#frontpageimage').removeClass('animated').removeClass('tada');
    }, 2000)


  })    

  currenteddy.on('flicker', function(){
    if(!active){
      return;
    }
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

  var module = new Emitter();
    
  var hammertime;

  var actions = {
    frontpageimage:function(){
      module.emit('loadbook');
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

  currenteddy.on('speak', function(){
    if(active){
      module.emit('teddysound');  
    }
  })

  module.$elem = $elem;
  
  module.destroy = function(){
    active = false;
    currenteddy.destroy();
    //hammertime.ontap = null;
    //hammertime = null; 
  }

  var donemode = false;

  module.start = function(){
    if(!donemode){
      setTimeout(function(){
        currenteddy.animate();
      }, 1);  
    }
    else{
      
    }
    donemode = true;
  }

  /*
  
    PAGE DRAG EVENTS
    
  */
  hammertime = new Hammer($('body').get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })

  hammertime.ontap = function(ev){
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


  $('#frontpageimage').click(function(){
    actions.frontpageimage();
  })

  $('#nobubblebutton').click(function(){
    actions.nobubblebutton();
  })

  $('#bubblebutton').click(function(){
    actions.bubblebutton();
  })

  return module;
}

