/*

	Story Time Island Page Model

	keeps track of a single page and the data needed for it's audio, text and elements
	
*/

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var async = require('async');
var eyes = require('eyes');
var wrench = require('wrench');
var dye = require('dye');
var log = require('logule').init(module, 'storytimeisland book builder');
var ejs = require('ejs');
var exec = require('child_process').exec;

var compilesizes = [/*'2000', '1024',*/'100'];
var backgroundsizes = ['512', '1024', '1680', '2048'];
var iconsizes = ['96', '72', '48', '36', '512'];
var iconfiles = ['icon', 'iconplain'];
var teddysizes = ['50%', '25%'];

module.exports = BookBuilder;

function BookBuilder(name, dirname){
	EventEmitter.call(this);

	if(!fs.existsSync(dirname)){
		throw new Error(dirname + ' does not exist');
	}

	this.name = name;
	this.dirname = dirname;
	this.log = require('logule').init(module, 'Book: ' + name);
}

BookBuilder.prototype.__proto__ = EventEmitter.prototype;

BookBuilder.prototype.build = function(callback){
	var self = this;
	async.series([
		function(next){
			self.load(next);
		},

		function(next){
			self.export(next);
		}
	], callback);
}

BookBuilder.prototype.buildandroid = function(callback){
	var self = this;
	async.series([
		function(next){
			self.load(next);
		},

		function(next){
			self.exportandroid(next);
		}
	], callback);
}


BookBuilder.prototype.buildhtml = function(callback){
	var self = this;

	async.series([
		function(next){
			self.load(next);
		},

		function(next){
			self.exporthtml(next);
		}
	], callback);
}

BookBuilder.prototype.parsedata = function(st){
	st = st.replace(/var page = /, '');
	var parts = st.split("\n");
	var obj = {};
	_.each(parts, function(part){
		if(part.match(/=/)){
			var lineparts = part.split("=");	
			obj[lineparts[0]] = lineparts[1];
		}
	})
	return obj;
}

BookBuilder.prototype.resize_icon = function(size, folder, file, callback){

	var inpath = folder + file;
	var outpath = folder + file.replace(/\.png$/, '.' + size + '.png').replace(/\%/g, '');

	var command = "convert " + inpath + " -resize " + size + " " + outpath;

	console.log('-------------------------------------------');
	console.dir(command);

	child = exec(command);
	setTimeout(callback, 1);
}


BookBuilder.prototype.resize_image = function(size, folder, file, format, callback){

	if(file.match(/wood\.png/)){
		format = 'jpg';
	}
	var inpath = folder + file;
	var outpath = folder + size + '/' + file.replace(/\.png$/, '.' + format);
	//var outpath = folder + size + '/' + file;

	var command = "convert " + inpath + " -resize " + size + " -quality 80 " + outpath;

	console.log('-------------------------------------------');
	console.dir(command);

	child = exec(command);
	setTimeout(callback, 1);
}

BookBuilder.prototype.exportandroid = function(callback){
	var self = this;
	this.log.info('Save data');

	var sourceappdir = self.dirname + '/../../application'
	var sourceimagedir = self.dirname + '/images';
	var sourceaudiodir = self.dirname + '/audio';
	var sourceicondir = self.dirname + '/icons';
	//var sourcespritedir = self.dirname + '/sprites';
	
	var builddir = self.dirname + '/build';
	var androiddir = self.dirname + '/android/assets';
	var bookdir = builddir + '/www';

	var androidassets = androiddir + '/www';

	var htmltemplate = fs.readFileSync(sourceappdir + '/www/index.html', 'utf8');
	var storytemplate = fs.readFileSync(sourceappdir + '/story.txt', 'utf8');
	var configtemplate = fs.readFileSync(sourceappdir + '/www/config.xml', 'utf8');

	if(fs.existsSync(androiddir)){
		this.log.info('Clearing folder: ' + dye.yellow(androidassets));
		wrench.rmdirSyncRecursive(androidassets, true);
		wrench.mkdirSyncRecursive(androidassets);
	}

	async.series([
		function(next){

			if(fs.existsSync(androiddir)){
				self.log.info('Copy Android folder: ' + dye.yellow(androidassets));
				wrench.copyDirSyncRecursive(bookdir, androidassets);
			}
			next();
		},

		function(next){

			if(fs.existsSync(androiddir)){

				self.document.config.android = true;

				self.log.info('Output Android Page HTML: ' + dye.yellow(androidassets + '/index.html'));

				var pagehtml = ejs.render(htmltemplate, {
					bookjson:JSON.stringify(self.document, null, 4),
					book:self.document
				})

				fs.writeFileSync(androidassets + '/index.html', pagehtml, 'utf8');

			}

			next();
		}
	], callback);
}

