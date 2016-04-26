/**
 * URL
 * modifies the page's hash
 */
var Url = ( function() {

	var settings = {
		hash: '',
		isChanging: false
	}

	var init = function() {
		Debug.log( 'url.init()' );

		onHashchange();

		bindEventHandlers();

		$( document ).trigger( 'url/init', [{ hash: settings.hash }] );
	}

	var bindEventHandlers = function() {
		$( window )
			.on( 'hashchange', function() {
				if( !settings.isChanging ) {
					Debug.log( 'hashchange' );
					onHashchange();
				}
			} );

		$( document )
			.on( 'sequencer/clearSequence', function( event, data ) {
				set( '' );
			} );
	}

	var onHashchange = function() {
		var hash = location.hash;
		if( hash.substr( 0,1 ) === '#' ) {
			settings.hash = hash.substr( 1, hash.length );
		}

		if( settings.hash ) {
			$( document ).trigger( 'url/change', [ {
				hash: settings.hash
			} ] );
		}
	}
 
	var set = function( hash ) {
		settings.isChanging = true;
		
		location.hash = hash;

		setTimeout( function() {
			settings.isChanging = false;
		}, 500 );
	} 

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Url.init();
} );