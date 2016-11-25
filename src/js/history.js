/**
 * History
 * the history of added notes
 */
var History = ( function() {

	var settings = {
		maxLength: 32
	}

	var state = {
		keyDown: false
	}

	var history = {};

	var init = function() {
		//Debug.log( 'History.init()' );

		bindEventHandlers();

		$( document ).trigger( 'history/init' );
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'sequencer/addSequenceItem', function( event, data ) {
				addItem( data.step, data.sample, data.division, data.id );
			} )
			.on( 'ui/clickButton', function( event, data ) {
				if( data.action === 'undo' ) {
					undo();
				}
			} )
			.on( 'keydown', function( event ) {
				if( !state.keyDown ) {
					state.keyDown = true;
					var key = event.which;

					// undo
					// Z
					if( key === 8 ) {
						event.preventDefault();

						undo();
					}
				}

			} )
			.on( 'timeline/clickRemove', function( event, data ) {
				undo( data.id );
			} )
			.on( 'keyup', function( event ) {
				state.keyDown = false;
			} )
	}

	var addItem = function( step, sample, division, id ) {
		//Debug.log( 'History.init()', id );

		if( id ) {
			if( history.length > 0 && Object.keys( history ).length > settings.maxLength - 1 ) {
				history.shift();
			}

			history[id] = {
				step: step,
				sample: sample,
				division: division
			};
		}

		//Debug.log( history );
	}

	var undo = function( specificId ) {
		//Debug.log( 'History.undo()' );


		if ( specificId ) {
			var item = history[specificId];

			$( document ).trigger( 'history/undo', [{ step: item.step, sample: item.sample, division: item.division, id: specificId }] );

			delete history[specificId];

			//Debug.log( history );
		} else if( Object.keys( history ).length > 0 ) {
			var id = Object.keys( history )[ ( Object.keys( history ).length - 1 ) ];
			var item = history[id];

			$( document ).trigger( 'history/undo', [{ step: item.step, sample: item.sample, division: item.division, id: id }] );

			delete history[id];

			//Debug.log( history );
		}
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	History.init();
} );
