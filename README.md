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

### create folders

Once you have installed - you must create some folders within this repository:

 * html_books
 * androids

## making a book
The books are created using the **buildscript** - this is a node.js command line script that knows how to move all the files around to create our books.

### overview of the process
There are multuple providers of book content - currently iboard and storytimeisland.

Having multiple providers means we can take on publishing projects for any number of people with exact specifications for their books (i.e. we can sell the publishing press as well as the books)

#### step 1 - preparation of the book
The book itself needs to be like, actually written and stuff.

The books source lives in /source/[provider].

Each provider has a **book_template** folder - these are the files and extra code for that specific book.

The other folders in each provider folder are the actual books content.

Storytimeisland books are in Flash (more on the format further down).

iboard books are in HTML (again, more later).

Once the book itself has been prepared we get into the world of the build script - this is roughly the same for each provider.

#### step 2 - convert the source book into HTML format
The scripts to convert a book into HTML format (on Mac \ = /)

**Storytimeisland:**

	node bin\book.js singlebook storytimeisland [bookname]
	node bin\book.js singlebook storytimeisland freddy

**iboard:**

	node bin\book.js singlebookiboard [bookname]
	node bin\book.js singlebook iboard monsters

#### step 3 - view the book
This step allows you to see the output of the HTML book in a browser.

	// view a storytimeisland book
	node bin\book.js serve storytimeisland\freddy

	// view an iboard book
	node bin\book.js serve iboard\monsters

You can then open a browser and type:

	http://localhost

To see the book working.

#### step 4 - create android application
This step allows you to create a new android application for the HTML book.

	// create a storytimeisland android
	node bin\book.js createandroid Freddy "Freddy The Fisherman" com.storytimeisland.freddy

	// create an iboard android
	node bin\book.js createandroid Monsters "Monsters" com.iboard.monsters

NOTE - the domain name part MUST have the book name on the end - it is the ID for the android app

#### step 5 - inject the HTML into the android application
This step can be repeated without repeating step 5 each time.

It adds our HTML book to the android application - if we change rebuild the HTML book we can skip step 5 meaning we will not replace the entire android just the content.

	// inject HTML into a storytimeisland app
	node bin\book.js android storytimeisland/freddy Freddy

	// inject HTML into an iboard app
	node bin\book.js android iboard/monsters Monsters

#### step 6 - building the .apk
This step must be done within Android Development Tools.

Open ADT (Android Development Tools).

	File -> Import

Choose - 'Android - Existing Android Code Into Workspace'

Browse - choose:

	/androids/[androidname]

So - for Freddy:

	/androids/freddy

It should pick up that there is a book application and allow you to open it.

Next step - right click on the project -> Run As -> Android Application.

This will build the .apk and run either an emulator or upload it to a connected device.

Either way - there is now an .apk inside the /bin folder of the android application - so for Freddy:

	/androids/freddy/bin/Freddy.apk

Now exists.

## storytimeisland books
This part describes the Flash format for StoryTimeIsland Books

### flash file
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

### building the flash file
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

It will output everything into images and data - once the flash has exported - we can copy the images and data folders into the source for the book.

### converting images

The storytimeisland books have images up to the edges and so we must make sure they are all resized OK.

You only need to run this once after each Flash export.

	// convert images for a storytimeisland book
	node bin\book.js storytimeisland_images freddy
