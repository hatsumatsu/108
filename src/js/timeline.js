var Timeline = ( function() {
	var settings = {
		selector: {
			wrapper: 		'.timeline-wrapper',
			timeline: 		'#timeline',
			placeholder: 	'#placeholder',
			note: 			'.timeline-note'
		},
		layer: {
			track: 			'timeline--track',
			runner: 		'timeline--runner'
		},
		layerNotes: {
			0: 'timeline--note-0',
			1: 'timeline--note-1',
			2: 'timeline--note-2',
			3: 'timeline--note-3',
			4: 'timeline--note-4'
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
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'viewport/loop', function() {
				onLoop();
			} )
			.on( 'viewport/resize/finish', function() {
				onResize();
			} )
			.on( 'timeline/loaded', function() {
				settings.isLoaded = true;
				resize();
				run();
			} )
			.on( 'sequencer/addSequenceItem', function( event, data ) {
				Debug.log( data );
				// wait for all SVGs to load before adding notes
				var waiter = setInterval( function() {
					if( settings.isLoaded ) {
						clearInterval( waiter );
						addNote( data.note, data.sample, data.division );
					}
				}, 50 ); 
			} )
			.on( 'sequencer/playStep', function( event, data ) {
				playNote( data.note );
			} )
			.on( 'sequencer/clearSequence', function( event, data ) {
				clearTimeline();
			} );						
	}

	var onResize = function() {
		resize();
	}

	var onLoop = function() {
		run();
	}

	var build = function() {
		// create blank SVG
		settings.svg.timeline = Snap( 512,512 )
			.attr( 'id', settings.selector.timeline.replace( '#', '' ) );	

		// create placeholder SVG
		settings.svg.placeholder = Snap( 512,512 )
			.attr( 'id', settings.selector.placeholder.replace( '#', '' ) );					

		// add layers
		for( var key in settings.layer ) {
			if( settings.layer.hasOwnProperty( key ) ) {
				addLayer( settings.layer[key], 'timeline' );						
			}
		}

		// add notes to placeholders
		for( var key in settings.layerNotes ) {
			if( settings.layerNotes.hasOwnProperty( key ) ) {
				addLayer( settings.layerNotes[key], 'placeholder' );						
			}
		}					
	}

	var addLayer = function( filename, target ) {
		settings.zIndex = settings.zIndex + settings.zIndexStep;
		var index =	settings.zIndex;

		Snap.load( 'dist/img/' + filename + '.svg', function ( svg ) {
	    	var group = svg.select( 'g' );

	    	// check whether to prepend or append
	    	var indexMax = 0;
	    	var groups = settings.svg[target].selectAll( 'g' );
	    	$.each( groups, function() {
	    		var g = $( this );
	    		var i = parseInt( g[0].attr( 'data-index' ) );
	    		indexMax = ( i > indexMax ) ? i : indexMax;
	    	} );

	    	// set index
	    	group
				.attr( {
					'data-index': index 
				} );

			// append or prepend depending on index
			if( index >= indexMax ) {
				group
					.appendTo( settings.svg[target] );	    	
			} else {
				group
					.prependTo( settings.svg[target] );					
			}

	    	// add svg to DOM, could be run only once...
			$( settings.selector[target] )	
				.appendTo( $( settings.selector.wrapper ) );

			// fire event when all SVGs are loaded
			settings.svgLoaded = settings.svgLoaded + 1;
			if( settings.svgLoaded === Object.keys( settings.layer ).length + Object.keys( settings.layerNotes ).length ) {
				$( document ).trigger( 'timeline/loaded' );
			}
		} );
	}

	var resize = function() {
		Debug.log( 'Timeline.resize()' );
		settings.size = $( settings.selector.wrapper ).width();
		settings.scaleFactor = settings.size / 512;

		// set size
		$( settings.selector.timeline + ', ' + settings.selector.placeholder )
			.css( {
				'transform': 'scale( ' + settings.scaleFactor + ', ' + settings.scaleFactor + ' )'
			} );	

		// set stroke width
		settings.svg.timeline
			.selectAll( 'path' )	
			.attr( {
				strokeWidth: 1 / settings.scaleFactor
			} );

		settings.svg.placeholder
			.selectAll( 'path' )	
			.attr( {
				strokeWidth: 1 / settings.scaleFactor
			} );			
	}

	var run = function() {
		var runner = $( '#' + settings.layer.runner );
		var progress = Sequencer.getProgress();
		var angle = 360 * progress;

		TweenLite.to( 
			runner,
			0, 
			{
				transformOrigin: '50% 50%',
				rotation: angle,
				ease: Linear.easeNone
			}
		);		
	}

	var addNote = function( note, sample, division ) {
		Debug.log( 'Timeline.addNote()', note, sample, division );

		var layer = settings.svg.placeholder.select( '.' + settings.layerNotes[sample] );
		if( layer ) {
			layer = layer.clone();

			var _note = {
				note: note,
				sample: sample,
				layer: layer
			}

			settings.notes.push( _note );

			var angle = note / division * 360;

			layer.prependTo( settings.svg.timeline );

			TweenLite.to( 
				layer.node,
				0, 
				{
					transformOrigin: '50% 50%',
					rotation: angle,
					ease: Linear.easeNone
				}
			);		

			// note specific animations
			switch( sample ) {
  				case 0:
  					animateLine( layer.select( '.shape' ), 0.5, 1 );
			    break;

  				case 1:
  					animateLine( layer.select( '.shape' ), 0.5, -1 );
			    break;	

  				case 2:
  					animateLine( layer.select( '.shape' ), 0.25, -1 );
			    break;		

  				case 3:
  					animateLine( layer.select( '.shape' ), 0.5, -1 );
			    break;	

  				case 4:

			    break;				    				    	    
			}
		}
	}

	var clearTimeline = function() {
		Debug.log( 'Timeline.clearTimeline()' );

		settings.notes = [];
		settings.svg.timeline
			.selectAll( '.timeline--note' )
			.remove();
	}

	var animateLine = function( path, duration, direction ) {
		if( path ) {
			var length = path.getTotalLength();

			$( path.node ).css( {
				'strokeDasharray': length,
				'strokeDashoffset': ( length * direction )
			} );

			TweenLite.to( 
				path.node,
				duration, 
				{
					strokeDashoffset: 0,
					ease: Power4.easeInOut
				}
			);				
		}
	}

	var playNote = function( note ) {
		Debug.log( 'Sequencer.playNote()', note );

		for( var i = 0; i < settings.notes.length; i++ ) {
			if( settings.notes[i].note === note ) {
				
				new TimelineLite()					
					.fromTo( 
						settings.notes[i].layer.select( '.shape' ).node,
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

	return {
		init: function() { init(); }
	}
} )();

$( document ).ready( function() {
	Timeline.init();
} );