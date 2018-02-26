/**
 * Sequencer
 * the actual sound module
 */
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
        isShiftDown: false,
        samples: {
            '808': {
                0: {
                    src:    'dist/samples/808/mp3/kick--21.mp3',
                    gain:   0.9
                },
                1: {
                    src:    'dist/samples/808/mp3/clap.mp3',
                    gain:   0.95
                },
                2: {
                    src:    'dist/samples/808/mp3/hi-hat--10.mp3',
                    gain:   0.75
                },
                3:  {
                    src:    'dist/samples/808/mp3/snare.mp3',
                    gain:   0.95
                },
                4: {
                    src:    'dist/samples/808/mp3/tom--8.mp3',
                    gain:   0.95
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

    var selector = {
        buttonStart: '[data-sequencer-role="buttonStart"]'
    }

    var init = function() {
        Debug.log( 'Sequencer.init()' );

        bindEventHandlers();

        initContext();
        initSampler();
        initSignal();
        initPlayback();
        initMetronome();

        startPlayback();
    }

    var bindEventHandlers = function() {
        Debug.log( 'Sequencer.bindEventHandlers()' );

        $( document )
            .on( 'sequencer/loaded', function() {
                Debug.log( 'All samples are loaded' );
                settings.isLoaded = true;
            } )
            .on( 'keydown', function( event ) {
                var key = event.which;

                // toggle metronome / handle Shift
                // Shift
                if( event.which === 16 ) {
                    settings.isShiftDown = true;

                    event.preventDefault();

                    toggleMetronome();
                }

                if( !settings.isKeyDown && !settings.isShiftDown ) {
                    settings.isKeyDown = true;

                    // samples
                    if( settings.keyboardKeys[key] !== undefined ) {
                        event.preventDefault();

                        playSample( settings.keyboardKeys[key] );

                        if( settings.isRecording ) {
                            addSequenceItem( settings.keyboardKeys[key] );
                        }
                    }

                    // toggle playback
                    // Space
                    if( key === 32 ) {
                        event.preventDefault();

                        togglePlayback();
                    }

                    // clear sequence
                    // X
                    if( key === 88 ) {
                        event.preventDefault();

                        clearSequence();
                    }
                }

            } )
            .on( 'keyup', function( event ) {
                settings.isKeyDown = false;

                if( event.which === 16 ) {
                    settings.isShiftDown = false;
                }
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
            } )
            .on( 'history/undo', function( event, data ) {
                if( data.id ) {
                    removeSequenceItem( data.step, data.sample, data.division, data.id );
                }
            } );

        // fix Safari's initially suspended audio context
        setInterval( function() {
            if( Tone.context.state !== 'running' ) {
                Tone.context.resume();
            }
        }, 1000 );
    }

    // Context
    var initContext = function() {
        StartAudioContext( Tone.context, $( selector.buttonStart ) ).then( function() {

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

        var samples = {}

        for( var i = 0; i < Object.keys( settings.samples['808'] ).length; i++ ) {
            samples[i] = settings.samples['808'][i].src;
        }

        settings.sampler = new Tone.MultiPlayer(
            samples,
            function() {
                $( document ).trigger( 'sequencer/loaded' );
            }
        );
    }


    var playSample = function( i, time ) {
        Debug.log( 'Sequencer.playSample()', i );

        if( settings.isLoaded ) {
            // bufferName, time, offset, duration, pitch, gain
            settings.sampler.start( i, time, 0, '1n', 0, settings.samples['808'][i].gain );

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
        // calls the callback every 16th step
        // sequence
        settings.events = [];
        for( var i = 0; i < settings.division; i++ ) {
            settings.events.push( i );
        }

        settings.loop = new Tone.Sequence( function( time, step ) {

            // helpers
            settings.timeBetweenSteps = time - settings.timeLastStep;
            settings.lastStep = step;
            settings.timeLastStep = time;

            // metronome
            if( settings.isMetronoming ) {
                if( step === 0 ) {
                    playMetronome( true );
                }

                if( step === settings.division / 4 * 1 ) {
                    playMetronome();
                }

                if( step === settings.division / 4 * 2 ) {
                    playMetronome();
                }

                if( step === settings.division / 4 * 3 ) {
                    playMetronome();
                }
            }

            for( var i = 0; i < Object.keys( settings.samples['808'] ).length; i++ ) {
                if( settings.sequence[i][step] === 1  ) {
                    playSample( i );

                    $( document ).trigger( 'sequencer/playStep', [ {
                        step: step
                    } ] );
                }

                if( settings.sequence[i][step] === 2 ) {
                    settings.sequence[i][step] = 1;
                }
            }

            $( document ).trigger( 'sequencer/step', [ {
                step: step
            } ] );

        }, settings.events, settings.division + 'n' );

        Tone.Transport.start( '+0.1' );
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

    var addSequenceItem = function( i, step ) {
        Debug.log( 'Sequencer.addSequenceItem()', i, step );

        if( settings.isPlaying && settings.isRecording ) {
            if( !step ) {
                var step = Math.round( settings.division * settings.loop.progress );
                if( step >= settings.division ) {
                    step = 0;
                }
            }

            Debug.log( 'step', step );

            var pending = ( ( settings.division * settings.loop.progress ) < step ) ? true : false;

            if( !settings.sequence[i][step] ) {
                settings.sequence[i][step] = ( pending ) ? 2 : 1;

                $( document ).trigger( 'sequencer/changeSequence', [ {
                    sequence: settings.sequence
                } ] );

                $( document ).trigger( 'sequencer/addSequenceItem', [ {
                    step:       step,
                    sample:     i,
                    division:   settings.division,
                    id:         Date.now()
                } ] );
            }
        }
    }

    var removeSequenceItem = function( step, sample, division, id ) {
        Debug.log( 'Sequencer.removeSequenceItem()', step, sample, division, id );

        if( settings.sequence[sample][step] ) {
            settings.sequence[sample][step] = 0;

            $( document ).trigger( 'sequencer/changeSequence', [ {
                sequence: settings.sequence
            } ] );

            $( document ).trigger( 'sequencer/removeSequenceItem', [ {
                step:       step,
                sample:     sample,
                division:   settings.division
            } ] );
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
                var step = match[0].charCodeAt( 0 ) - 65;

                var samples = match.substr( 1, match.length );
                if( samples.length > 0 ) {
                    samples = samples.split( '' );

                    for( var j = 0; j < samples.length; j++ ) {
                        addSequenceItem( samples[j], step );
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
            step:       0,
            sample:     0,
            division:   settings.division
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
            settings.metronome = new Tone.Synth().toMaster();
    }

    var toggleMetronome = function() {
        settings.isMetronoming = ( settings.isMetronoming ) ? false : true;

        $( document ).trigger( 'sequencer/toggleMetronome', [{
            state: settings.isMetronoming
        }] );
    }

    var playMetronome = function( high ) {
        var note = ( high ) ? 'C5' : 'C4';

        settings.metronome.triggerAttackRelease( note, '16n', '+0.05', 0.8 );
    }

    // State
    var isReady = function() {
        return ( settings.isLoaded ) ? true : false;
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
        init:        function() { init(); },
        isReady:     function() { return isReady(); },
        getProgress: function() { return getProgress() },
        getSequence: function() { return getSequence() },
        getDivision: function() { return getDivision() }
    }

} )();

$( document ).ready( function() {
     Sequencer.init();
} );
