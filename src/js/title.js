/**
 * Title
 * animating the site's title
 */
var Title = ( function() {

    var settings = {
        selector: {
            title: 'title'
        },
        element: {},
        text: {
            title: '',
            runner: '●',
            spacer: '   '
        }
    }

    var init = function() {
        Debug.log( 'title.init()' );

        settings.element.title = $( settings.selector.title );
        settings.text.title = settings.element.title.text();

        bindEventHandlers();
    }

    var bindEventHandlers = function() {
        $( document )
            .on( 'sequencer/step', function( event, data ) {
                onStep( data.step );
            } );
    }

    var onStep = function( step ) {
        Debug.log( 'title.onStep()' );

        var text = '';
        for( var i = 0; i < Sequencer.getDivision(); i++ ) {
            if( i === step ) {
                text += settings.text.runner;
            } else {
                text += '·';
            }
        }

        text += settings.text.spacer + settings.text.title;
        set( text );
    }

    var set = function( text ) {
        settings.element.title.text( text );
    }

    return {
        init: function() { init(); }
    }

} )();

$( document ).ready( function() {
    Title.init();
} );
