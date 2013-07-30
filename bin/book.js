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

var BookData = require('../lib/bookdata');
var BookTemplate = require('../lib/booktemplate');
var ImageProcessor = require('../lib/imageprocessor');

log.info('starting');

program
  .version(version)

program
  .command('storytime [name] [mode]')
  .description('convert the flash output of a book')
  .action(function(name, mode){

    process.env.NODE_ENV = 'development';

    var bookfolder = path.normalize(__dirname + '/../flash_books/' + name);
    var htmlfolder = path.normalize(__dirname + '/../html_books/' + name);

    var core_folder = path.normalize(__dirname + '/../core_book_files');
    var template_folder = path.normalize(__dirname + '/../app_templates/storytimebook');

    var code = grab_code(name);

    if(!fs.existsSync(bookfolder)){
      throw new Error('folder missing: ' + dye.yellow(bookfolder));      
    }

    wrench.rmdirSyncRecursive(htmlfolder, true);
    wrench.copyDirSyncRecursive(core_folder, htmlfolder);
    wrench.copyDirSyncRecursive(template_folder, htmlfolder, {
      forceDelete:false
    });

    if(fs.existsSync(bookfolder + '/audio')){
      wrench.copyDirSyncRecursive(bookfolder + '/audio', htmlfolder + '/audio');
    }

    async.series([
      function(next){

        var data = new BookData(name, bookfolder);

        data.load(function(){
          var template = new BookTemplate(path.normalize(__dirname + '/../app_templates/storytimebook/index.ejs'), data.document);

          var html = template.render();
          fs.writeFileSync(htmlfolder + '/index.html', html, 'utf8');
          next();

        })

      },

      function(next){

        if(mode=='quick'){
          next();
          return;
        }

        var imageinput = bookfolder + '/images';
        var imageoutput = htmlfolder + '/images';
        wrench.mkdirSyncRecursive(htmlfolder + '/images');

        var processor = new ImageProcessor(imageinput, imageoutput, {
          width:1024,
          height:768
        })

        processor.process(next);
      }
    ], function(){
      console.log('-------------------------------------------');
      console.log('done');
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