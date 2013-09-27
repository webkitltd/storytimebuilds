// this is the stub

/*

  one of these is created every time a page is loaded

  it represents the active dictionary on the given page

  it emits 'sound' events for the application to handle

  you pass it the data for the page that is active
  
*/
var $ = require('jquery');
var Emitter = require('emitter');

module.exports = function storytimeisland_teddy(selector, templates){

  var $elem = $(selector);

  $elem.html(templates.teddy);

  var lefteye = $elem.find('.lefteye');
  var righteye = $elem.find('.righteye');
  var mouth = $elem.find('.mouth');
  var mouthimg = $elem.find('.mouthimg');
  var arm = $elem.find('.arm');

  var isblinking = false;
  var isspeaking = false;

  var timeoutids = {};

  function eye_frame(frame){
    lefteye.css({
      'background':'url(build/storytimeislandbook/img/teddy/eyes_' + frame + '.png)'
    })
    righteye.css({
      'background':'url(build/storytimeislandbook/img/teddy/eyes_' + frame + '.png)'
    })
  }

  function arm_frame(frame){
    arm.css({
      'background':'url(build/storytimeislandbook/img/teddy/arm_' + frame + '.png)'
    })
  }

  function mouth_frame(frame){

    offset = -(frame * 39);
    mouthimg.css({
      'background-position':offset + 'px 0px'
    })
  }

  function blinkingloop(){
    if(!isblinking){
      eye_frame(1);
      return;
    }
    timeoutids.blink = setTimeout(function(){

      eye_frame(2);

      timeoutids.blink = setTimeout(function(){

        eye_frame(1);

        blinkingloop();  
      }, 100)
      
    }, 2000 + Math.round(Math.random()*3000))
  }

  function speakingloop(){
    if(!isspeaking){
      return;
    }

    var nextframe = Math.floor(Math.random()*3);

    mouth_frame(nextframe);
    
    timeoutids.speak = setTimeout(speakingloop, 50 + Math.round(Math.random()*50));
  }

  function set_speaking(mode){
    isspeaking = mode;
    speakingloop();
  }

  function set_blinking(mode){
    isblinking = mode;
    blinkingloop();          
  }

  function set_arm(frame){
    arm_frame(frame+1);
  }

  var teddy =  {
  	animate:function(finished){
      
      if(this.animated){
        return;
      }
      this.animated = true;

      set_blinking(true);
      
  		var self = this;
  		var steps = [

        function(next){
          timeoutids.animate = setTimeout(next, 2500);
        },

        function(next){
          set_speaking(true);
          self.emit('speak');
          //$rootScope.$broadcast('audio:play', 'audio/teddy/all');
          timeoutids.animate = setTimeout(next, 10);
        },

        function(next){
          timeoutids.animate = setTimeout(next, 2500);
        },

        function(next){
          set_arm(1);
          self.emit('bubblemode', true);
          timeoutids.animate = setTimeout(next, 2500);
        },

        function(next){
          set_arm(2);
          self.emit('bubblemode', false);
          timeoutids.animate = setTimeout(next, 2500);
        },

        function(next){
          set_arm(0);
          self.emit('bubblemode', true);
          timeoutids.animate = setTimeout(next, 3000);
        },

        function(next){
          set_arm(1);
          self.emit('teddybutton', true);
          self.emit('flicker');
          timeoutids.animate = setTimeout(next, 3000);
        },

        function(next){
          set_arm(0);
          self.emit('finished');
          set_speaking(false);
          next();
        }
      ]

      function runstep(){
      	if(steps.length<=0){
      		if(finished){
      			finished();
      		}
      		return;
      	}
      	var step = steps.shift();

      	step(runstep);
      }

      runstep();
  	},
  	destroy:function(){
  		if(timeoutids.blink){
  			clearTimeout(timeoutids.blink);
  		}

  		if(timeoutids.animate){
  			clearTimeout(timeoutids.animate);
  		}

  		if(timeoutids.speak){
  			clearTimeout(timeoutids.speak);
  		}
  	}
  }

  for(var i in Emitter.prototype){
    teddy[i] = Emitter.prototype[i];
  }

  return teddy;
}

