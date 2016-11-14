/**
 * URL
 * modifies the page's hash
 */
var Url = ( function() {

	var settings = {
		hash: '',
		name: ''
	}

	var init = function() {
		//Debug.log( 'url.init()' );

		getName();

		getHash();

		$( document ).trigger( 'url/init', [{ 
			hash: settings.hash,
			name: settings.name
		}] );
	}

	var getName = function() {
		var name = location.search;
		if( name.substr( 0,1 ) === '?' ) {
			settings.name = name.substr( 1, name.length );
			var name = decodeURI(settings.name);
			var name = name.replace(/\+/g, ' ');
			settings.name = name;
		}
	}

	var getHash = function() {
		var hash = location.hash;
		if( hash.substr( 0,1 ) === '#' ) {
			settings.hash = hash.substr( 1, hash.length );
		}
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Url.init();
} );
