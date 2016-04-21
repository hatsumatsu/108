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
		lastTime: null,
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
		count();
	}

	var start = function() {
		Debug.log( 'Intro.start()' );

		settings.startTime = Date.now();
		settings.lastTime = Date.now();

		$( 'html' )
			.addClass( 'visible--intro' );

		$( document ).trigger( 'intro/start' );			
	}

	var stop = function() {
		Debug.log( 'Intro.stop()' );

		settings.isVisible = false;

		$( document ).trigger( 'intro/stop' );			

		setTimeout( function() {
			$( document )
				.one( 'transitionend', settings.selector.intro, function() {
					$( settings.selector.intro ).remove();
				} );

			$( 'html' )
				.removeClass( 'visible--intro' );
		}, 2000 );			
	}	

	var count = function() {
		settings.time = Date.now();

		if( settings.isVisible ) {
			if( settings.time - settings.lastTime >= settings.step ) {
				settings.lastTime = settings.time;
				settings.current = settings.current + 1;

				settings.element.title.text( settings.current );
			} 

			if( settings.current >= settings.steps ) {
				stop();
			}			
		}
	}

	return {
		init: function() { init(); }
	}
} )();


$( document ).ready( function() {
	Intro.init();
} );