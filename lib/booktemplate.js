/*

	Story Time Island Page Model

	keeps track of a single page and the data needed for it's audio, text and elements
	
*/

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var ejs = require('ejs');


module.exports = BookTemplate;

function BookTemplate(path, vars){
	this.filename = path;//__dirname + '/../templates/' + name + '.ejs';
	this.vars = vars;
}

BookTemplate.prototype.render = function(done){
	var text = fs.readFileSync(this.filename, 'utf8');
	return ejs.render(text, this.vars);
}
