storytimebuilds
===============

The build folder for storytime island books

## installation

First we need some things installed:

### node.js

[download & install](http://nodejs.org/) and install node.js

### ImageMagick

[download & install](http://www.imagemagick.org/script/binary-releases.php#windows)

### Android Development Tools

[download & install](http://developer.android.com/sdk/index.html)

### PhoneGap

[install instructions](http://phonegap.com/install/)

## usage

the folder layout of this repository is as shown:

 * android_template - the files used to create new android apps

 * bin - the script that builds everything

 * html_books - the books that are ready for looking at in a browser

 * lib - code used by the build script

 * node_modules - node.js modules

 * pageturner - the pageturner code built into a module for pages

 * raw_books - the raw format of book before we convert them to HTML

 * source - where we keep the source content for books

## making a book

### storytimeisland

#### flash file
First you need a flash file for the book - use freddy as reference.

Once you have a flash file - create a new folder for it to live in:

	source/storytimeisland/NEWBOOKNAME

Then create these folders inside:

 * src
 * images
 * sprites
 * data

Copy the flash file into the 'src' folder and call it 'artwork.fla'

So if our book is freddy and this repository is c:\work\storytimebuild - then we now have:

	c:\work\storytimebuild\source\storytimeisland\freddy\src\artwork.fla

#### building the flash file
Open flash - then File -> Open

Open the build.jsfl which lives:

	source/storytimeisland/build.jsfl

This will open a text file in flash - at the top of the text file you can see this code:

```js
var mainconfig = {

	// control which book to compile
	//
	// set this to all or * to compile all books
	book:'freddy',

	// export data about the document and text
	data:true,

	// export the images
	images:true,

	// export the sprites
	sprites:false
}

```

This controls what book is created - change the book:'freddy' to whatever the name of the folder our flash file is in.

There is a little run button - click it, the flash file should open and start compiling - don't worry nothing is getting deleted.

