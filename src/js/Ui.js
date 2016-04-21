var Ui = ( function() {
	var settings = {
		selector: {
			title:  'h1',
			button: '.control-button',
			controls: {
				toggle: '.ui-toggle--controls',
			},
			shareInput: '.share-url-input'
		},
		isVisible: {
			controls: false
		}
	}

	var init = function() {
		if( Modernizr.touchevents ) {
			toggleControls();
		}

		bindEventHandlers();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'click', settings.selector.controls.toggle, function( event ) {
				event.preventDefault();

				toggleControls();
			} )
			.on( 'mousedown touchstart', settings.selector.button, function( event ) {
				event.preventDefault();

				Debug.log( 'mousedown / touchstart' );

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
				highlightTitle();
			} )
			.on( 'sequencer/saveSequence', function( event, data ) {
				setUrl( data.data );
			} );
	}	

	var highlightButton = function( sample ) {
		Debug.log( 'Ui.highlightButton()', sample );

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

	var highlightTitle = function() {
		Debug.log( 'Ui.highlightTitle()' );

		if( !Modernizr.touchevents && Viewport.getWidth() > 768 ) {
			var title = $( settings.selector.title );

			new TimelineLite()
				.to( 
					title,
					0.01, 
					{
						opacity: 1
					}						
				)
				.to( 
					title,
					0.05, 
					{
						opacity: 0.5
					}						
				);	
		}							
	}


	var toggleControls = function() {
		if( !settings.isVisible.controls ) {
			$( 'html' )
				.addClass( 'visible--ui-controls' );
		} else {
			$( 'html' )
				.removeClass( 'visible--ui-controls' );			
		}

		settings.isVisible.controls = !settings.isVisible.controls;		
	} 


	var setUrl = function( hash ) {
		Debug.log( 'Ui.setUrl()', hash );

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