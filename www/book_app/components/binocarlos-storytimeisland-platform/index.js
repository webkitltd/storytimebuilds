module.exports = function storytimeisland_platform(options){
  
  options = options || {};

  var is_phonegap = options.is_phonegap;
  var is_android = false;

  if(is_phonegap){
    /*
    
      androids
      
    */
    if((device.platform || '').toLowerCase().match(/android/)){
      is_android = true;
    }

    
  }

  return {
    is_phonegap:is_phonegap,
    is_android:is_android
  }
}

