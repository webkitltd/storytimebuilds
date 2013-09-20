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

program
  .version(version)

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
  .command('allhtml')
  .description('build all html')
  .action(function(){

    process.env.NODE_ENV = 'development';

    var commands = [
      'storytimeisland freddy',
      'storytimeisland frank',
      'iboard monsters'
    ]

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
  .command('storytimeisland_template [name]')
  .description('re-generate a storytimeisland books template')
  .action(function(name, mode){
    
    var inputfolder = path.normalize(__dirname + '/../source/storytimeisland/' + name);
    var outputfolder = path.normalize(__dirname + '/../html_books/storytimeisland/' + name);

    var data = new BookData(name, inputfolder);

    data.load(function(){
      var template = new BookTemplate(path.normalize(__dirname + '/../source/storytimeisland/book_template/index.ejs'), data);

      var html = template.render();
      fs.writeFileSync(outputfolder + '/index.html', html, 'utf8');


    })

  })


program
  .command('storytimeisland_images [name]')
  .description('convert the storytimeisland images')
  .action(function(name, quickmode){

    process.env.NODE_ENV = 'development';

    var inputfolder = path.normalize(__dirname + '/../source/storytimeisland/' + name);

    var imageinput = inputfolder + '/images';
    var imageoutput = inputfolder + '/resizedimages';
    wrench.mkdirSyncRecursive(imageoutput);

    var processor = new ImageProcessor(imageinput, imageoutput, [{
      width:1024,
      height:768
    },{
      width:102,
      height:77,
      name:'thumb'
    }])

    processor.process(function(){
      console.log('-------------------------------------------');
      console.log('done');
    });
    
  })

program
  .command('storytimeisland [name]')
  .description('convert a storytimeisland book to html output')
  .action(function(name, quickmode){

    process.env.NODE_ENV = 'development';

    var inputfolder = path.normalize(__dirname + '/../source/storytimeisland/' + name);
    var outputfolder = path.normalize(__dirname + '/../html_books/storytimeisland/' + name);

    var template_folder = path.normalize(__dirname + '/../source/storytimeisland/book_template');
    var app_template_folder = path.normalize(__dirname + '/../source/storytimeisland/book_app');
    var assets_folder = path.normalize(__dirname + '/../source/storytimeisland/book_assets');

    if(!fs.existsSync(inputfolder)){
      throw new Error('folder missing: ' + dye.yellow(inputfolder));      
    }

    wrench.rmdirSyncRecursive(outputfolder, true);
    wrench.mkdirSyncRecursive(__dirname + '/../html_books/storytimeisland', true);

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
      var template = new BookTemplate(path.normalize(__dirname + '/../source/storytimeisland/book_template/index.ejs'), data);
      var html = template.render();
      fs.writeFileSync(outputfolder + '/index.html', html, 'utf8');
      fs.unlinkSync(outputfolder + '/index.ejs');
      console.log('-------------------------------------------');
      console.log('done');

    })

    
  })

program
  .command('iboard [name]')
  .description('convert an iboard book to html output')
  .action(function(name, mode){

    process.env.NODE_ENV = 'development';

    var inputfolder = path.normalize(__dirname + '/../source/iboard/' + name);
    var outputfolder = path.normalize(__dirname + '/../html_books/iboard/' + name);

    var template_folder = path.normalize(__dirname + '/../source/iboard/book_template');

    if(!fs.existsSync(inputfolder)){
      throw new Error('folder missing: ' + dye.yellow(inputfolder));      
    }

    wrench.rmdirSyncRecursive(outputfolder, true);
    wrench.mkdirSyncRecursive(__dirname + '/../html_books/iboard');
    wrench.copyDirSyncRecursive(inputfolder, outputfolder);

    var templatefiles = fs.readdirSync(template_folder);
    
    templatefiles.forEach(function(file){
      fs.createReadStream(template_folder + '/' + file).pipe(fs.createWriteStream(outputfolder + '/' + file));
    })
    
    console.log('-------------------------------------------');
    console.log('done');
  })


program
  .command('android [htmlname] [androidname]')
  .description('inject the html content for a book into the android folder')
  .action(function(htmlname, androidname){

    process.env.NODE_ENV = 'development';

    var input = path.normalize(__dirname + '/../html_books/' + htmlname);
    var outputfolder = path.normalize(__dirname + '/../androids/' + androidname.toLowerCase());
    var wwwfolder = outputfolder + '/assets/www';

    if(!fs.existsSync(input)){
      throw new Error('folder missing: ' + dye.yellow(input));      
    }

    if(!fs.existsSync(outputfolder)){
      throw new Error('folder missing: ' + dye.yellow(outputfolder));      
    }

    wrench.mkdirSyncRecursive(wwwfolder);
    wrench.rmdirSyncRecursive(wwwfolder, true);
    wrench.copyDirSyncRecursive(input, wwwfolder);

    var copyfiles = [
      'cordova.js',
      'env.js'
    ]
    
    copyfiles.forEach(function(file){
      fs.createReadStream(path.normalize(__dirname + '/../android_template/' + file)).pipe(fs.createWriteStream(wwwfolder + '/' + file));
    })

  })

program
  .command('createandroid [appname] [apptitle] [packagename]')
  .description('create the android stub folder for an app')
  .action(function(appname, apptitle, packagename){

    process.env.NODE_ENV = 'development';

    var settings = {
      appname:appname,
      apptitle:apptitle,
      packagename:packagename
    }

    var inputfolder = path.normalize(__dirname + '/../android_template/app_template');
    var outputfolder = path.normalize(__dirname + '/../androids/' + appname.toLowerCase());

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

    _.each(icon_folders, function(icon_folder){

    })
    
  })  

program
  .command('serve [bookname]')
  .description('run a webserver for the given book html')
  .action(function(name){

    process.env.NODE_ENV = 'development';

    log.info('Running server: ' + dye.yellow(name));

    var bookfolder = path.normalize(__dirname + '/../html_books/' + name);

    if(!fs.existsSync(bookfolder)){
      log.error('folder missing: ' + dye.yellow(bookfolder));
      process.exit();
    }

    var express = require('express');

    var app = express();

    app.use(express.static(bookfolder));

    app.listen(80, function(){
      console.log('-------------------------------------------');
      console.log('server listening');
    });
    
  })


program
  .command('*')
  .action(function(command){
    console.log('command: "%s" not found', command);
  })

program.parse(process.argv);