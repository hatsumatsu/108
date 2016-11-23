/**
 * Timeline
 * the circular sequence timeline
 */
var Timeline = ( function() {

	var settings = {
		selector: {
			wrapper: '.timeline-wrapper'
		},
		notes: [],
		svg: {},
		svgLoaded: 0,
		isLoaded: false,
		zIndex: 0,
		zIndexStep: 100
	}

	var init = function() {
		//Debug.log( 'Timeline.init()' );

		bindEventHandlers();

		build();

		$( document ).trigger( 'timeline/init' );

		$( 'html' )
			.addClass( 'initiated--timeline' );
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'viewport/loop', function() {
				onLoop();
			} )
			.on( 'timeline/loaded', function() {
				settings.isLoaded = true;
				run();
			} )
			.on( 'sequencer/addSequenceItem', function( event, data ) {
				//Debug.log( data );
				// wait for all SVGs to load before adding notes
				var waiter = setInterval( function() {
					if( settings.isLoaded ) {
						clearInterval( waiter );
						addNote( data.step, data.sample, data.division, data.id );
					}
				}, 50 );
			} )
			.on( 'mousedown touchstart', settings.selector.wrapper + ' .step' , function( event ) {
				event.preventDefault();

				var sample = $( this );
				// crete note in step click
				// exclude if exist
				if( sample.attr('data-id') >= 0) {
					var id = parseInt($(this).attr('data-id'));
					removeNote(id);

					$( document ).trigger( 'timeline/clickRemove', [{
						id : id
					}] );
				}
				// add if don't exist
				else {
					var sample = parseInt( $( this ).attr( 'data-sample' ) );
					var step = parseInt( $( this ).attr( 'data-step' ) );

					$( document ).trigger( 'timeline/clickAdd', [{
						sample: sample,
						step: step
					}] );
				}
			} )
			.on( 'sequencer/playStep', function( event, data ) {
				playNote( data.sample, data.step );
			} )
			.on( 'sequencer/clearSequence', function( event, data ) {
				clearTimeline();
			} )
			.on( 'history/undo', function( event, data ) {
				if( data.id ) {
					removeNote( data.id );
				}
			} );
	}

	var onLoop = function() {
		run();
	}

	var build = function() {
		var sequencer = Sequencer.getDivision();
		var samples = Object.keys(Sequencer.getSamples()).length;

		// create runner
		$(settings.selector.wrapper).append('<div class="runner"></div>');

		// create sample rows
		for( var key = 0; key < samples; key++ ) {
			var sample = '<div class="sample" data-sample="' + key + '">';

			$(settings.selector.wrapper).append(sample);

			// create step columns
			for ( var i = 0; i < sequencer; i++ ) {
				var step = '<div class="step" data-sample="' + key + '" data-step="' + i + '"><div class="content">';

				$('.sample[data-sample=' + key + ']').append(step);
			}
		}

		// Loaded
		$( document ).trigger( 'timeline/loaded' );
	}

	var run = function() {
		var runner = $( settings.selector.wrapper + ' .runner' );
		var progress = Sequencer.getProgress() * 100;

		TweenLite.to(
			runner,
			0,
			{
				x: progress * 10 + "%",
				ease: Linear.easeNone
			}
		);
	}

	var addNote = function( step, sample, division, id ) {
		//Debug.log( 'Timeline.addNote()', step, sample, division, id );

		var layer = $('.timeline-wrapper .sample[data-sample="' + sample + '"] .step[data-step="' + step + '"]');
		var layerContent = $(layer).find('.content');

		// feedback
		//$(layerContent).prepend(sample + '/' + step);

		var note = {
			step: step,
			sample: sample,
			layer: layer,
			id: id
		}

		settings.notes.push( note );

		layer.attr( 'data-id', id );

		$(layerContent).addClass('added');

		setTimeout( function() {
			$(layerContent).removeClass('added');
		}, 138)

	}

	var removeNote = function( id ) {
		//Debug.log( 'Timeline.removeNote()', id );

		var layer = $('.timeline-wrapper .step[data-id="' + id + '"]');

		// remove feedback
		if( layer ) {

			layer
				.removeAttr('data-id')
				.find('.content').empty();
		}

		// remove entry in settings.notes
		for( var i = 0; i < settings.notes.length; i++ ) {
			if( settings.notes[i].id == id ) {
				settings.notes.splice( i, 1 );
			}
		}
	}

	var clearTimeline = function() {
		//Debug.log( 'Timeline.clearTimeline()' );

		settings.notes = [];

		$('.timeline-wrapper .step').removeAttr('data-id');
		$('.timeline-wrapper .step .content').empty()
	}

	var playNote = function( sample, step ) {
		//Debug.log( 'Sequencer.playNote()', step );

		for( var i = 0; i < settings.notes.length; i++ ) {
			if( settings.notes[i].step === step ) {

				var selector = settings.selector.wrapper + ' .step[data-sample="' + sample + '"][data-step="' + step + '"] .content';
				
				$(selector).addClass('active');

				setTimeout( function() {
					$(selector).removeClass('active');
				}, 138)

				new TimelineLite()
                    .fromTo(
                        selector,
                        0.5,
                        {
                            transformOrigin: '50% 50%',
                            scaleX: 1.5,
                            scaleY: 1.5,
                            strokeOpacity: 0.75,
                            ease: Elastic.easeOut.config( 1, 0.3 )
                        },
                        {
                            transformOrigin: '50% 50%',
                            scaleX: 1,
                            scaleY: 1,
                            strokeOpacity: 1,
                            ease: Elastic.easeOut.config( 1, 0.3 )
                        }
                    );
				
			}
		}
	}

	// State
	var isReady = function() {
		return ( settings.isLoaded ) ? true : false;
	}

	return {
		init:       function() { init(); },
		isReady:    function() { return isReady(); }
	}

} )();

$( document ).ready( function() {
	Timeline.init();
} );
