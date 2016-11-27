/**
 * UI
 * control buttons, modals, share input and title
 */
var Ui = ( function() {

	var settings = {
		selector: {
			title:  'h1',
			button: '.control-button',
			controls: {
				toggle: '.ui-toggle--controls',
			},
			share: {
				setname:'.share-name-input',
				getname:'.username',
				toggle: '.ui-toggle--share',
				url:    '.share-url-input',
				button: '.share-url-button',
				close:  '.ui-modal-close--share',
				link:   '.share-link'
			},
			info: {
				toggle: '.ui-toggle--info',
				close:  '.ui-modal-close--info'
			},
			modal: {
				wrapper: '[data-modal]',
				toggle:  '[data-modal-action="toggle"]'
			}
		},
		isVisible: {
			controls:   false,
			share:      false,
			info:       false
		},
		shareServices: {
			facebook: {
				label:  'Facebook',
				url:    'https://facebook.com/sharer/sharer.php?u={url}'
			},
			twitter: {
				label:  'Twitter',
				url:    'http://www.twitter.com/share?url={url}'
			}
		},
		url: {
			protocol:    location.protocol + '//',
			hostname:    location.hostname,
			pathname:    location.pathname,
			name:        '',
			sequencerID: '',
			all:         ''
		}
	}

	var init = function() {
		// enable controls on touch devices
		toggleControls();

		// show info UI on first visit
		if( !Cookies.get( 'yasuke--visited' ) && location.href.indexOf( 'demo' ) < 0 ) {
			toggleModal( 'info' );
		}
		Cookies.set( 'yasuke--visited', true, { expires: 30, path: '' } );

		bindEventHandlers();

		setName();
	}

	var bindEventHandlers = function() {
		$( document )
			// set url name
			.on( 'url/init', function( event, data ) {
				if ( data.name ) {
					$(settings.selector.share.getname).text( ' / ' + data.name );
					getName( data.name );
				}
			})
			// toggle controls
			.on( 'click', settings.selector.controls.toggle, function( event ) {
				event.preventDefault();

				toggleControls();
			} )
			// toggle modal
			.on( 'click', settings.selector.modal.toggle, function( event ) {
				event.preventDefault();

				var id = $( this ).closest( settings.selector.modal.wrapper ).attr( 'data-modal' );
				toggleModal( id );
				
				if( $( this ).is( settings.selector.share.toggle ) ) {
					$( document ).trigger( 'ui/openShare', [{ 
						hash: Ui.getHash()
					}] );
				}

			} )
			// control buttons
			.on( 'click', settings.selector.button, function( event ) {
				event.preventDefault();
			} )
			.on( 'mousedown touchstart', settings.selector.button, function( event ) {
				event.preventDefault();

				//Debug.log( 'mousedown / touchstart' );

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
			// share links
			.on( 'click', settings.selector.share.link, function( event ) {
				event.preventDefault();
				var service = $( this ).attr( 'data-service' );
				if( service ) {
					openShareWindow( service, 'https://goo.gl/6jrrsB' );
				}
			} )
			.on( 'sequencer/playSample', function( event, data ) {
				var sample = data.sample;
				highlightButton( sample );
				highlightTitle();
			} )
			.on( 'sequencer/saveSequence', function( event, data ) {
				setSequencerID( data.data );
			} )
			.on( 'sequencer/toggleMetronome', function( event, data ) {
				setButton( 'shift', data.state );
			} )
			.on( 'focus', settings.selector.share.url, function( event ) {
				$( this ).select();
			} );

			new Clipboard( settings.selector.share.button );
	}

	var highlightButton = function( sample ) {
		//Debug.log( 'Ui.highlightButton()', sample );

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
		//Debug.log( 'Ui.highlightTitle()' );

		if( !Modernizr.touchevents ) {
			var title = $( settings.selector.title );

			new TimelineLite()
				.to(
					title,
					0.02,
					{
						color: 'gray'
					}
				)
				.to(
					title,
					0.05,
					{
						color: 'white'
					}
				);
		}
	}


	var toggleControls = function() {
		//Debug.log( 'Ui.toggleControls()' );

		if( !settings.isVisible.controls ) {
			$( 'html' )
				.addClass( 'visible--ui-controls' );

			var height = $('.ui--controls').outerHeight();

			$('.timeline').attr('style', 'bottom:' + (height + 40) + 'px');
			$('.ui-toggle--share').attr('style', 'bottom:' + height + 'px');

		} else {
			$( 'html' )
				.removeClass( 'visible--ui-controls' );

			$('.timeline').attr('style', '');
			$('.ui-toggle--share').attr('style', '');
		}

		settings.isVisible.controls = !settings.isVisible.controls;
	}


	var setButton = function( key, state ) {
		//Debug.log( 'Ui.setButton()', key, state );

		var button = $( settings.selector.button ).filter( '[data-key="' + key + '"]' );

		if( button.length > 0 ) {
			if( state ) {
				button.addClass( 'active' );
			} else {
				button.removeClass( 'active' );
			}
		}
	}

	var toggleModal = function( id ) {
		//Debug.log( 'Ui.toggleModal()', id );

		if( !settings.isVisible[id] ) {
			$( 'html' )
				.addClass( 'visible--ui-' + id );
		} else {
			$( 'html' )
				.removeClass( 'visible--ui-' + id );
		}

		settings.isVisible[id] = !settings.isVisible[id];
	}

	var getName = function( name ) {

		setName( name );

	}
	var setName = function( initName ) {

		if ( initName ) {

			$(settings.selector.getname).text( initName );

		}

		$(settings.selector.share.setname)[0].oninput = function() {
			
			var name = $(this).val();

			// check and delete character '@'
			// because '@' is the delimiter of parameters
			if ( name.slice(-1) === '@' ) {
				
				$(this).val( name.slice(0, -1) );

				var name = $(this).val();

			}

			if ( name.length >= 0 ) {
				$(settings.selector.share.getname).text( ' / ' + name );

				$( document ).trigger( 'Ui/changeName', [ {
					name: name
				} ] );

				settings.url.name = encodeURI(name)//.replace(/ /g, '+');

			} else {
				$(settings.selector.share.getname).text( '' );
				settings.url.name = '';
			}

			setUrl();
		};

	}

	var setSequencerID = function ( id ) {
		//Debug.log( 'Ui.setHas()', id );

		if ( id.length > 0 ) {
			settings.url.sequencerID = id;
			
		} else {
			settings.url.sequencerID = '';

		}

		setUrl();
	}

	var setUrl = function( hash ) {

		var url = settings.url.protocol + settings.url.hostname + settings.url.pathname;
		var parameters = '';

		if ( settings.url.name || settings.url.sequencerID) {
			parameters = '?';

			if ( settings.url.name ) {
				parameters += 'n' + settings.url.name + '@';
			}
			if ( settings.url.sequencerID ) {
				parameters += 's' + settings.url.sequencerID;	
			}
		}

		settings.url.all = url + parameters;
		
		window.history.pushState('', '', parameters);

		$( settings.selector.share.url ).val( settings.url.all );


		/*if( /Android/i.test(navigator.userAgent) ) {
			$('.share-whatsapp').attr('style', '');
			$('.share-whatsapp a').attr('href', 'whatsapp://send?text=Aumente o volume e escute o meu som criado no #YasukeBeatMachine. Chega no site e faça o seu beat também. ' + settings.url.all + '' );
			console.log('whatstapp')
			console.log('whatsapp://send?text=Aumente o volume e escute o meu som criado no #YasukeBeatMachine. Chega no site e faça o seu beat também. ' + settings.url.all + '');
		}*/
	}

	var getHash = function() {
		return settings.url.hash;
	}

	var openShareWindow = function( service, url ) {
		if( settings.shareServices[service] ) {
			console.log(settings.url.all)
			var url = settings.shareServices[service].url.replace( '{url}', url );
			console.log(url)
			window.open( url, '108Share', 'width=520,height=320,menubar=no,location=yes,resizable=no,scrollbars=yes,status=no' );
		}
	}

	return {
		init:    function() { init(); },
		getHash: function() { return getHash() }
	}

} )();

$( document ).ready( function() {
	Ui.init();
} );
