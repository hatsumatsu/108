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
		//Debug.log( 'Viewport.init()' );

		settings.element = $( window );

		onResizeFinish();

		onLoop();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'viewport/resize/finish', function() {
                onResizeFinish();
            } )
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

	var onResizeFinish = function() {
        //Debug.log( 'viewport.onResizeFinish()' );

        settings.width = settings.element.width();
        settings.height = settings.element.height();
        settings.documentHeight = $( 'html' ).outerHeight();

    }

    var getWidth = function() {
        return settings.width;
    }

    var getHeight = function() {
        return settings.height;
    }

	return {
		init: 		function() { init(); },
		getWidth:   function() { return getWidth() },
		getHeight:  function() { return getHeight() },
	}

} )();

$( document ).ready( function() {
	Viewport.init();
} );
