/*

	Story Time Island Page Model

	keeps track of a single page and the data needed for it's audio, text and elements
	
*/

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var async = require('async');
var child_process = require('child_process');
var im = require('imagemagick');

module.exports = ImageProcessor;

function ImageProcessor(inputfolder, outputfolder, size){
	EventEmitter.call(this);

	if(!fs.existsSync(inputfolder)){
		throw new Error(inputfolder + ' does not exist');
	}

	this.size = size;
	this.inputfolder = inputfolder;
	this.outputfolder = outputfolder;
}

util.inherits(ImageProcessor, EventEmitter);

ImageProcessor.prototype.process = function(done){
	var self = this;

	var size = this.size;
	
	var files = fs.readdirSync(this.inputfolder);

	async.forEach(files, function(file, nextfile){
		if(!file.match(/\.(png|jpg)$/i)){
			nextfile();
			return;
		}

		var inpath = self.inputfolder + '/' + file;
		var outpath = self.outputfolder + '/' + file;

		async.series([
			function(nextstep){

				im.resize({
					srcPath:inpath,
					dstPath:outpath,
					quality:0.8,
					format:'png',
					height:size.height
				}, nextstep)
				
			},

			function(nextstep){

				im.crop({
					srcPath:inpath,
					dstPath:outpath,
					quality:0.8,
					format:'png',
					width:size.width,
					height:size.height
				}, nextstep)
				
			}
		], nextfile)

	}, done)
}
