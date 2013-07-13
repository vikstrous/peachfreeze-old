all:
	git submodule update --init
	cd lib/otrsocket.js
	git submodule update --init
	cd tracker/lib/otrsocket.js
	git submodule update --init
