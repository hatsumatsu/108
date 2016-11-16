/**
 * Banner
 * Create dynamic banner for users
 */
var Banner = ( function() {

	var settings = {

		// timeline
		tl: { 
			division: 16,
			samples: 6,

			// position	
			top: 100,
			left: 10,
			right: 10,

			images: []
		}
	}

	var init = function() {
		//Debug.log( 'banner.init()' );

		bindEventHandlers();
	}

	var bindEventHandlers = function() {
		$( document )
			.on( 'url/init', function( event, data ) {
				initBanner( data.hash );
			} )
			.on( 'ui/changeOnload', function( event, data ) {
				var hash = data.hash.replace(/#/g, '');

				drawTimeLine(hash);
			} )

	}

	var initBanner = function(hash) {
		var canvas = document.querySelector('canvas'),
			ctx = canvas.getContext('2d');

		// Images Array
		for (var i = 0; i < settings.tl.samples; i++) {
			settings.tl.images[i] = 'dist/img/' + i + '.png'
		}

		// Draw background
		ctx.fillStyle = '#080808';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Pre load images
		$(function loadImages() {
			//Debug.log( 'Banner.loadImages()', settings.tl.images );
			
			var loadedImages = 0;
			var numImages = settings.tl.images.length;
			
			for(var i = 0; i < settings.tl.samples; i++) {
				var imageSource = settings.tl.images[i];

				settings.tl.images[i] = new Image();
				settings.tl.images[i].onload = function() {
					if(++loadedImages >= numImages) {
						//Draw Timeline on images loaded
						drawTimeLine(hash);
					}
				};
				settings.tl.images[i].src = imageSource;
			}
		});
	}
		
	
	// Draw timeline
	var drawTimeLine = function( hash ) {
		Debug.log( 'Banner.drawBannerTimeline()', hash );
		
		var canvas = document.querySelector('canvas'),
			ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// loop over every char of the hash
		var matches = hash.match( /[A-Za-z][0-9]+/g );
		
		if( matches ) {
			for( var i = 0; i < matches.length; i++ ) {
				var match = matches[i];
				var step = match[0].charCodeAt( 0 ) - 65;
				var samples = match.substr( 1, match.length );

				if( samples.length > 0 ) {
					samples = samples.split( '' );

					for( var j = 0; j < samples.length; j++ ) {
						var width = (canvas.width - settings.tl.right - settings.tl.left) / settings.tl.division;
						var height = width * 1.8;
						var left = width * step + settings.tl.left;
						var top = height * samples[j] + settings.tl.top;
						var image = settings.tl.images[samples[j]];

						ctx.beginPath();
						ctx.strokeStyle = 'white';
						ctx.stroke();
						ctx.drawImage(image, left, top, width, height);
					}
				}
			}
		}
	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Banner.init();
} );