BookBuilder.prototype.export = function(callback){
	var self = this;
	this.log.info('Save data');

	var sourceappdir = self.dirname + '/../../application'
	var sourceimagedir = self.dirname + '/images';
	var sourceaudiodir = self.dirname + '/audio';
	var sourceicondir = self.dirname + '/icons';
	//var sourcespritedir = self.dirname + '/sprites';
	
	var builddir = self.dirname + '/build';
	var androiddir = self.dirname + '/android/assets';
	var bookdir = builddir + '/www';

	var androidassets = androiddir + '/www';

/*
	if(!fs.existsSync(androiddir)){
		console.log('-------------------------------------------');
		console.log('ERROR - the android project for this book needs to be created');
		console.dir(androiddir);
		console.log('-------------------------------------------');
		console.log('cd "{ANDROIDROOT}\\bin\\phonegap\\bin"');
		console.log('create "{{PROJECTROOT}}\\books\\freddy\\android" com.storytimeisland.freddy FreddyTheFisherman');
		process.exit();
	}
*/

	this.log.info('Clearing folder: ' + dye.yellow(builddir));
	wrench.rmdirSyncRecursive(builddir, true);
	wrench.mkdirSyncRecursive(builddir);


	this.log.info('Copy Application folder: ' + dye.yellow(sourceappdir));
	wrench.copyDirSyncRecursive(sourceappdir, builddir);

	this.log.info('Create book dir: ' + dye.yellow(bookdir));
	wrench.mkdirSyncRecursive(bookdir);

	this.log.info('Write book config: ' + dye.yellow(bookdir + '/book.json'));
	fs.writeFileSync(bookdir + '/book.json', JSON.stringify(self.document, null, 4), 'utf8');

	this.log.info('Copy Book Images: ' + dye.yellow(sourceimagedir));
	wrench.copyDirSyncRecursive(sourceimagedir, bookdir + '/images');

	this.log.info('Copy Book Audio: ' + dye.yellow(sourceimagedir));
	wrench.copyDirSyncRecursive(sourceaudiodir, bookdir + '/audio');

	//this.log.info('Copy Book Sprites: ' + dye.yellow(sourcespritedir));
	//wrench.copyDirSyncRecursive(sourcespritedir, bookdir + '/sprites');

	var htmltemplate = fs.readFileSync(sourceappdir + '/www/index.html', 'utf8');
	var storytemplate = fs.readFileSync(sourceappdir + '/story.txt', 'utf8');
	var configtemplate = fs.readFileSync(sourceappdir + '/www/config.xml', 'utf8');

	async.series([
		
		function(next){

			self.log.info('Writing Text: ' + dye.yellow(builddir + '/story.txt'));

			var storytext = ejs.render(storytemplate, {
				book:self.document
			})

			fs.writeFileSync(builddir + '/story.txt', storytext, 'utf8');

			next();
		},


		function(next){

			self.log.info('Output Page HTML: ' + dye.yellow(bookdir + '/index.html'));
			var pagehtml = ejs.render(htmltemplate, {
				bookjson:JSON.stringify(self.document, null, 4),
				book:self.document
			})

			fs.writeFileSync(bookdir + '/index.html', pagehtml, 'utf8');


			next();
		},

		function(next){

			self.log.info('Output Config HTML: ' + dye.yellow(bookdir + '/config.xml'));
			var configxml = ejs.render(configtemplate, {
				book:self.document
			})

			fs.writeFileSync(bookdir + '/config.xml', configxml, 'utf8');

			next();
		},


		function(next){
			self.log.info('Copy out icons');

			wrench.copyDirSyncRecursive(sourceicondir, bookdir + '/icons/');

			async.forEachSeries(iconsizes, function(size, nextsize){
				async.forEachSeries(iconfiles, function(iconfile, nextfile){
					self.resize_icon(size, bookdir + '/icons/', iconfile + '.png', nextfile);	
				}, nextsize)
			},next)
		},

		function(next){
			self.log.info('Create Image Folders');

			async.forEachSeries(compilesizes, function(size, nextsize){
				wrench.mkdirSyncRecursive(bookdir + '/images/' + size);
				wrench.mkdirSyncRecursive(bookdir + '/img/resized/' + size);
				nextsize();
			},next);
		},

		function(next){
			self.log.info('Create Image Folders');

			async.forEachSeries(backgroundsizes, function(size, nextsize){
				wrench.mkdirSyncRecursive(bookdir + '/images/' + size);
				wrench.mkdirSyncRecursive(bookdir + '/img/resized/' + size);
				nextsize();
			},next);
		},		

		function(next){
			self.log.info('Create Resized Images');


			fs.readdir(bookdir + '/img/resized', function(error, files){

				async.forEachSeries(files, function(file, nextfile){

					if(!file.match(/\.\w+$/)){
						nextfile();
						return;
					}
					
					async.forEachSeries(backgroundsizes, function(size, nextsize){

						self.resize_image(size, bookdir + '/img/resized/', file, 'png', nextsize);

					}, nextfile)

				}, next)
				
			})
		},

		function(next){
			next();
			return;
			self.log.info('Create Teddy Images');

			fs.readdir(bookdir + '/img/teddy', function(error, files){

				async.forEachSeries(files, function(file, nextfile){

					if(!file.match(/\.\w+$/)){
						nextfile();
						return;
					}
					
					async.forEachSeries(teddysizes, function(size, nextsize){

						self.resize_icon(size, bookdir + '/img/teddy/', file, nextsize);

					}, nextfile)

				}, next)
				
			})
		},

		function(next){

			self.log.info('Copy and resize page images');

			fs.readdir(bookdir + '/images', function(error, files){

				var all = [];
				_.each(files, function(file){
					var filepath = file;

					if(!file.match(/\.png$/)){
						return;
					}

					_.each(compilesizes, function(size){
						all.push({
							format:(size==='100' || filepath=='page1.png' || filepath=='page21.png') ? 'png' : 'jpg',
							size:size,
							dir:bookdir + '/images/',
							path:filepath
						})
					})
				})

				async.forEachSeries(all, function(file, nextfile){

					self.log.info('Resize: ' + dye.yellow(file.path + '@' + file.size));
					self.resize_image(file.size, file.dir, file.path, file.format, nextfile);

				}, function(){
					async.forEachSeries(files, function(file, nextfile){
						fs.unlink(bookdir + '/images/' + file, nextfile);
					}, next)
				})
				
			})
		}

		

	], callback)
	
}


