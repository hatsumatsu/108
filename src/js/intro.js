/**
 * Intro
 * pseudo preloader
 */
var Intro = ( function() {

	var settings = {
		selector: {
			intro: '.intro',
			title: '.intro-title'
		},
		element: {},
		isVisible: true,
		duration: 2000,
		startTime: null,
		time: null,
		steps: 108,
		current: 0
	}

	var init = function() {
		Debug.log( 'Intro.init()' );

		settings.element.title = $( settings.selector.title );
		settings.step = settings.duration / settings.steps;

		bindEventHandlers();

		$( document ).trigger( 'intro/init' );

		start();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'viewport/loop', function() {
				onLoop();
			} );
	}

	var onLoop = function() {

	}

	var start = function() {
		Debug.log( 'Intro.start()' );

		settings.startTime = Date.now();

		settings.timer = setInterval( function() {
			if( settings.isVisible ) {
				if( settings.current < settings.steps ) {
					countUp();
				} else {
					stop();
				}
			}

		}, settings.step );


		$( 'html' )
			.addClass( 'visible--intro' );

		$( document ).trigger( 'intro/start' );
	}

	var stop = function() {
		Debug.log( 'Intro.stop()' );

		settings.isVisible = false;

		clearInterval( settings.timer );

		waitForReady( function() {
			$( document ).trigger( 'intro/stop' );

			setTimeout( function() {
				$( document )
					.one( 'transitionend', settings.selector.intro, function() {
						$( settings.selector.intro ).remove();
					} );

				$( 'html' )
					.removeClass( 'visible--intro' );
			}, 1000 );
		} );
	}

	var countUp = function() {
		settings.current = settings.current + 1;
		settings.element.title.text( settings.current );
	}

	var waitForReady = function( callback ) {
		if( Sequencer && Timeline ) {
			settings.waiter = setInterval( function() {
				Debug.log( 'waiting...' );

				if( Sequencer.isReady() && Timeline.isReady() ) {
					clearInterval( settings.waiter );
					callback();
				}
			}, 100 );
		}
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Intro.init();
} );
