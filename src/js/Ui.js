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
                toggle: '.ui-toggle--share',
                input:  '.share-url-input',
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
        }
    }

    var init = function() {
        // enable controls on touch devices
        if( Modernizr.touchevents ) {
            toggleControls();
        }

        if( location.href.indexOf( 'demo' ) > -1 && !settings.isVisible.controls ) {
            toggleControls();
        }

        // show info UI on first visit
        if( !Cookies.get( '108--visited' ) && location.href.indexOf( 'demo' ) < 0 ) {
            toggleModal( 'info' );
        }
        Cookies.set( '108--visited', true, { expires: 30, path: '' } );

        bindEventHandlers();
    }

    var bindEventHandlers = function() {
        $( document )
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
            } )
            // control buttons
            .on( 'click', settings.selector.button, function( event ) {
                event.preventDefault();
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
            // share links
            .on( 'click', settings.selector.share.link, function( event ) {
                event.preventDefault();

                var service = $( this ).attr( 'data-service' );
                if( service ) {
                    openShareWindow( service, settings.url );
                }
            } )
            .on( 'sequencer/playSample', function( event, data ) {
                var sample = data.sample;
                highlightButton( sample );
                highlightTitle();
            } )
            .on( 'sequencer/saveSequence', function( event, data ) {
                setUrl( data.data );
            } )
            .on( 'focus', settings.selector.share.input, function( event ) {
                $( this ).select();
            } );

            new Clipboard( settings.selector.share.button );
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
        Debug.log( 'Ui.toggleControls()' );

        if( !settings.isVisible.controls ) {
            $( 'html' )
                .addClass( 'visible--ui-controls' );
        } else {
            $( 'html' )
                .removeClass( 'visible--ui-controls' );
        }

        settings.isVisible.controls = !settings.isVisible.controls;
    }

    var toggleModal = function( id ) {
        Debug.log( 'Ui.toggleModal()', id );

        if( !settings.isVisible[id] ) {
            $( 'html' )
                .addClass( 'visible--ui-' + id );
        } else {
            $( 'html' )
                .removeClass( 'visible--ui-' + id );
        }

        settings.isVisible[id] = !settings.isVisible[id];
    }

    var setUrl = function( hash ) {
        Debug.log( 'Ui.setUrl()', hash );

        var url = location.protocol + '//' + location.hostname + location.pathname;
        settings.url = url + '#' + hash;

        $( settings.selector.share.input ).val( settings.url );
    }

    var openShareWindow = function( service, url ) {
        if( settings.shareServices[service] ) {
            var url = settings.shareServices[service].url.replace( '{url}', url );
            window.open( url, '108Share', 'width=520,height=320,menubar=no,location=yes,resizable=no,scrollbars=yes,status=no' );
        }
    }

    return {
        init: function() { init(); }
    }

} )();

$( document ).ready( function() {
    Ui.init();
} );
