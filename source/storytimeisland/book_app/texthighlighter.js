// this is the stub

/*

  an overlay of the text on a page that highlights as the text is being read
  
*/
var $ = require('jquery');
var Emitter = require('emitter');

module.exports = function storytimeisland_texthighlighter(html, timings){

  $('.text_highlighter').remove();

  var $elem = $(html);

  $elem.addClass('text_highlighter');
  $elem.show();
  $elem.css({
    position:'absolute',
    left:'0px',
    top:'0px',
    width:'100%',
    height:'100%'
  })

  $elem.find('.pagebg').css({
    'background':'url()'
  })

  var text = $elem.find('.pagetext').html().replace(/<br>/g, "\n");

  text = text.replace(/([\w\.'"-]+)/g, function(match, word){
    return '<span class="highlightspan">' + word + '</span>';
  }).replace(/\n/g, '<br>');

  $elem.find('.pagetext').html(text);

  var highlightspans = $elem.find('.highlightspan');

  highlightspans.css({
    color:'red',
    opacity:0
  })

  var highlighter = {};
  highlighter.elem = $elem;

  for(var i in Emitter.prototype){
    highlighter[i] = Emitter.prototype[i];
  }

  highlighter.reset = function(){
    clearTimeout(this.timeoutid);
    $elem.remove();
  }

  highlighter.start = function(){
    var currentindex = 0;

    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    console.log('starting');
    console.dir(timings);

    function runhighlight(index){
      var timing = timings[index+1];
      
      if(!timing){
        return;
      }

      var gap = timing - timings[index];

      highlightspans.eq(index).css({
        opacity:1
      })
        
      setTimeout(function(){
        highlightspans.eq(index).addClass('animator').css({
          opacity:0
        })
      }, 1000)

      setTimeout(function(){
        runhighlight(index+1);
      }, gap)
      
    }

    setTimeout(function(){
      runhighlight(0);
    }, timings[0]);
  }

  return highlighter;

}