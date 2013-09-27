/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;

var fs = require('fs');
var _ = require('lodash');
var eyes = require('eyes');
var dye = require('dye');
var path = require('path');
var log = require('logule').init(module, 'storytimeisland build server');
var express = require('express');
var wrench = require('wrench');
var exec = require('child_process').exec;
var async = require('async');
var BookData = require('../lib/bookdata');
var BookTemplate = require('../lib/booktemplate');
var ImageProcessor = require('../lib/imageprocessor');


// loop over several commands in sequence
function run_commands(commands, done){
  var script = path.normalize(__dirname + '/book.js');

  async.forEachSeries(commands, function(cmd, nextcmd){

    cmd = 'node ' + script + ' ' + cmd;
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    console.log('running: ' + dye.yellow(cmd));

    exec(cmd, function(error, result){
      console.log(result);
      setTimeout(function(){
        nextcmd();
      }, 200)
      
    })
  }, done)
}

// take a folder in of images and output a folder of them resized
function resize_images(infolder, outfolder){

  process.env.NODE_ENV = 'development';

  wrench.mkdirSyncRecursive(outfolder);

  var processor = new ImageProcessor(infolder, outfolder, [{
    width:1024,
    height:768
  },{
    width:102,
    height:77,
    name:'thumb'
  }])

  processor.process(function(){
    console.log('-------------------------------------------');
    console.log('images done');
  });
  
}

// serve the contents of a folder as a website
function webserver(folder){

  process.env.NODE_ENV = 'development';

  log.info('Running server: ' + dye.yellow(folder));

  var express = require('express');

  var app = express();

  if(!fs.existsSync(folder)){
    throw new Error(folder + ' does not exist');
  }

  app.use(express.static(folder));

  app.listen(80, function(){
    console.log('-------------------------------------------');
    console.log('server listening');
  });
  
}

// publish a storytime island book
function publish(inputfolder, outputfolder){

  process.env.NODE_ENV = 'development';

  var template_folder = path.normalize(__dirname + '/../www/book_template');
  var app_template_folder = path.normalize(__dirname + '/../www/book_app');
  var assets_folder = path.normalize(__dirname + '/../www/book_assets');

  if(!fs.existsSync(inputfolder)){
    throw new Error('folder missing: ' + dye.yellow(inputfolder));      
  }

  var parts = inputfolder.split(/\W*/);
  var name = parts.pop();

  wrench.rmdirSyncRecursive(outputfolder, true);
  wrench.copyDirSyncRecursive(template_folder, outputfolder);

  wrench.copyDirSyncRecursive(app_template_folder + '/build', outputfolder + '/build');
  wrench.copyDirSyncRecursive(assets_folder, outputfolder + '/build/storytimeislandbook');

  if(fs.existsSync(inputfolder + '/audio')){
    wrench.copyDirSyncRecursive(inputfolder + '/audio', outputfolder + '/audio');
  }

  if(fs.existsSync(inputfolder + '/resizedimages')){
    wrench.copyDirSyncRecursive(inputfolder + '/resizedimages', outputfolder + '/images');
  }

  if(fs.existsSync(inputfolder + '/icons')){
    wrench.copyDirSyncRecursive(inputfolder + '/icons', outputfolder + '/icons');
  }

  var data = new BookData(name, inputfolder);

  if(fs.existsSync(inputfolder + '/lastpage.html')){
    data.last_page_html = fs.readFileSync(inputfolder + '/lastpage.html', 'utf8');    
  }
  else{
    data.last_page_html = '';
  }

  data.load(function(){
    var template = new BookTemplate(template_folder + '/index.ejs', data);
    var html = template.render();
    fs.writeFileSync(outputfolder + '/index.html', html, 'utf8');
    fs.unlinkSync(outputfolder + '/index.ejs');
    console.log('-------------------------------------------');
    console.log('done');

  })  
}

function android(inputfolder, outputfolder){  
  process.env.NODE_ENV = 'development';

  var wwwfolder = outputfolder + '/assets/www';

  if(!fs.existsSync(inputfolder)){
    throw new Error('folder missing: ' + dye.yellow(inputfolder));      
  }

  if(!fs.existsSync(outputfolder)){
    throw new Error('folder missing: ' + dye.yellow(outputfolder));      
  }

  wrench.mkdirSyncRecursive(wwwfolder);
  wrench.rmdirSyncRecursive(wwwfolder, true);
  wrench.copyDirSyncRecursive(inputfolder, wwwfolder);

  var copyfiles = [
    'cordova.js',
    'env.js'
  ]
  
  copyfiles.forEach(function(file){
    fs.createReadStream(path.normalize(__dirname + '/../android_template/' + file)).pipe(fs.createWriteStream(wwwfolder + '/' + file));
  })

}
program
  .version(version)

