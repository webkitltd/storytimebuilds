storytimebuilds
===============

The build folder for storytime island books

## code repositories
I've only checked in the core code in this repo - otherwise it would be massive.

This means that any books that you build will not be committed back into the code.

This is good - it means that we don't have 20MB files flying around github each time we rebuild.

There is another repository for the officially finished .apk and .html books - [storytimepublished](https://github.com/webkitltd/storytimepublished)

We will manually move the output (the .apks and .html sites) of this repository into published ONCE they have been tested and finialized.

Treat this repository as our factory and the published as the shop front.

## installation

First we need some things installed.

If you only want to build HTML books then you can skip Android Development Tools and PhoneGap

### node.js

[download & install](http://nodejs.org/) and install node.js

DONT FORGET TO DO npm install from within this folder to get modules installed

### ImageMagick

[download & install](http://www.imagemagick.org/script/binary-releases.php#windows)

### Android Development Tools

[download & install](http://developer.android.com/sdk/index.html)

### PhoneGap

[install instructions](http://phonegap.com/install/)


## flash file

	NOTE - this is done from within the DROPBOX folder

First you need to create a flash file for the book - use freddy as reference.

Ceate a new folder for the book Dropbox\books\PUBLISH\<bookname>

Then create these folders inside:

 * src
 * images
 * sprites
 * data

Copy the flash file into the 'src' folder and call it 'artwork.fla'

Here is the path to freddy on my system:

	C:\Users\kai\Dropbox\books\PUBLISH\freddy\src\artwork.fla


## building the flash file

Open flash - then File -> Open

Open the build.jsfl which lives:

	Dropbox\books\PUBLISH\source\build.jsfl

This will open a text file in flash - at the top of the text file you can see this code:

```js
var mainconfig = {

	// control which book to compile
	//
	// set this to all or * to compile all books

	book:'freddy', // < ---------------------------------- change this

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

It will output everything into images and data - once the flash has exported - we can copy the images and data folders into the source for the book.

## resizing the images

	NOTE - this is done from within the GITHUB folder (this repository)

Once the flash export has completed - it will have produced a folder called 'images'.

We then resize them ready for the website

The command to do this is:

	node bin\book.js images <infolder> <outfolder>

So - in my case - the Freddy Flash compilation created:

	C:\Users\kai\Dropbox\books\PUBLISH\source\freddy\images

Always output the images to 'resizedimages' - my command would be:

	node bin\book.js images C:\Users\kai\Dropbox\books\PUBLISH\source\freddy\images C:\Users\kai\Dropbox\books\PUBLISH\source\freddy\resizedimages

This will create the thumbnails and the resized images/

## building the HTML file

Now we turn the raw data into a HTML website.

The command to do this is:

	node bin\book.js publish <infolder> <outfolder>

My command for freddy:

	node bin\book.js publish C:\Users\kai\Dropbox\books\PUBLISH\source\freddy C:\Users\kai\Dropbox\books\PUBLISH\html\freddy

This has created a website for freddy - we can open index.html manually in Chrome or we can run the server:

	node bin\book.js serve <outfolder>

My command for freddy:

	node bin\book.js serve C:\Users\kai\Dropbox\books\PUBLISH\html\freddy

Once the server is running - you can visit:

	http://localhost

And the book should load

## creating an android app

The android app is just android files + website data.

You can copy an existing application as the starting point.

The files to changes values in:

 * build.xml
 * AndroidManifest.xml
 * .project
 * res/xml/config.xml
 * res/values/strings.xml'
 * res/layout/main.xml

Once the template is there - it is time to inject the HTML website into it.

node bin\book.js android C:\Users\kai\Dropbox\books\PUBLISH\html\freddy C:\Users\kai\Dropbox\books\PUBLISH\android\freddy