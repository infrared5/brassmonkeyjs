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

Building the docs
-------------
* (Requires Node.)[http://nodejs.org/#download]
* (Install YUIDoc)[http://yui.github.com/yuidoc/]
* Run './bin/build-docs.sh' (Mac/Linux only for now. I think we'll do cross platform eventually via using pure Node scripts.)


Also checkout the demos for some example code.

Running the demos locally
=============

* Get the SDK as mentioned above.
* Files must be hosted in order to work.
* On Mac/Linux you can just run './server' from the brassmonkeyjs folder and then open http://localhost:8080/
* If on Windows you'll have to put the brassmonkeyjs folder somewhere and then navigate to whereever index.html ends up.