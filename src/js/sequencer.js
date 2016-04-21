var Sequencer = ( function() {
	var settings = {
		keyboardKeys: {
			67: 0, // c
			86: 1, // v
			66: 2, // b
			78: 3, // n
			77: 4  // m
		},
		iskeyDown: false,
		samples: { 
			'808': {
				0: {
					src: 		'dist/samples/808/mp3/bass.mp3',
					velocity: 	1
				},
				1: {
					src: 		'dist/samples/808/mp3/clap.mp3',
					velocity: 	1
				},
				2: {
					src: 		'dist/samples/808/mp3/hi--hat.mp3',
					velocity: 	0.75
				},
				3: 	{
					src: 		'dist/samples/808/mp3/snare.mp3',
					velocity: 	1
				},
				4: {
					src: 		'dist/samples/808/mp3/tom.mp3',
					velocity: 	1
				}
			}
		},
		bpm:           108,
		division:      16,
		isPlaying:     false,
		isRecording:   true,
		isLoaded:      false,
		isMetronoming: false,
		sequence:      [],
		lastStep:      0,
		timeLastStep:  0,
		timeBetweenSteps: 0,
		analyserValue: 0
	}
	
	var init = function() {
		Debug.log( 'Sequencer.init()' );
		
		initSampler();
		initSignal();
		initPlayback();
		initMetronome();

		buildDemoSequence();

		startPlayback();								

		bindEventHandlers();
	}
	
	var bindEventHandlers = function() {
		Debug.log( 'Sequencer.bindEventHandlers()' );
		
		// all samples are loaded
		Tone.Buffer.on( 'load', function() {
			$( document ).trigger( 'sequencer/loaded' );
		} );     
		
		$( document )
			.on( 'sequencer/loaded', function() {
				Debug.log( 'All samples are loaded' );				
				settings.isLoaded = true;									
			} )	
			.on( 'keydown', function( event ) {
				event.preventDefault();

				if( !settings.isKeyDown ) {
					settings.isKeyDown = true;
					var key = event.which;

					// samples
					if( settings.keyboardKeys[key] !== undefined ) {
						playSample( settings.keyboardKeys[key] );

						if( settings.isRecording ) {
							addSequenceItem( settings.keyboardKeys[key] );
						}
					}

					// toggle playback
					// Space
					if( key === 32 ) {
						togglePlayback();
					}
					
					// toggle metronome
					// Shift
					if( key === 16 ) {
						toggleMetronome();
					}
					
					// clear sequence
					// X
					if( key === 88 ) {
						clearSequence();
					}				       
				}      
			
			} )
			.on( 'keyup', function( event ) {
				event.preventDefault();
				
				settings.isKeyDown = false;
			} )
			.on( 'ui/clickButton', function( event, data ) {

				if( data.sample !== undefined ) {
					var sample = data.sample;

					playSample( sample );

					if( settings.isRecording ) {
						addSequenceItem( sample );
					}
				}

				if( data.action ) {
					var action = data.action;

					if( action === 'play' ) {
						togglePlayback();
					}	

					if( action === 'clear' ) {
						clearSequence();
					}

					if( action === 'metronome' ) {
						toggleMetronome();
					}					
				}				
			} )
			.on( 'url/init', function( event, data ) {
				var hash = data.hash;
				if( hash ) {
					loadSequence( hash );
				} else {
					setTimeout( function() {
						buildDemoSequence();
					}, 0 );
				}
			} )			
			.on( 'sequencer/changeSequence', function() {
				saveSequence();
			} );
	}

	// Signal
	var initSignal = function() {
		settings.sampler
			.toMaster();
	}
	
	// Samples
	var initSampler = function() {
		Debug.log( 'Sequencer.initSampler()' );
				
		var samples = {
			'808': {}
		}

		for( var i = 0; i < Object.keys( settings.samples['808'] ).length; i++ ) {
			samples['808'][i] = settings.samples['808'][i].src;
		}

		settings.sampler = new Tone.Sampler(
			samples
		);   
	}
	
 
	var playSample = function( i, time ) {
		Debug.log( 'Sequencer.playSample()', i );

		if( settings.isLoaded ) {
			var velocity = settings.samples['808'][i].velocity;
			settings.sampler.triggerAttack( '808.' + i, time, velocity ); 
			
			$( document ).trigger( 'sequencer/playSample', [ {
				sample: i  
			} ] );
		}
	}
	
	
	// Playback
	var initPlayback = function() {
		Debug.log( 'Sequencer.initPlayback()' );
			 
		clearSequence();
				 
		Tone.Transport.bpm.value = settings.bpm;  
		
		// from http://tonejs.org/examples/stepSequencer.html
		// calls the callback every 16th note
		// sequence
		settings.events = [];
		for( var i = 0; i < settings.division; i++ ) {
			settings.events.push( i );
		}    
		
		settings.loop = new Tone.Sequence( function( time, note ) {
			
			// helpers 
			settings.timeBetweenSteps = time - settings.timeLastStep;
			settings.lastStep = note;
			settings.timeLastStep = time;
						
			// metronome
			if( settings.isMetronoming ) {
				if( note === 0 ) {
					playMetronome( true );
				}
				
				if( note === settings.division / 4 * 1 ) {
					playMetronome();
				}
				
				if( note === settings.division / 4 * 2 ) {
					playMetronome();
				}
				
				if( note === settings.division / 4 * 3 ) {
					playMetronome();
				}        
			} 
						
			for( var i = 0; i < Object.keys( settings.samples['808'] ).length; i++ ) {
				if( settings.sequence[i][note] === 1  ) {
					playSample( i );

					$( document ).trigger( 'sequencer/playStep', [ {
						note: note
					} ] );					
				}
				
				if( settings.sequence[i][note] === 2 ) {
					settings.sequence[i][note] = 1;
				}        
			}

			$( document ).trigger( 'sequencer/step', [ {
				note: note
			} ] );
			
		}, settings.events, settings.division + 'n' );

		Tone.Transport.start();    
	}
	
	var startPlayback = function() {
		Debug.log( 'Sequencer.startPlayback()' );
		
		settings.isPlaying = true;
		$( document ).trigger( 'sequencer/startPlayback' );
		
		settings.loop.start();
	}
	
	var stopPlayback = function() {
		Debug.log( 'Sequencer.stopPlayback()' );
		
		settings.isPlaying = false;
		$( document ).trigger( 'sequencer/stopPlayback' ); 
	 
		settings.loop.stop();
	}

	var togglePlayback = function() {
		if( settings.isPlaying ) {
			stopPlayback();
		} else {
			startPlayback();
		}		
	}
	
	var addSequenceItem = function( i, note ) {     
		Debug.log( 'Sequencer.addSequenceItem()', i, note );

		if( settings.isPlaying && settings.isRecording ) {
			if( !note ) {
				var note = Math.round( settings.division * settings.loop.progress );
				if( note >= settings.division ) {
					note = 0;
				}
			}

			Debug.log( 'note', note );
			 
			var pending = ( ( settings.division * settings.loop.progress ) < note ) ? true : false;
			
			if( !settings.sequence[i][note] ) {
				settings.sequence[i][note] = ( pending ) ? 2 : 1;

				$( document ).trigger( 'sequencer/changeSequence', [ {
					sequence: settings.sequence
				} ] );

				$( document ).trigger( 'sequencer/addSequenceItem', [ {
					note: 		note,
					sample: 	i,
					division: 	settings.division
				} ] ); 				
			}
		}
	}

	/*
	 * Save sequence in a custom notation format:
	 * Example: A0B12C34
	 * [A-Z] are the steps of the sequence followed by [0-9] for each note
	 */
	var saveSequence = function() {
		Debug.log( 'Sequencer.saveSequence()' );

		var data = '';

		// init array
		var data = [];
		for( var i = 0; i < settings.division; i++ ) {
			data.push( [] );
		}

		// fill array
		for( var i = 0; i < settings.sequence.length; i++ ) {
			for( var j = 0; j < settings.sequence[i].length; j++ ) {
				if( settings.sequence[i][j] ) {
					data[j].push( i );
				}
			}			
		}

		// create notation string
		var string = '';
		for( var i = 0; i < data.length; i++ ) {
			if( data[i].length > 0 ) {
				string += String.fromCharCode( i + 65 );
				string += data[i].join( '' );
			}
		}

		Debug.log( string );

		$( document ).trigger( 'sequencer/saveSequence', [{
			data: string
		}] );
	}

	var loadSequence = function( string ) {
		Debug.log( 'Sequencer.loadSequence()', string );

		// loop over every char of the string
		var data = [];
		var matches = string.match( /[A-Za-z][0-9]+/g );

		if( matches ) {
			for( var i = 0; i < matches.length; i++ ) {
				var match = matches[i];
				var note = match[0].charCodeAt( 0 ) - 65;

				var samples = match.substr( 1, match.length );
				if( samples.length > 0 ) {
					samples = samples.split( '' );

					for( var j = 0; j < samples.length; j++ ) {
						addSequenceItem( samples[j], note );
					}
				}
			}
		}
	}

	var clearSequence = function() {
		Debug.log( 'Sequencer.clearSequence()' );

		// init sequence 
		for( var i = 0; i < Object.keys( settings.samples['808'] ).length; i++ ) {
			var track = [];

			for( var j = 0; j < settings.division; j++ ) {
					track[j] = 0;
			}
			settings.sequence[i] = track; 
		}    

		$( document ).trigger( 'sequencer/clearSequence' );
		$( document ).trigger( 'sequencer/changeSequence' );
	}	

	var buildDemoSequence = function() {
		Debug.log( 'Sequencer.buildDemoSequence()' );
		
		settings.sequence[0][0] = 1;		

		$( document ).trigger( 'sequencer/addSequenceItem', [ {
			note: 		0,
			sample: 	0,
			division: 	settings.division
		} ] ); 				
	}	
	

	// Recording
	var startRecording = function() {
		Debug.log( 'Sequencer.startRecording()' );
		
		settings.isRecording = true;
		$( document ).trigger( 'sequencer/startRecording' ); 
		
	}
	
	var stopRecording = function() {
		Debug.log( 'Sequencer.stopRecording()' );
		
		settings.isRecording = false;
		$( document ).trigger( 'sequencer/stopRecording' ); 
	}  
	

	// Metronome 
	var initMetronome = function() {
		Debug.log( 'Sequencer.initMetronome()' );
			settings.metronome = new Tone.SimpleSynth().toMaster();
	}

	var toggleMetronome = function() {
		settings.isMetronoming = ( settings.isMetronoming ) ? false : true;

		$( document ).trigger( 'sequencer/toggleMetronome', [{
			state: settings.isMetronoming
		}] );		
	}

	var playMetronome = function( high ) {
		var note = ( high ) ? 'C5' : 'C4';

		settings.metronome.triggerAttackRelease( note, '16n', null, 0.75 );      
	}


	// Getter
	var getProgress = function() {
		if( settings.loop ) {
			return settings.loop.progress;
		} else {
			return false;
		}
	}

	var getSequence = function() {
		return settings.sequence;
	}	

	var getDivision = function() {
		return settings.division;
	}			
	
	return {
		init: function() { init(); },
		getProgress: function() { return getProgress() },
		getSequence: function() { return getSequence() },
		getDivision: function() { return getDivision() }
	}
} )();


$( document ).ready( function() {
	 Sequencer.init();
} );