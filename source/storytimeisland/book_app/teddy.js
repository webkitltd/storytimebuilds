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

  var parts = [
    ['mouth', 3,$elem.find('.mouth')],
    ['arm', 3,$elem.find('.arm')],
    ['lefteye', 2,$elem.find('.lefteye')],
    ['righteye', 2,$elem.find('.righteye')]
  ]

  var anims = {};

  parts.forEach(function(part){
    anims[part[0]] = new Motio(part[2].get(0), {
      fps:1,
      frames:part[1]
    })
  })

  var isblinking = false;
  var isspeaking = false;

  var timeoutids = {};

  function blinkingloop(){
    if(!isblinking){
      anims.lefteye.to(0, true);  
      anims.righteye.to(0, true);  
      return;
    }
    timeoutids.blink = setTimeout(function(){

      anims.lefteye.to(1, true);
      anims.righteye.to(1, true);

      timeoutids.blink = setTimeout(function(){

        anims.lefteye.to(0, true);
        anims.righteye.to(0, true);

        blinkingloop();  
      }, 100)
      
    }, 2000 + Math.round(Math.random()*3000))
  }

  function speakingloop(){
    if(!isspeaking){
      anims.mouth.to(0, true);  
      return;
    }
    var nextframe = Math.floor(Math.random()*3);
    anims.mouth.to(nextframe, true);
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
    anims.arm.to(frame, true);
  }

  set_blinking(true);

  var teddy =  {
  	animate:function(finished){
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

