/*

  the media for a book
  
*/

window.$storytimeisland_media = function(book, global_settings){

  var Emitter = require('emitter');

  var platform = window.$storytimeisland_platform();

  var media = {
    is_android:platform.is_android,
    sounds:{},
    playing:{},
    playspeech:true
  }

  /*
  
    extracts a list of URLS for the sound files we will need for a book
    
  */
  function extract_book_files(){
    
    var all_images = [];
    var all_sounds = [];

    var dictionary_sounds = {};

    all_sounds.push("audio/pagespeech/page0");
    all_sounds.push("audio/pagefx/page0");

    book.pages.forEach(function(page, i){

      if(page.dictionary){
        page.dictionary.forEach(function(entry){
          var key = entry.name.replace(/_.*$/, '');
          dictionary_sounds["audio/sfx/" + key] = true;
        })
      }

      if(i<book.pages.length-2){
        all_sounds.push("audio/pagespeech/page" + page.number);
        all_sounds.push("audio/pagefx/page" + page.number);
      }
      
      all_images.push('images/page' + page.number + '.png');
    })

    var keys = [];
    for(var p in dictionary_sounds){
      keys.push(p);
    }

    all_sounds = all_sounds.concat(keys);

    return {
      images:all_images,
      sounds:all_sounds
    }

  }

  /*
  
    --------------------------------------------
    --------------------------------------------


    LOAD


    --------------------------------------------
    --------------------------------------------
    
  */

  var _loaded = false;

  media.load = function(extrafiles){

    if(_loaded){
      return;
    }

    _loaded = true;

    var self = this;
    
    var bookfiles = extract_book_files(book);

    var allfiles = {
      images:(extrafiles.images || []).concat(bookfiles.images),
      sounds:(extrafiles.sounds || []).concat(bookfiles.sounds)
    }

    var loadsounds = [].concat(allfiles.sounds);

    media.images = allfiles.images;

    var soundcounter = 0;

    function success(){
      // media has loaded
    }

    function media_error(e){
      console.log('media error');
      console.dir(e);
    }

    function load_sound(soundsrc, nextsound){
      var theSound = null;

      if(media.is_android){
        var src = '/android_asset/www/' + soundsrc + '.mp3';
        theSound = new Media(src, success, media_error);
      }
      else{
        theSound = new buzz.sound(soundsrc + '.mp3', {
          preload:soundcounter<20 ? true : false
        })
        soundcounter++;
      }

      media.sounds[soundsrc] = theSound;

      setTimeout(function(){
        self.emit('loaded:sound', soundsrc);
        nextsound();
      }, 10)
    }

    function load_next_sound(){
      if(loadsounds.length<=0){
        self.emit('loaded:all');
        return;
      }
      var nextsound = loadsounds.shift();

      load_sound(nextsound, load_next_sound);
    }

    load_next_sound();
  }


  /*
  
    --------------------------------------------
    --------------------------------------------


    PLAY SOUND


    --------------------------------------------
    --------------------------------------------
    
  */

  media.playdictionarysound = function(name){
    var snd = this.sounds["audio/sfx/" + name];

    if(snd){
      snd.play();
    }
  }

  media.playpagesounds = function(index){

    var fx = this.sounds["audio/pagefx/page" + index];
    fx.play();

    if(global_settings.voice_audio){
      var speech = this.sounds["audio/pagespeech/page" + index];
      speech.play();
    }
  }

  media.playsound = function(name){
    var snd = this.sounds[name];

    if(snd){
      snd.play();
    }
  }

  /*
  
    --------------------------------------------
    --------------------------------------------


    STOP SOUNDS


    --------------------------------------------
    --------------------------------------------
    
  */

  media.stopsounds = function(){
    var self = this;

    clearTimeout(this.seqid);

    for(var name in this.sounds){
      var snd = self.sounds[name];

      if(self.is_android){
        console.log('-------------------------------------------');
        console.log('stopping');
        console.dir(snd);
        snd.seekTo(0);
        snd.stop();
        snd.release();
      }
      else{
        snd.stop();  
      }
    }
  }

  for(var i in Emitter.prototype){
    media[i] = Emitter.prototype[i];
  }

  return media;
}







      /*
      
        --------------------------------------------
        --------------------------------------------


        PLAY PAGE


        --------------------------------------------
        --------------------------------------------
        
      */
/*
      var currentpage = 0;
      var currentseq = [];
      var seqs = [];

      var starttime = 0;
      var hassetup = false;

      function setup(){
        if(hassetup){
          return;
        }

        hassetup = true;


        $('#soundbutton').on('click', function(){
          var nowtime = new Date().getTime();
          var wordtime = nowtime - starttime;
          currentseq.push(wordtime);
          console.log(JSON.stringify(seqs));
        })
       
      }

*/       
      

