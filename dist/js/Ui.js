var Ui = ( function() {
	var settings = {
		selector: {
			button: '.button',
			controls: {
				toggle: '.ui-toggle--controls',
			},
			shareInput: '.share-url-input'
		},
		isVisible: true
	}

	var init = function() {
		toggleControls();

		bindEventHandlers();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'click', settings.selector.controls.toggle, function( event ) {
				settings.isVisible = !settings.isVisible;

				toggleControls();
			} )
			.on( 'click', settings.selector.button, function( event ) {
				event.preventDefault();

				var button = $( this );

				// sample buttons
				if( button.attr( 'data-sample' ) ) {
					var sample = parseInt( $( this ).attr( 'data-sample' ) );

					$( document ).trigger( 'ui/clickButton', [{
						sample: sample
					}] );
				}

				// action buttons
				if( button.attr( 'data-action' ) ) {
					var action = $( this ).attr( 'data-action' );

					$( document ).trigger( 'ui/clickButton', [{
						action: action
					}] );
				}
			} )
			.on( 'sequencer/playSample', function( event, data ) {
				var sample = data.sample;
				highlightButton( sample );
			} )
			.on( 'sequencer/saveSequence', function( event, data ) {
				setUrl( data.data );
			} );
	}	

	var highlightButton = function( sample ) {
		console.log( 'Ui.highlightButton()', sample );

		var button = $( settings.selector.button ).filter( '[data-sample="' +  sample + '"]' );
		var color = $( 'html' ).css( 'backgroundColor' );

		new TimelineLite()
			.to( 
				button,
				0.05, 
				{
					backgroundColor: '#fff'
				}						
			)	
			.to( 
				button,
				0.05, 
				{
					backgroundColor: 'rgba( 255,255,255,0.01 )'
				}							
			);						
	}

	var toggleControls = function() {
		if( !settings.isVisible ) {
			$( 'html' )
				.addClass( 'visible--ui-controls' );
		} else {
			$( 'html' )
				.removeClass( 'visible--ui-controls' );			
		}
	} 


	var setUrl = function( hash ) {
		console.log( 'Ui.setUrl()', hash );

		var url = location.protocol + '//' + location.hostname + location.pathname;
		url = url + '#' + hash;

		$( settings.selector.shareInput ).val( url );
	}

	return {
		init: function() { init(); }
	}
} )();

$( document ).ready( function() {
	Ui.init();
} );