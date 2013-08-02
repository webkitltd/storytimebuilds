/*

	Story Time Island Page Model

	keeps track of a single page and the data needed for it's audio, text and elements
	
*/

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var async = require('async');

module.exports = BookData;

function BookData(name, dirname){
	EventEmitter.call(this);

	if(!fs.existsSync(dirname)){
		throw new Error(dirname + ' does not exist');
	}

	this.name = name;
	this.dirname = dirname;
}

util.inherits(BookData, EventEmitter);

BookData.prototype.parsedata = function(st){
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

BookData.prototype.load = function(callback){
	var self = this;

	var document = {
		config:{},
		pages:[]
	}

	var pagemap = {};
	var dictionarymap = {};
	var filenames = fs.readdirSync(self.dirname + '/data');

	async.forEachSeries(filenames, function(filename, nextfile){

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
					var extraconfig = pageconfig.extra_config.replace(/;$/, '');
					pageconfig.extra_config = JSON.parse(extraconfig);
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

		_.extend(document.config, require(self.dirname + '/config.json'));

		self.document = document;
		self.document.id = self.name;

		callback();
		
	})

}