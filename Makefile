all:
	git submodule update --init
	cd lib/otrsocket.js
	git pull origin master
	git submodule update --init
	cd tracker/lib/otrsocket.js
	git pull origin master
	git submodule update --init
