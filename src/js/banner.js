/**
 * Banner
 * Create dynamic banner for users
 */
var Banner = ( function() {
	var settings = {
		// canvas
		cv: document.querySelector('canvas'),
		ctx: document.querySelector('canvas').getContext('2d'),
		hash: '',
		init: false,

		selector: {
			download: '.download-banner',
			downloadhide: '.download-banner-hide'
		},

		// timeline
		tl: {
			division: 16,
			samples: 6,

			// position	in percentage (0/100%)
			top: 10,
			left: 5,
			right: 5
		},

		//assets
		assets: {
			// background
			background: 'dist/img/background2.jpg',

			// personages
			0: 'dist/img/0.png',
			1: 'dist/img/1.png',
			2: 'dist/img/2.png',
			3: 'dist/img/3.png',
			4: 'dist/img/4.png',
			5: 'dist/img/5.png'
		}
	}

	var init = function() {
		//Debug.log( 'banner.init()' );

		bindEventHandlers();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'click', settings.selector.download, function ( event ) {
				download();
			})
			.on( 'ui/changeOnload', function( event, data ) {
				settings.hash = data.hash.replace(/#/g, '');

				if( settings.init === false ){
					preLoad();
					settings.init = true;
				} else {
					drawAll();
				}
			} );

	}

	var preLoad = function() {

		// Pre load images
		$(function loadImages() {
			//Debug.log( 'Banner.loadImages()', settings.tl.images );

			var loadedImages = 0;
			var numImages = Object.keys(settings.assets).length;

			for(var src in settings.assets) {
				var imageSource = settings.assets[src];

				settings.assets[src] = new Image();
				settings.assets[src].onload = function() {
					if(++loadedImages >= numImages) {
						drawAll();
					}
				};
				settings.assets[src].src = imageSource;
			}
		});
	}

	// Draw background
	var drawBackground = function() {

		settings.ctx.drawImage(settings.assets.background, 0, 0, settings.cv.width, settings.cv.height);

	}

	// Draw timeline
	var drawTimeLine = function( ) {
		//Debug.log( 'Banner.drawBannerTimeline()', hash );

		// loop over every char of the hash
		var matches = settings.hash.match( /[A-Za-z][0-9]+/g );

		if( matches ) {
			for( var i = 0; i < matches.length; i++ ) {
				var match = matches[i];
				var step = match[0].charCodeAt( 0 ) - 65;
				var samples = match.substr( 1, match.length );

				if( samples.length > 0 ) {
					samples = samples.split( '' );

					for( var j = 0; j < samples.length; j++ ) {

						// values in percentage
						var top = settings.tl.top / 10 * settings.cv.height / 10;
						var left = settings.tl.left / 10 * settings.cv.width / 10;
						var right = settings.tl.right / 10 * settings.cv.width / 10;

						// real values
						var image = settings.assets[samples[j]];
						var width = (settings.cv.width - right - left) / settings.tl.division;
						var height = width * 1.4; // aspect ratio
						var left = width * step + left;
						var top = height * samples[j] + top;

						settings.ctx.drawImage(image, left, top, width, height);

					}
				}
			}
		}
	}

	// Draw / Redraw
	var drawAll = function() {
		drawBackground();
		drawTimeLine();
	}

	var download = function() {

		var base64 = settings.cv.toDataURL('image/jpeg', 1);

		var a = $(settings.selector.download).next(settings.selector.downloadhide);
		a.attr('href', base64);
		a[0].click();
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Banner.init();
} );
