/**
 * Timeline
 * the circular sequence timeline
 */
var Timeline = ( function() {

	var settings = {
		selector: {
			wrapper:        '.timeline-wrapper',
			timeline:       '#timeline',
			placeholder:    '#placeholder',
			note:           '.timeline-note'
		},
		layerNotes: {
			0: 'timeline--note-0',
			1: 'timeline--note-1',
			2: 'timeline--note-2',
			3: 'timeline--note-3',
			4: 'timeline--note-4',
			5: 'timeline--note-5'
		},
		notes: [],
		svg: {},
		svgLoaded: 0,
		isLoaded: false,
		zIndex: 0,
		zIndexStep: 100
	}

	var init = function() {
		Debug.log( 'Timeline.init()' );

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
				Debug.log( data );
				// wait for all SVGs to load before adding notes
				var waiter = setInterval( function() {
					if( settings.isLoaded ) {
						clearInterval( waiter );
						addNote( data.step, data.sample, data.division, data.id );
					}
				}, 50 );
			} )
			.on( 'sequencer/playStep', function( event, data ) {
				playNote( data.step );
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
		var samples = Sequencer.getSamples();

		// create runner
		$(settings.selector.wrapper).append('<span class="runner"></span>');

		// create sample rows
		for( var key in samples ) {
			var sample = '<span class="sample" data-sample="' + key + '">';

			$(settings.selector.wrapper).append(sample);

			// create step columns
			for ( var i = 0; i < sequencer; i++ ) {
				var step = '<span class="step" data-step="' + i + '"><span class="content">';

				$('.sample[data-sample='+key+']').append(step);
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
				x: progress + "%",
				ease: Linear.easeNone
			}
		);
	}

	var addNote = function( step, sample, division, id ) {
		Debug.log( 'Timeline.addNote()', step, sample, division, id );

		var layer = $('.timeline-wrapper .sample[data-sample="' + sample + '"] .step[data-step="' + step + '"] .content');

		$(layer).prepend(sample + '/' + step);

		var note = {
			step: step,
			sample: sample,
			layer: layer,
			id: id
		}

		settings.notes.push( note );

		layer.attr( 'data-id', id );

		TweenLite.fromTo(
			layer,
			0.5,
			{
				transformOrigin: '50% 50%',
				y: 25,
				scaleY: 0,
				strokeOpacity: 0.75,
				ease: Elastic.easeOut.config( 1, 0.3 )
			},
			{
				transformOrigin: '50% 50%',
				y: 0,
				scaleY: 1,
				strokeOpacity: 1,
				ease: Elastic.easeOut.config( 1, 0.3 )
			}
		);

	}

	var removeNote = function( id ) {
		Debug.log( 'Timeline.removeNote()', id );

		var layer = $('.timeline-wrapper .content[data-id="' + id + '"]');

		// remove feedback
		if( layer ) {
			layer.remove();
		}

		// remove entry in settings.notes
		for( var i = 0; i < settings.notes.length; i++ ) {
			if( settings.notes[i].id == id ) {
				settings.notes.splice( i, 1 );
			}
		}
	}

	var clearTimeline = function() {
		Debug.log( 'Timeline.clearTimeline()' );

		settings.notes = [];

		$('.timeline-wrapper .step .content').empty()
	}

	var playNote = function( step ) {
		Debug.log( 'Sequencer.playNote()', step );

		for( var i = 0; i < settings.notes.length; i++ ) {
			if( settings.notes[i].step === step ) {

				new TimelineLite()
					.fromTo(
						$( settings.selector.wrapper + ' .step[data-step="' + step + '"] .content' ),
						0.5,
						{
							transformOrigin: '50% 50%',
							y: 25,
							scaleY: 0,
							strokeOpacity: 0.75,
							ease: Elastic.easeOut.config( 1, 0.3 )
						},
						{
							transformOrigin: '50% 50%',
							y: 0,
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
