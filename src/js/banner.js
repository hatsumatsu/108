/**
 * Banner
 * Create dynamic banner for users
 */
var Banner = ( function() {
	var settings = {
		init: false,
		hash: '',
		width: '',
		height: '',
		selector: {
			banner: '.banner-container .banner',
			download: '.download-banner'
		},
		layers: {
			background: '',
			timeline: '',
			name: '',
		},
		timeline: {
			division: 16,
			samples: 6,
			top: 10,
			left: 5,
			right: 5
		},
		assets: {
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
			.on( 'click', settings.selector.download, function () {
				download();
			})
			.on( 'ui/openShare', function( event, data ) {
				settings.hash = data.hash.replace(/#/g, '');

				if( settings.init === false ){
					initBanner();
					settings.init = true;
				} else {
					drawTimeLine();
				}
			} )
			.on( 'Ui/changeName', function( event, data ) {
				drawName(data.name);
			} );

	}

	var initBanner = function() {
		//Debug.log( 'Banner.initBanner()' );

		// Get banner dimentions
		settings.width = $(settings.selector.banner).attr('width');
		settings.height = $(settings.selector.banner).attr('height');

		// Create canvas layers
		for (var key in settings.layers ){
			var layer = document.createElement('canvas')
				layer.setAttribute('width', settings.width);
		        layer.setAttribute('height', settings.height);

		    settings.layers[key] = layer;
		}

		// Pre load images
		$(function loadImages() {
			var loadedImages = 0;
			var numImages = Object.keys(settings.assets).length;

			for(var src in settings.assets) {
				var imageSource = settings.assets[src];

				settings.assets[src] = new Image();
				settings.assets[src].onload = function() {
					if(++loadedImages >= numImages) {
						drawBackground();
						drawTimeLine();
					}
				};
				settings.assets[src].src = imageSource;
			}
		});
	}

	// Draw background layer
	var drawBackground = function() {
		//Debug.log( 'Banner.drawBackground()' );

		var background = settings.layers.background.getContext('2d');
			background.clearRect(0, 0, settings.width, settings.height);
		
		background.drawImage(settings.assets.background, 0, 0, settings.width, settings.height);

		drawBanner();
	}

	// Draw timeline layer
	var drawTimeLine = function( ) {
		//Debug.log( 'Banner.drawTimeline()' );

		var timeline = settings.layers.timeline.getContext('2d');
			timeline.clearRect(0, 0, settings.width, settings.height);

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
						var top = settings.timeline.top / 10 * settings.height / 10;
						var left = settings.timeline.left / 10 * settings.width / 10;
						var right = settings.timeline.right / 10 * settings.width / 10;

						// real values
						var image = settings.assets[samples[j]];
						var width = (settings.width - right - left) / settings.timeline.division;
						var height = width * 1.4; // aspect ratio
						var left = width * step + left;
						var top = height * samples[j] + top;

						timeline.drawImage(image, left, top, width, height);
					}
				}
			}
		}

		drawBanner();
	}

	// Draw Name
	var drawName = function( inputname ) {
		//Debug.log( 'Banner.drawName()' );		
		var name = settings.layers.name.getContext('2d');
			name.clearRect(0, 0, settings.width, settings.height);
		
		name.textAlign = 'center';

		name.fillStyle = 'white';
		name.font = '200px sans-serif';
		name.fillText( inputname.toUpperCase(), settings.width / 2, 800 , settings.width - 200);
		name.fill();

		drawBanner();
	}

	// Get Layers and draw banner
	var drawBanner = function() {
		//Debug.log( 'Banner.drawBanner()' );

		var canvas = document.querySelector(settings.selector.banner);

		var banner = canvas.getContext('2d');
			banner.clearRect(0, 0, settings.width, settings.height);
		
		banner.drawImage(settings.layers.background, 0, 0, settings.width, settings.height);
		banner.drawImage(settings.layers.timeline, 0, 0, settings.width, settings.height);
		banner.drawImage(settings.layers.name, 0, 0, settings.width, settings.height);
	}

	// Download
	var download = function() {
		//Debug.log( 'Banner.download()' );

		var canvas = document.querySelector(settings.selector.banner);
		var a = document.createElement('a');
		
		$('body').append(a);

		a.setAttribute('href', canvas.toDataURL('image/jpeg', 1));
		a.setAttribute('download', 'banner.jpg');
		a.setAttribute('target', '_blank');
		a.click();

		$(a).remove();

	}

	return {
		init: function() { init(); }
	}

} )();

$( document ).ready( function() {
	Banner.init();
} );
