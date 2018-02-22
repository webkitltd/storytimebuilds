// this is the stub

/*

  one of these is created every time a page is loaded

  it represents the active dictionary on the given page

  it emits 'sound' events for the application to handle

  you pass it the data for the page that is active
  
*/
var $ = require('jquery');
var Emitter = require('emitter');

module.exports = function storytimeisland_dictionary(page, currentpos, currentsize){

  // this is the array of dictionary descriptions
  var dict_array = page.dictionary || [];

  function set_scale(elem, targetscale){
    elem.css({

        'transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-webkit-transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-moz-transform':'scale(' + targetscale + ', ' + targetscale + ')',
        '-ms-transform':'scale(' + targetscale + ', ' + targetscale + ')'

      })
  }

  function removepopup(popup){
    set_scale(popup, 0.01);
    setTimeout(function(){
      popup.remove();
    }, 1000)
  }

  function parse_block(block){
    var left = parseFloat(block.x);
    var width = parseFloat(block.width);
    var right = left + width;
    var top = parseFloat(block.y);
    var height = parseFloat(block.height);
    var bottom = top + height;

    return {
      width:width,
      height:height,
      left:left,
      right:right,
      top:top,
      bottom:bottom
    }
  }

  function find_dictionary(hit){
    var ret = null;

    for(var i=0; i<dict_array.length; i++){
      var block = dict_array[i];

      var coords = parse_block(block);

      if(hit.x>=coords.left && hit.x<=coords.right && hit.y>=coords.top && hit.y<=coords.bottom){
        ret = block;
        break;
      }
    }
    return ret;
  }

  function render_block(block, evpos, nosound){

    /*
    
      here we check the extra config to see if there are instructions for this dictionary sound
      
    */
    var sound_name = block.name.replace(/_\d+$/, '');
    var page_config = page;
    var extra_config = page_config.extra_config;

    var mp3 = sound_name;
    var text = sound_name;//

    if(extra_config && extra_config.sounds){
      var sound = extra_config.sounds[sound_name];
      if(sound){
        text = sound.text;
        mp3 = sound.sound;
      }
    }

    text = text.replace(/^\W*/, '');
    text = text.replace(/\W*$/, '');

    var textparts = text.split(' ').map(function(s){
      return s.replace(/^(\w)/, function(st){
        return st.toUpperCase();
      })  
    })

    var final_text = textparts.join(' ');

    var popup = $('<div class="dictionarytab animatorquick">' + final_text + '</div>');

    popup.css({
      left:evpos.x-50 + 'px',
      top:evpos.y-50 + 'px'
    })

    $('body').append(popup);

    setTimeout(function(){
      //$bookmedia.playdictionarysound(dictionaryid);
      set_scale(popup, 1);  
    }, 1)

    setTimeout(function(){
      removepopup(popup);
    }, 3000);

    if(nosound){

    }
    else{
      dictionary_handle.emit('sound', mp3);  
    }
    
  }


  /*
  
    this function is run with a coords object (x,y) for the tap on the screen
    
  */
  function dictionary_handle(evpos){

    /*
      
      where they clicked in relation to the book on the screen
      
    */
    var bookevpos = {
      x:evpos.x - currentpos.x,
      y:evpos.y - currentpos.y
    }

    /*
    
      the book coords scaled to match the original boundary from flash
      
    */
    var adjusted_evpos = {
      x:bookevpos.x * (1/currentsize.ratio),
      y:bookevpos.y * (1/currentsize.ratio)
    }

    var offset = currentsize.dictionary_offset;

    if(offset){
      adjusted_evpos.x += offset;
    }

    var block = find_dictionary(adjusted_evpos);


    if(!block){
      return;
    }

    render_block(block, evpos);
  }

  /*
  
    convert the given index of dictionary item into co-ords to trigger it
    
  */
  function render_index(index, nosound){
    var entry = dict_array[index];
    var coords = parse_block(entry);

    var x = coords.left + (coords.width/2);
    var y = coords.top + (coords.height/2);

    var trigger_coord = {
      x:currentpos.x + (x * currentsize.ratio),
      y:currentpos.y + (y * currentsize.ratio)
    }

    var offset = currentsize.dictionary_offset;

    if(offset){
      trigger_coord.x -= (offset * currentsize.ratio);
    }

    render_block(entry, trigger_coord, nosound);

    dictionary_handle.emit('hint', entry, trigger_coord);
  }

  dictionary_handle.reset = function(){
    $('.dictionarytab').remove();
  }

  dictionary_handle.render_index = render_index;

  for(var i in Emitter.prototype){
    dictionary_handle[i] = Emitter.prototype[i];
  }

  return dictionary_handle;
}

