/**
 * Recorder
 * Uses https://github.com/higuma/web-audio-recorder-js
 */
var Recorder = ( function() {

    var settings = {

    }

    var state = {
        keyDown: false,
        recording: false,
        processing: false,
        busy: false
    }


    var init = function() {
        Debug.log( 'Recorder.init()' );

        buildRecorder();

        bindEventHandlers();

        $( document ).trigger( 'recorder/init' );
    }

    var bindEventHandlers = function() {
        settings.recorder.onComplete = function( recorder, blob ) {
            onComplete( blob );
        }

        $( document )
            .on( 'ui/clickButton', function( event, data ) {
                if( data.action === 'record' ) {
                    if( !state.recording ) {
                        if( !state.busy ) {
                            startRecording();
                        }
                    } else {
                        if( !state.processing ) {
                            stopRecording();
                        }
                    }
                }
            } )
            .on( 'keydown', function( event ) {
                if( !state.keyDown ) {
                    state.keyDown = true;
                    var key = event.which;

                    // record
                    // R
                    if( key === 82 ) {
                        event.preventDefault();

                        if( !state.recording ) {
                            if( !state.busy ) {
                                startRecording();
                            }
                        } else {
                            if( !state.processing ) {
                                stopRecording();
                            }
                        }
                    }
                }

            } )
            .on( 'keyup', function( event ) {
                state.keyDown = false;
            } )
    }

    var onComplete = function( blob ) {
        Debug.log( 'Recorder.onComplete()' );

        setTimeout( function() {
            saveAs( blob, '108-beat--' + Date.now() + '.wav' );

            state.processing = false;
            state.busy = false;

            $( document ).trigger( 'recorder/finish' );
        }, 1000 );
    }

    var buildRecorder = function() {
        Debug.log( 'Recorder.buildRecorder()' );

        if( Tone.Master ) {
            settings.recorder = new WebAudioRecorder( Tone.Master.output, {
                workerDir: 'src/js/workers/'
            } );
        } else {
            Debug.log( 'Tone.Master was not found' );
        }
    }

    var startRecording = function() {
        Debug.log( 'Recorder.startRecording()' );

        settings.recorder.startRecording();

        state.recording = true;
        state.busy = true;

        $( document ).trigger( 'recorder/start' );
    }

    var stopRecording = function() {
        Debug.log( 'Recorder.stopRecording()' );

        settings.recorder.finishRecording();

        state.recording = false;
        state.processing = true;

        $( document ).trigger( 'recorder/stop' );
    }

    return {
        init: function() { init(); }
    }

} )();

$( document ).ready( function() {
    Recorder.init();
} );
