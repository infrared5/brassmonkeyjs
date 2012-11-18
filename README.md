Demos
=============

[Checkout the demos.](http://playbrassmonkey.com/developers/html5/index.html "Checkout the demos")


Installation
=============

Prerequisites
-------------
* An Android or iOS device.
* The Brass Monkey App. (Available on the [App Store](http://itunes.apple.com/us/app/brass-monkey/id455013514?ls=1&mt=8 "Brass Monkey on the App Store") or [Google Play](https://play.google.com/store/apps/details?id=com.brassmonkey.controller&hl=en "Brass Monkey on Google Play"))
* A modern browser.

Get the SDK (Includes demos)
-------------

[Download the .ZIP.](https://github.com/brassmonkey/brassmonkeyjs/zipball/master "Download the SDK .ZIP")
    
or,

    git clone git@github.com:brassmonkey/brassmonkeyjs.git
    git submodule init
    git submodule update
    (Put brassmonkeyjs folder some where on an http server and then open it's url ../brassmonkeyjs/index.html. Working on making it be able to be hosted without a server via file:// too.)

Documentation
=============

Read the (documents online)[http://playbrassmonkey.com/developers/html5/docs/] or locally by opening /docs/index.html

Build Requirements
=============
* Requires (Node)[http://nodejs.org/download/] (Tested at version 0.8.3).
* Requires (Grunt)[https://github.com/cowboy/grunt].

    sudo npm install -g grunt@0.2.13
    
* Requires (YUIDoc)[https://github.com/yui/yuidoc/].

    sudo npm install -g yuidocjs@0.3.19


Building the docs
-------------

Run Grunt task to generate the docs.

    grunt docs
    
Running the demos locally
-------------

Run server to host the examples and documentation.

    grunt server
        

*If on Windows you'll have to host the brassmonkeyjs folder somewhere and then navigate to whereever index.html ends up. (Because of security restrictions of browsers and flash our SDK can not be hosted on the file:/// protocol.)