/*
      media.playpage = function(index){

        var self = this;

        var speechname = 'audio/pagespeech/page' + index;
        var fxname = 'audio/pagefx/page' + index;

        var speech = this.sounds[speechname];
        var fx = this.sounds[fxname];

        if(speech && this.playspeech){
          speech.play();
        }

        if(fx){
          fx.play();  
        }

        return;

        //starttime = new Date().getTime();


        var seq = wordtimings[index];

        if(!seq || seq.length<=0){
          return;
        }

        var wordindex = 0;
        var currenttime = 0;
        async.forEachSeries(seq, function(timer, next){
          var gap = timer - currenttime;
          currenttime = timer;
          self.seqid = setTimeout(function(){
            $rootScope.$broadcast('highlight:word:' + index, wordindex);
            wordindex++;
            next();
          }, gap)
        }, function(){
          
        })

        
        
      }
*/


      /*
      
        we will put this in the config.json for each book
        
      */
      /*

        [],

        [784,962,1146,1434,1810,2866,3130,3314,3668,4234,4506,4986,5394,5769,6098,6625,6833,7009,7585,7801,7977,8313,8817],

        [910,1158,1462,1758,1958,2246,2614,2782,2958,3366,3654,4190,4438,4638,4830,5206,5470,5654],

        [822,1046,1294,1477,1933,2205,2397,2709,3557,3949,4261,4589,4829,5469,5685,5869,6117,6573,7478,7870,8214,8399],

        [719,999,1215,1503,1719,1919,2511,2695,2847,3063,3415,3583,3767,3999,4207,5375,5783,6326,6630,6895,7102,7319,7582,8942,9174,9374,9638,9830,10494,10758,11006,11342],

        [531,971,1331,1643,1835,1987,2931,3235,3771,4091,4507,6235,6483,6739,6915,7179,7387,7803,8003,8283],

        [950,1174,1470,1662,1822,2231,2487,3575,3735,3911,4311,4495,5471,5639,5823,6191,6480,6815,8199,8719,9095,9431,9695,10143,10511,10695,10919,11479,12111,12431,13063,13247,13632],

        [1110,1342,1734,2150,2375,2719,3047,3447,4103,4367,4751,5391,5575,5743,6023,6383,6679,7871,8151,8399,8711,9311,9591,9839,11271,11551,11903,12263,12863,13151,13311,13743,14359,14742,15126,15486,16110,16390,16735,17158,17638,17806,17942,18302],
        [906,1314,1858,2090,2306,2602,3282,3458,3666,3914,4394,4730,5018,5362,5602,5914,7026,7250,7522,7794,8130,8442,8674,8946,9634,10018,10265,10649,11001,11321,11697,12193,12585,13153,14025],
        [904,1160,1424,1656,1984,2440,2888,3248,3488,3792,4472,4672,4864,5144,5768,6064,6280],
        [903,1231,1487,1815,2023,2439,2743,3495,3863,4471,4775,5144,5504,5808,6096,7016,7272,7576,7928,8272,8784,8992,9432,9904,10288,10512,10696],
        [769,993,1337,1713,1985,2416,2664,3329,3592,3840,4144,4504,4784,5216,6240,6600,7024,7984,8345],
        [771,1011,1315,1787,2131,2443,3011,3275,3499,3963,4219,4683,5051,5483,6099,6339],
        [554,1258,1698,1978,2234,2450,2818,3074,3451,4019,4251,4427,5051,5603,5923],
        [713,913,1113,1505,2169,2569,2817,3129,3369,3729,4225,4489,4873,5160,5944,6321,6624,6984,7256,8656,8896,9232,9528,9888,10248,10816,11521,11793,12122,12441,12817,13225],
        [834,1634,2090,2474,2842,3154,3882,4106,4282,4649,5250,6449,6754,7033,7553,7841,8409,8657,8977,9433,9673,9849,11393,11609,11905,12249,12554,13058,13538,14186,14458,14746,15010,15330,15618,15946,16714,17178],
        [1004,1476,1908,2148,2396,2924,3284,3796,4068,4444,4723,5403,5683,6035,6627,7123,7499,8507,8979,9427,10035,10684,10916,11324,12004,12756,13140],
        [913,1193,1673,2009,2257,2649,3041,3281,3593,3816,4057,4529,4752,4968,5192,5480,5745,6040,7160,7400,7632,7864,8144,8440,9120,9552,9792,10081,10569,10945,11289,11545,12713,12969,13185,13489,13985,14313,14569,14745],
        [834,1034,1258,1658,2026,2474,3178,3490,3761,4378,4793,5113,5361,5689,5985,6233],
        [375,671,975,1423,1703,2095,2359,2631,2959,3263,3711,4039,4983,5599,5975,6255,6543,6783,7367,7743,7999,8591,9039,9375,9567]
      ] 

      */