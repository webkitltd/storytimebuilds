/*
	--------------------------------------------------------------------
	CONFIG START
	--------------------------------------------------------------------
	
*/

var exportbook = 'freddy';

/*
	--------------------------------------------------------------------
	CONFIG END
	--------------------------------------------------------------------
	
*/


/*

	this script loops over each frame in the root timeline and outputs an image for it
	
*/

var baseScriptURI = fl.scriptURI;
var baseFolderPathParts = fl.scriptURI.split('/');
var baseScriptName = baseFolderPathParts.pop();
var baseScriptFolder = baseFolderPathParts.join('/');

var dictionaryLayer = 1;
var textLayer = 2;
var imageLayer = 3;
var configLayer = 4;

function runbooks(){

	var books=FLfile.listFolder(baseScriptFolder,"directories");

	for(var i=0; i<books.length; i++){
		var book = books[i];

		if(book!='book_template' && (exportbook=='*' || exportbook=='all' || exportbook==book)){
			runbook(book);	
		}
	}
}

/*

	this does the setup for the PNG exporting
	
*/
function setup_publish_profile(doc, size){
	var profile = new XML(doc.exportPublishProfileString());

	profile.@name = 'Game';
	profile.PublishFormatProperties.png = 1;
	profile.PublishFormatProperties.flash = 0;
	profile.PublishFormatProperties.generator = 0;
	profile.PublishFormatProperties.projectorWin = 0;
	profile.PublishFormatProperties.projectorMac = 0;
	profile.PublishFormatProperties.html = 0;
	profile.PublishFormatProperties.gif = 0;
	profile.PublishFormatProperties.jpeg = 0;
	profile.PublishFormatProperties.qt = 0;
	profile.PublishFormatProperties.rnwk = 0;

	profile.PublishPNGProperties.@enabled = 'true';
	profile.PublishPNGProperties.Width = '' + size.width;
	profile.PublishPNGProperties.Height = '' + size.height;
	profile.PublishPNGProperties.Interlace = 0;
	profile.PublishPNGProperties.Transparent = 1;
	profile.PublishPNGProperties.Smooth = 1;
	profile.PublishPNGProperties.DitherSolids = 0;
	profile.PublishPNGProperties.RemoveGradients = 0;
	profile.PublishPNGProperties.MatchMovieDim = 0;
	profile.PublishPNGProperties.DitherOption = 'None';
	profile.PublishPNGProperties.FilterOption = 'None';
	profile.PublishPNGProperties.BitDepth = '24-bit with Alpha';
	
	doc.importPublishProfileString(profile);
}

function writeData(file, data){
	var string = "";

	for(var prop in data){
		string += prop + "=" + data[prop] + "\n";
	}

	FLfile.write(file, string);
}

function runbook(folder){



	/*

		work out where the script is and look for the images folder
		
	*/
	var bookFolder = baseScriptFolder + '/' + folder;
	var imageFolder = bookFolder + '/images';
	var spriteFolder = bookFolder + '/sprites';
	var dataFolder = bookFolder + '/data';

	var bookFLAPath = bookFolder + '/src/artwork.fla';
	var bookcopyFLAPath = bookFolder + '/src/artworkTEMP.fla';

	FLfile.copy(bookFLAPath, bookcopyFLAPath);

	var bookDocument = fl.openDocument(bookcopyFLAPath);
	var tl = bookDocument.getTimeline();
	var frameCount = tl.frameCount;

	// we bring the sizes down with ImageMagick - we want the big ones out of here
	var size = {
		height:1536
	};
	var ratio = bookDocument.width/bookDocument.height;
	size.width = size.height * ratio;	
	fl.trace('width: ' + size.width);
	fl.trace('height: ' + size.height);

	/*
	
		loop each frame in the movie, extract the text layer and write a data file to be parsed
		by the buildscript into JSON for the page
		
	*/
	function export_data(){

		FLfile.remove(dataFolder);
  	FLfile.createFolder(dataFolder);

  	writeData(dataFolder + '/document.data', {
			pages:frameCount,
			width:bookDocument.width,
			height:bookDocument.height
		})

	  for(var i=0; i<frameCount; i++){
	  	tl.currentFrame = i;

	  	var textelem = tl.layers[textLayer].frames[i].elements[0];
	  	var text = textelem.getTextString();

	  	/*
	  	
	  		the config script allows us to inject JSON into the page from within Flash
	  		
	  	*/
	  	var config_script = tl.layers[configLayer].frames[i].actionScript;
	  	config_script = config_script.replace(/[\r\n]/g, '');

	  	if(text=='null'){
	  		text = '';
	  	}
	  	
	  	var data = {
	  		x:textelem.x,
	  		y:textelem.y,
	  		width:textelem.width,
	  		height:textelem.height,
	  		size:textelem.getTextAttr('size'),
				alignment:textelem.getTextAttr('alignment'),
				face:textelem.getTextAttr('face'),
				characterPosition:textelem.getTextAttr('characterPosition'),
				lineSpacing:textelem.getTextAttr('lineSpacing'),
				rightMargin:textelem.getTextAttr('rightMargin'),
				leftMargin:textelem.getTextAttr('leftMargin'),
				letterSpacing:textelem.getTextAttr('letterSpacing'),
				extra_config:config_script
	  	};

	  	var dictionary_elems = tl.layers[dictionaryLayer].frames[i].elements;

	  	data.dictionary_length = dictionary_elems.length;

	  	FLfile.write(dataFolder + '/page' + (i+1) + '.txt', text);
	  	writeData(dataFolder + '/page' + (i+1) + '.data', data);

	  	for(var k=0; k<dictionary_elems.length; k++){
	  		var dictionary_elem = dictionary_elems[k];

	  		var dictionary_data = {
	  			name:dictionary_elem.name,
	  			x:dictionary_elem.x,
	  			y:dictionary_elem.y,
	  			width:dictionary_elem.width,
	  			height:dictionary_elem.height
	  		};

	  		writeData(dataFolder + '/page' + (i+1) + '.dictionary' + k + '.data', dictionary_data);
		
	  	}

	  }
	}

	function export_images(){
		FLfile.remove(imageFolder);
		FLfile.createFolder(imageFolder);

		tl.deleteLayer(dictionaryLayer);
		tl.deleteLayer(textLayer-1);
		tl.deleteLayer(configLayer-2);

		imageLayer -= 2;

	  // then export the images
	  for(var j=0; j<frameCount; j++){
	    tl.currentFrame = j;

	    var imageelem = tl.layers[imageLayer].frames[j].elements[0];
	    var imageFile = imageFolder + "/page" + (j + 1) + ".png";

	    fl.trace('---------------------------------------------------------')
	  	fl.trace('writing image: ' + (j+1));
	  	fl.trace('---------------------------------------------------------')
	  	fl.trace(imageFile);
	  	fl.trace('---------------------------------------------------------')
	    
	    bookDocument.exportPNG(imageFile, true , true);
	  }
	}

	setup_publish_profile(bookDocument, size);
	
	export_data();
	export_images();	
	
	bookDocument.close(false);
	FLfile.remove(bookcopyFLAPath);
}

runbooks();