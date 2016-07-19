/**
 * Viewport
 * handy module to track viewport events and properties
 */
var Viewport = ( function() {

    var settings = {
        width: 0,
        height: 0,
        documentHeight: 0,
        nowLoop: Date.now(),
        fps: ( 1000 / 60 ),

        // scrolling
        scrollTop: -1,
        _scrollTop: -1,
        scrollDetectionMode: 'scrollEvent', // 'scrollEvent' or 'requestAnimationFrame'
        nowScroll: Date.now(),
        scrollFactor: -1,
        isScrolledToTop: false,
        isScrolledToBottom: false,
        scrollTopOffset: 20,
        scrollBottomOffset: 20,
        isScrolledToFirstScreen: false,
        isScrolledToLastScreen: false,
        scrollToOffset: 0,
        scrollToSpeed: 2
    };

    var init = function() {
        Debug.log( 'viewport.init()' );

        settings.element = $( window );

        onResizeFinish();

        bindEventHandlers();

        onScroll();
        onLoop();
    }

    var bindEventHandlers = function() {
        // throttle resize event
        settings.element.on( 'resize', function() {
            if( settings.resizeDelay ) {
                clearTimeout( settings.resizeDelay );
                settings.resizeDelay = null;
            } else {
                $( 'html' ).addClass( 'resizing' );
                $( document ).trigger( 'viewport/resize/start' );
            }

            settings.resizeDelay = setTimeout( function() {
                $( 'html' ).removeClass( 'resizing' );
                $( document ).trigger( 'viewport/resize/finish' );
                settings.resizeDelay = null;
            }, 500 );
        } );

        // scroll event
        if( settings.scrollDetectionMode == 'scrollEvent' ) {
            settings.element.on( 'scroll', function() {
                var now = Date.now();
                var elapsed = now - settings.nowScroll;

                if( elapsed > settings.fps ) {
                    settings.nowScroll = now - ( elapsed % settings.fps );

                    settings.scrollTop = settings.element.scrollTop();
                    $( document ).trigger( 'viewport/scroll' );
                }
            } );
        }

        $( document )
            .on( 'viewport/scroll', function() {
                onScroll();
            } )
            .on( 'viewport/resize/finish', function() {
                onResizeFinish();
            } )

            // top
            .on( 'viewport/scroll/toTop', function() {
                Debug.log( 'scrolled to top' );

                $( 'html' ).addClass( 'scrolled-to-top' );
            } )
            .on( 'viewport/scroll/fromTop', function() {
                Debug.log( 'scrolled from top' );

                $( 'html' ).removeClass( 'scrolled-to-top' );
            } )

            // bottom
            .on( 'viewport/scroll/toBottom', function() {
                Debug.log( 'scrolled to bottom' );

                $( 'html' ).addClass( 'scrolled-to-bottom' );
            } )
            .on( 'viewport/scroll/fromBottom', function() {
                Debug.log( 'scrolled from bottom' );

                $( 'html' ).removeClass( 'scrolled-to-bottom' );
            } )

            // first screen
            .on( 'viewport/scroll/toFirstScreen', function() {
                Debug.log( 'scrolled to first screen' );

                $( 'html' ).addClass( 'scrolled-to-first-screen' );
            } )
            .on( 'viewport/scroll/fromFirstScreen', function() {
                Debug.log( 'scrolled from first screen' );

                $( 'html' ).removeClass( 'scrolled-to-first-screen' );
            } )

            // last screen
            .on( 'viewport/scroll/toLastScreen', function() {
                Debug.log( 'scrolled to last screen' );

                $( 'html' ).addClass( 'scrolled-to-last-screen' );
            } )
            .on( 'viewport/scroll/fromLastScreen', function() {
                Debug.log( 'scrolled from last screen' );

                $( 'html' ).removeClass( 'scrolled-to-last-screen' );
            } );
    }

    /**
     * requestAnimationFrame loop throttled at 60fps
     */
    var onLoop = function() {
        requestAnimationFrame( onLoop );

        var now = Date.now();
        var elapsed = now - settings.nowLoop;

        // the actual 'loop'
        if( elapsed > settings.fps ) {
            settings.nowLoop = now - ( elapsed % settings.fps );

            $( document ).trigger( 'viewport/loop', [{ now: now }] );

            // scrollTop
            if( settings.scrollDetectionMode == 'requestAnimationFrame' ) {
                settings._scrollTop = settings.scrollTop;
                settings.scrollTop = settings.element.scrollTop();

                if( settings.scrollTop != settings._scrollTop ) {
                    $( document ).trigger( 'viewport/scroll' );
                }
            }
        }
    }

    var onResizeFinish = function() {
        Debug.log( 'viewport.onResizeFinish()' );

        settings.width = settings.element.width();
        settings.height = settings.element.height();
        settings.documentHeight = $( 'html' ).outerHeight();
    }

    var onScroll = function() {
        Debug.log( 'viewport.onScroll()' );

        settings.scrollFactor = settings.scrollTop / ( settings.height - settings.documentHeight ) * -1;

        // top
        if( settings.scrollTop > settings.scrollTopOffset ) {
            if( settings.isScrolledToTop ) {
                settings.isScrolledToTop = false;
                $( document ).trigger( 'viewport/scroll/fromTop' );
            }
        }

        if( settings.scrollTop < settings.scrollTopOffset ) {
            if( !settings.isScrolledToTop ) {
                settings.isScrolledToTop = true;
                $( document ).trigger( 'viewport/scroll/toTop' );
            }
        }

        // bottom
        if( settings.scrollTop > settings.documentHeight - settings.height - settings.scrollBottomOffset ) {
            if( !settings.isScrolledToBottom ) {
                settings.isScrolledToBottom = true;
                $( document ).trigger( 'viewport/scroll/toBottom' );
            }
        }

        if( settings.scrollTop < settings.documentHeight - settings.height - settings.scrollBottomOffset ) {
            if( settings.isScrolledToBottom ) {
                settings.isScrolledToBottom = false;
                $( document ).trigger( 'viewport/scroll/fromBottom' );
            }
        }

        // first screen
        if( settings.scrollTop < settings.height ) {
            if( !settings.isScrolledToFirstScreen ) {
                settings.isScrolledToFirstScreen = true;
                $( document ).trigger( 'viewport/scroll/toFirstScreen' );
            }
        }

        if( settings.scrollTop > settings.height ) {
            if( settings.isScrolledToFirstScreen ) {
                settings.isScrolledToFirstScreen = false;
                $( document ).trigger( 'viewport/scroll/fromFirstScreen' );
            }
        }

        // last screen
        if( settings.scrollTop > settings.documentHeight - ( 2* settings.height ) ) {
            if( !settings.isScrolledToLastScreen ) {
                settings.isScrolledToLastScreen = true;
                $( document ).trigger( 'viewport/scroll/toLastScreen' );
            }
        }

        if( settings.scrollTop < settings.documentHeight - ( 2* settings.height ) ) {
            if( settings.isScrolledToLastScreen ) {
                settings.isScrolledToLastScreen = false;
                $( document ).trigger( 'viewport/scroll/fromLastScreen' );
            }
        }
    }

    var scrollTo = function( target, offset, animate ) {
        Debug.log( 'viewport.scrollTo()' );
        Debug.log( target );

        var top = 0;

        // scroll to position
        if( typeof target == 'number' ) {
            top = target;
        }

        // scroll to id
        if( typeof target == 'string' && $( '#' + target ).length > 0 ) {
            top = parseInt( $( '#' + target ).offset().top );
        }

        // scroll to element
        if( typeof target == 'object' && target.length > 0 ) {
            top = parseInt( target.offset().top );
        }

        if( offset ) {
            top = top + offset;
        } else {
            top = top + settings.scrollToOffset;
        }

        var distance = Math.floor( Math.abs( top - $( window ).scrollTop() ) );
        var duration = Math.floor( distance / settings.scrollToSpeed );

        if( animate ) {
            $( 'html, body' ).animate( {
                scrollTop: top
            }, duration );
        } else {
            settings.element.scrollTop( top );
        }

    }

    var getWidth = function() {
        return settings.width;
    }

    var getHeight = function() {
        return settings.height;
    }

    var getScrollTop = function() {
        return settings.scrollTop;
    }

    var getScrollFactor = function() {
        return settings.scrollFactor;
    }

    return {
        init:               function() { init(); },
        scrollTo:           function( target, offset, animate ) { scrollTo( target, offset, animate ) },
        getWidth:           function() { return getWidth() },
        getHeight:          function() { return getHeight() },
        getScrollTop:       function() { return getScrollTop() },
        getScrollFactor:    function() { return getScrollFactor() }
    }

} )();

$( document ).ready( function() {
    Viewport.init();
} );