BookBuilder.prototype.exporthtml = function(callback){
	var self = this;
	this.log.info('Save data');

	var sourceappdir = self.dirname + '/../../application'	
	var builddir = self.dirname + '/build';
	var androiddir = self.dirname + '/android/assets';
	var bookdir = builddir + '/www';
	var androidassets = androiddir + '/www';

	
	this.log.info('Clearing folders: ' + dye.yellow(builddir));
	wrench.rmdirSyncRecursive(bookdir + '/js', true);
	wrench.rmdirSyncRecursive(bookdir + '/view', true);
	wrench.rmdirSyncRecursive(bookdir + '/css', true);

	if(fs.existsSync(androiddir)){
		wrench.rmdirSyncRecursive(androidassets + '/js', true);
		wrench.rmdirSyncRecursive(androidassets + '/view', true);
		wrench.rmdirSyncRecursive(androidassets + '/css', true);
	}
	
	this.log.info('Copy folders: ' + dye.yellow(sourceappdir));
	wrench.copyDirSyncRecursive(sourceappdir + '/www/js', bookdir + '/js');
	wrench.copyDirSyncRecursive(sourceappdir + '/www/view', bookdir + '/view');
	wrench.copyDirSyncRecursive(sourceappdir + '/www/css', bookdir + '/css');

	if(fs.existsSync(androiddir)){
		wrench.copyDirSyncRecursive(sourceappdir + '/www/js', androidassets + '/js');
		wrench.copyDirSyncRecursive(sourceappdir + '/www/view', androidassets + '/view');
		wrench.copyDirSyncRecursive(sourceappdir + '/www/css', androidassets + '/css');
	}

	//this.log.info('Copy Book Sprites: ' + dye.yellow(sourcespritedir));
	//wrench.copyDirSyncRecursive(sourcespritedir, bookdir + '/sprites');

	var htmltemplate = fs.readFileSync(sourceappdir + '/www/index.html', 'utf8');
	var configtemplate = fs.readFileSync(sourceappdir + '/www/config.xml', 'utf8');

	async.series([

		
			

		function(next){
			var filelist = [
				bookdir + '/index.html',
				bookdir + '/config.xml'
			]

			if(fs.existsSync(androiddir)){
				filelist = filelist.concat([
					androidassets + '/index.html',
					androidassets + '/config.xml'
				])
			}
			async.forEachSeries(filelist, function(filepath, nextfilepath){
				fs.unlink(filepath, function(){
					nextfilepath()
				})
			}, next)
		},

		function(next){

			self.log.info('Output Page HTML: ' + dye.yellow(bookdir + '/index.html'));
			var pagehtml = ejs.render(htmltemplate, {
				bookjson:JSON.stringify(self.document, null, 4),
				book:self.document
			})

			self.log.info('Output Android Page HTML: ' + dye.yellow(androidassets + '/index.html'));

			fs.writeFileSync(bookdir + '/index.html', pagehtml, 'utf8');

			if(fs.existsSync(androiddir)){
				var androiddoc = JSON.parse(JSON.stringify(self.document));
				androiddoc.config.android = true;

				var androidpagehtml = ejs.render(htmltemplate, {
					bookjson:JSON.stringify(androiddoc, null, 4),
					book:self.document
				})
				fs.writeFileSync(androidassets + '/index.html', androidpagehtml, 'utf8');
			}

			next();
		},

		function(next){

			self.log.info('Output Config HTML: ' + dye.yellow(bookdir + '/config.xml'));
			var configxml = ejs.render(configtemplate, {
				book:self.document
			})

			fs.writeFileSync(bookdir + '/config.xml', configxml, 'utf8');

			if(fs.existsSync(androiddir)){
				fs.writeFileSync(androidassets + '/config.xml', configxml, 'utf8');
			}

			next();
		}


	], callback)
	
}

