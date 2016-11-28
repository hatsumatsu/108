/**
 * URL
 * modifies the page's hash
 */
var Url = ( function() {

	var settings = {
		sequencerID: '',
		name: ''
	}

	var init = function() {
		//Debug.log( 'url.init()' );

		getParameters();

		$( document ).trigger( 'url/init', [{ 
			sequencerID: settings.sequencerID,
			name: settings.name
		}] );
	}

	var getParameters = function() {
		var delimiter = '@';
		var delimiterEncoded = encodeURIComponent( delimiter );

		if ( location.search ) {
			var parameters = location.search.substr( 1 );
			var listParameters = [];

			// put parameters in array
			if ( parameters.indexOf( delimiter ) > 0 ) {

				listParameters = parameters.split( delimiter );

			} else if ( parameters.indexOf( delimiterEncoded ) > 0 ) {

				listParameters = parameters.split( delimiterEncoded );

			} else {

				listParameters.push( parameters );
			}

			// set parameters
			for ( i = 0; i < listParameters.length; i++ ) {
				
				if ( listParameters[i].substr( 0,1 ) == 'n' ) {

					// decode
					var decode = decodeURI(listParameters[i]);

					// change + by space
					var decode = decode.replace(/\-/g, ' ');

					settings.name = decode.substr(1,13);

				} else if ( listParameters[i].substr( 0,1 ) === 's' ) {

					settings.sequencerID = listParameters[i].substr(1);

				}
			}
		}
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Url.init();
} );
