var Interface = ( function() {
	var settings = {
		elements: {},
		angle: 0,

		colors: {
			notes: {
				0: '#3300C1',
				1: '#3F00D2',
				2: '#570FE5',
				3: '#7C40ED',
				4: '#A179E9'
			}
		},
		sizes: {
			notes: {
				0: 25,
				1: 20,
				2: 15,
				3: 10,
				4: 5
			}
		},
		sequence: null,
		notes: []
	}

	var two = undefined;

	var init = function() {
		console.log( 'Interface.init()' );		

		setup();
		bindEventHandlers();
		draw();	
	}

	var bindEventHandlers = function() {
		two.bind( 'update', function( frameCount ) {
			draw();			
		} );

		$( document )
			.on( 'sequencer/addSequenceItem', function( event, data ) {  
				console.log( 'data.note: ' + data.note );
				if( !settings.notes.hasOwnProperty( data.note ) ) {
					console.log( '-------- clear array' );
					settings.notes[data.note] = [];
				}

				if( settings.notes[data.note].indexOf( data.sample ) < 0 ) {
					settings.notes[data.note].push( data.sample );
				}

				console.log( 'settings.notes', settings.notes ); 
			} );
	}

	var setup = function() {
		console.log( 'Interface.setup()' );		

        two = new Two( {
         	type: 		Two.Types['canvas'],
         	fullscreen: true
        } );

        two
        	.appendTo( $( 'body' )[0] )
        	.play();
	}	

	var draw = function() {
		two.clear();

		drawTrack();
		drawRunner();
		drawNotes();
	}

	var drawTrack = function() {
		settings.radius = Math.min( two.width, two.height );

		settings.elements.track = two.makeCircle(
			0, 
			0, 
			( settings.radius / 3 )
		);

		settings.elements.track.stroke = '#000';
		settings.elements.track.linewidth = 1;
	}

	var drawRunner = function() {
		var progress = Sequencer.getProgress();
        var position = settings.elements.track.getPointAt( 0.99 );
       	
       	console.log( settings.elements.track );


		settings.elements.runner = two.makeCircle( settings.radius / 3 , 0, 25 );

		var placeholder = two.makeCircle( 0, 0, settings.radius / 3 + 25 );
		placeholder.noStroke();
		placeholder.noFill();

		var group = two.makeGroup( settings.elements.track, settings.elements.runner, placeholder );
		group.translation.set(two.width / 2, two.height / 2);
		group.rotation = 2 * Math.PI * progress;

		settings.elements.runner.noStroke();
        settings.elements.runner.fill = '#f00';
	}

	var drawNotes = function() {
		if( settings.notes ) {
			for( var index in settings.notes ) {
  				if( settings.notes.hasOwnProperty( index ) ) {
					var position = settings.elements.track.getPointAt( index / 16 );  
					if( position ) {	
						for( var i = 0; i < settings.notes[index].length; i++ ) { 		
							var note = two.makeCircle( position.x + two.width / 2, position.y + two.height / 2, settings.sizes.notes[settings.notes[index][i]] );
						
							note.noStroke();
							note.fill = settings.colors.notes[settings.notes[index][i]];
						}		
					}
  				}
  			}
		}
	}	

	return {
		init: function() { init(); }
	}
} )();


$( document ).ready( function() {
	Interface.init();
} );