program
  .command('images [infolder] [outfolder]')
  .description('convert the big images to small ones')
  .action(resize_images)

program
  .command('publish [infolder] [outfolder]')
  .description('compile a storytimeisland book')
  .action(publish)


program
  .command('android [infolder] [outfolder]')
  .description('inject the html into an android app')
  .action(android)

program
  .command('serve [folder]')
  .description('run a webserver for the given folder')
  .action(webserver)






/*

program
  .command('singlebook [provider] [book] [quickmode]')
  .description('build html for a single book')
  .action(function(provider, book, quickmode){

    process.env.NODE_ENV = 'development';

    var commands = [
      provider + ' ' + book + (quickmode ? ' ' + quickmode : ''),
      'serve ' + provider + '/' + book
    ]

    run_commands(commands, function(){
      console.log('-------------------------------------------');
      console.log('done');
    })
    
    
  })

program
  .command('singleandroid [provider] [book] [create]')
  .description('build html for a single book')
  .action(function(provider, book, create){

    process.env.NODE_ENV = 'development';

    var appname = (book.replace(/^(\w)/, function(c){return c.toUpperCase();}));

    var commands = [
      provider + ' ' + book
    ];

    if(create=='yes'){
      commands.push('createandroid ' + appname + ' com.' + provider + '.' + book)
    }

    commands.push('android ' + provider + '/' + book + ' ' + appname);
    
    run_commands(commands, function(){
      console.log('-------------------------------------------');
      console.log('done');
    })
    
    
  })


program
  .command('allandroid')
  .description('build all androids')
  .action(function(){

    process.env.NODE_ENV = 'development';

    var commands = [
      'createandroid Freddy FreddyTheFisherman com.storytimeisland.freddy',
      'createandroid Frank FrankTheFireman com.storytimeisland.frank',
      'android storytimeisland/freddy Freddy',
      'android storytimeisland/frank Frank'      
    ]

    run_commands(commands, function(){
      console.log('-------------------------------------------');
      console.log('done');
    })
    
    
  })


program
  .command('storytimeisland [name]')
  .description('convert a storytimeisland book to html output')
  .action()


program
  .command('android [htmlname] [androidname]')
  .description('inject the html content for a book into the android folder')
  .action()

program
  .command('createandroid [appname] [apptitle] [packagename]')
  .description('create the android stub folder for an app')
  .action(
// create the stub folder for the android app
function create_android(outputfolder, appname, apptitle, packagename){

  process.env.NODE_ENV = 'development';

  var settings = {
    appname:appname,
    apptitle:apptitle,
    packagename:packagename
  }

  var inputfolder = path.normalize(__dirname + '/../android_template/app_template');

  wrench.mkdirSyncRecursive(outputfolder);
  wrench.rmdirSyncRecursive(outputfolder, true);
  wrench.copyDirSyncRecursive(inputfolder, outputfolder);

  var code_folder = outputfolder + '/src/' + (settings.packagename.split('.').join('/'));

  wrench.mkdirSyncRecursive(code_folder);

  var code_templates = {
    'MyPhoneGap.java':'MyPhoneGap.java',
    'AppName.java':settings.appname + '.java'
  }
  _.each(code_templates, function(outpath, inpath){
    var template = new BookTemplate(path.normalize(__dirname + '/../android_template/code_template/' + inpath), {
      settings:settings
    })

    var code = template.render();

    fs.writeFileSync(code_folder + '/' + outpath, code, 'utf8');
  })

  var templates = [
    'build.xml',
    'AndroidManifest.xml',
    '.project',
    'res/xml/config.xml',
    'res/values/strings.xml',
    'res/layout/main.xml'
  ]

  _.each(templates, function(templatepath){

    console.log('-------------------------------------------');
    console.log('rendering: ' + templatepath);
    console.dir(settings);
    var template = new BookTemplate(path.normalize(outputfolder + '/' + templatepath), {
      settings:settings
    })

    var code = template.render();

    fs.writeFileSync(outputfolder + '/' + templatepath, code, 'utf8');
  })
  
})  
*/



program
  .command('*')
  .action(function(command){
    console.log('command: "%s" not found', command);
  })

program.parse(process.argv);