BookBuilder.prototype.parsedata = function(st){
	st = st.replace(/var page = /, '');
	var parts = st.split("\n");
	var obj = {};
	_.each(parts, function(part){
		if(part.match(/=/)){
			var lineparts = part.split("=");	
			obj[lineparts[0]] = lineparts[1];
		}
	})
	return obj;
}

BookBuilder.prototype.load = function(callback){
	var self = this;
	this.log.info('Load data');

	var document = {
		config:{},
		pages:[]
	}

	var pagemap = {};
	var dictionarymap = {};
	var filenames = fs.readdirSync(self.dirname + '/data');

	log.info('Loading: ' + self.dirname);

	async.forEachSeries(filenames, function(filename, nextfile){

		log.info('Reading: ' + filename);

		if(filename=='document.data'){
			fs.readFile(self.dirname + '/data/' + filename, 'utf8', function(error, data){
				document.config = self.parsedata(data);
				_.each(['width', 'height', 'pages'], function(field){
					document.config[field] = parseInt(document.config[field]);
				})
				nextfile();
			})
		}
		else if(filename.match(/\.dictionary/)){
			var parts = filename.split('.');
			var pagenumber = parts[0].substr(4);

			if(!dictionarymap[pagenumber]){
				dictionarymap[pagenumber] = [];
			}

			fs.readFile(self.dirname + '/data/' + filename, 'utf8', function(error, data){
				
				var dictionary_entry = self.parsedata(data);

				dictionarymap[pagenumber].push(dictionary_entry);

				nextfile();

			})

		}
		else if(filename.match(/^page/)){
			var parts = filename.split('.');
			var pagenumber = parts[0].substr(4);
			var ext = parts[1];

			if(!pagemap[pagenumber]){
				pagemap[pagenumber] = {};
			}

			fs.readFile(self.dirname + '/data/' + filename, 'utf8', function(error, data){
				if(ext=='data'){
					var pageconfig = self.parsedata(data);
					pageconfig.extra_config = JSON.parse(pageconfig.extra_config.replace(/;$/, ''));
					_.extend(pagemap[pagenumber], pageconfig);
				}
				else if(ext=='txt'){
					_.extend(pagemap[pagenumber], {
						text:data.replace(/\r/g, " \n"),
						number:pagenumber
					})
				}
				nextfile();
			})
		}
		else{
			nextfile();
		}
	}, function(){

		for(var i=1; i<=document.config.pages; i++){
			var page = pagemap[i];
			page.dictionary = dictionarymap[i];

			document.pages.push(page);
		}

		_.extend(document.config, require(self.dirname + '/src/config.json'));

		self.document = document;

		callback();
		
	})

}