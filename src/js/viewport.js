/**
 * Viewport
 * handy module to track viewport events and properties
 */
var Viewport = ( function() {

	var settings = {
		width: 0,
		height: 0,
		documentHeight: 0,
		nowLoop: Date.now(),
		fps: ( 1000 / 60 ),

	};

	var init = function() {
		//Debug.log( 'viewport.init()' );

		onLoop();
	}

	/**
	* requestAnimationFrame loop throttled at 60fps
	*/
	var onLoop = function() {
		requestAnimationFrame( onLoop );

		var now = Date.now();
		var elapsed = now - settings.nowLoop;

		// the actual 'loop'
		if( elapsed > settings.fps ) {
			settings.nowLoop = now - ( elapsed % settings.fps );

			$( document ).trigger( 'viewport/loop', [{ now: now }] );

			// scrollTop
			if( settings.scrollDetectionMode == 'requestAnimationFrame' ) {
				settings._scrollTop = settings.scrollTop;
				settings.scrollTop = settings.element.scrollTop();

				if( settings.scrollTop != settings._scrollTop ) {
					$( document ).trigger( 'viewport/scroll' );
				}
			}
		}
	}

	return {
		init: function() { init(); },
	}

} )();

$( document ).ready( function() {
	Viewport.init();
} );
