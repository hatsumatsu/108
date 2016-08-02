/**
 * Recorder
 *
 */
var Recorder = ( function() {

    var settings = {

    }

    var state = {
        keyDown: false,
        recording: false
    }


    var init = function() {
        Debug.log( 'Recorder.init()' );

        Debug.log( Tone.Master );

        settings.recorder = new WebAudioRecorder( Tone.Master.output, {
            workerDir: 'src/js/workers/'
        } );

        settings.recorder.startRecording();
        setTimeout( function() {
            settings.recorder.finishRecording()
        }, 20000 );

        Debug.log( settings.recorder );

        bindEventHandlers();

        $( document ).trigger( 'recorder/init' );
    }

    var bindEventHandlers = function() {
        settings.recorder.onComplete = function( recorder, blob ) {
            saveAs( blob, '001.wav' );
        }

        $( document )
            .on( 'ui/clickButton', function( event, data ) {
                if( data.action === 'record' ) {
                    if( !state.recording ) {
                        startRecording();
                    } else {
                        stopRecording();
                    }
                }
            } )
            .on( 'keydown', function( event ) {
                if( !state.keyDown ) {
                    state.keyDown = true;
                    var key = event.which;

                    // record
                    // .
                    if( key === 190 ) {
                        event.preventDefault();

                        if( !state.recording ) {
                            startRecording();
                        } else {
                            stopRecording();
                        }
                    }
                }

            } )
            .on( 'keyup', function( event ) {
                state.keyDown = false;
            } )
    }

    var startRecording = function() {
        Debug.log( 'Recorder.startRecording()' );

        state.recording = true;
    }

    var stopRecording = function() {
        Debug.log( 'Recorder.stopRecording()' );

        state.recording = false;
    }

    return {
        init: function() { init(); }
    }

} )();

$( document ).ready( function() {
    Recorder.init();
} );
