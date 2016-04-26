/**
 * Debug
 * logging and stuff
 */
var Debug = ( function() {

	var settings = {
		isLocal: false,
		isActive: true,
		keyboardKeys: {
			toggle: 68 // D
		}
	}

	var init = function() {
		settings.isLocal = ( location.href.indexOf( 'local' ) > -1 ) ? true : false;
		settings.isActive = settings.isLocal;

		bindEventHandlers();
	}

	var bindEventHandlers = function() {
		window.addEventListener( 'keyup', function( event ) {
			if( event.keyCode === settings.keyboardKeys.toggle || event.which === settings.keyboardKeys.toggle ) {
				settings.isActive = !settings.isActive;	
				console.log( 'Toggle debug mode', settings.isActive );
			}
		} );
	}

	var log = function() {
		if( settings.isLocal || settings.isActive ) {
			console.log.apply( console, arguments );
		}
	}

	return {
		init: function() { init(); },
		log:  log 
	}
	
} )();

Debug.init();