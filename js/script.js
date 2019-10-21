const remote = require('electron').remote;
const {dialog} = require('electron').remote;

const fs = require('fs-extra');

require('./custom_modules/utils/enableContextMenu.js')();

const stripObservers = function(obj) {
	return JSON.parse(JSON.stringify(obj, null, 4));
}
const toDegrees = function (rad) {
	return rad * (180 / Math.PI);
}
const toRadians = function (deg) {
	return deg * (Math.PI / 180);
}
const svgTag = function (tag, attrs) {
	var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
	for (var k in attrs) {
		el.setAttribute(k, attrs[k]);
	}
	return el;
}
const averagePixelData = function(arr) {
	var l = arr.length;
	var count = 0;
	var r = 0;
	var g = 0;
	var b = 0;
	var a = 0
	for(var i = 0; i < l; i+= 4) {
		r += arr[i];
		g += arr[i + 1];
		b += arr[i + 2];
		a += arr[i + 3];
		++count;
	}
	return [Math.floor(r/count), Math.floor(g/count), Math.floor(b/count), Math.floor(a/count)];
}
const rgbToHsl = function(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
	if (max == min) {
		h = s = 0;
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: 
				h = (g - b) / d + (g < b ? 6 : 0); 
				break;
			case g: 
				h = (b - r) / d + 2; 
				break;
			case b: 
				h = (r - g) / d + 4; 
				break;
		}
		h /= 6;
	}
	return [h, s, l];
}

const getColorFromData = function(data) {
	return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
}
const componentToHex = function (c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
const hexToComponent = function(hex) {
	return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}
const getHexColorFromData = function(data) {
	return '#' + componentToHex(data[0]) + componentToHex(data[1]) + componentToHex(data[2]);
}
const getHexColorFromMap = function(data) {
	if(store.state.paletteData && store.state.paletteData.colors) {
		var c, d, componentColor, bestColor;
		var diff = Number.POSITIVE_INFINITY;
		var colors = store.state.paletteData.colors;
		var l = colors.length;
		while(l--) {
			c = colors[l];
			componentColor = hexToComponent(c);
			d = Math.abs(componentColor[0] - data[0]) + Math.abs(componentColor[1] - data[1]) + Math.abs(componentColor[1] - data[1]);
			if(d < diff) {
				bestColor = c;
				diff = d;
			}
		}
		return bestColor;
	} else {
		return getHexColorFromData(data);
	}
}
const minColorDiff = function(color, data) {
	var diff = Number.POSITIVE_INFINITY;
	var l = data.length;
	var d, colorDiff;
	while(l--) {
		d = data[l];
		colorDiff = Math.abs(d[0] - color[0]) + Math.abs(d[1] - color[1]) + Math.abs(d[2] - color[2]);
		diff = Math.min(diff, colorDiff);
	}
	return diff;
}
const colorSort = function(a, b) {
	var aC = hexToComponent(a);
	var bC = hexToComponent(b);
	return (bC[0] - aC[0]) + (bC[1] - aC[1]) + (bC[2] - aC[2]);
}

const eqRad = toRadians(60);
const eqSin = Math.sin(eqRad);
const eqCos = Math.cos(eqRad);

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		baseWidth: 40,
		colorList: [],
		imagePath: '',
		sampleSize: 15,
		defaultPath: 'trixelator.svg',
		showColorManager: false,
		savedPalettes: [],
		isPaletteMappingEnabled: false,
		paletteData: {},
		isPaletteNameFormVisible: false,
		isSimplifyPaletteViewVisible: false
	},
	actions: {
		loadPalette: function({commit, state}, name) {
			return new Promise((resolve, reject) => {
				fs.readJson(paletteDirectory + '/' + name + '.json', function(err, data) {
					if(err) {
						console.error(err);
						reject(err);
					} else {
						store.commit("setPalette", data);
						resolve(data);
					}
				});
			});
		}
	},
	mutations: {
		colorList: function(state, list) {
			state.colorList = list;
		},
		createNewPalette: function(state, name) {
			var base = Number(store.state.baseWidth);
			var halfBase = base / 2;
			var baseSin = base * eqSin;
			var img = document.getElementById("trixelator-target");
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
			var widthSteps = Math.floor(img.width / halfBase);
			var heightSteps = Math.floor(img.height / baseSin);
			var x, y, pixelData, a, color;
			a = [];
			for(y = 0; y < heightSteps; y++) {
				for(x = 0; x < widthSteps; x++) {
					pixelData = averagePixelData(canvas.getContext('2d').getImageData(x * halfBase, y * baseSin, store.state.sampleSize, store.state.sampleSize).data);
					color = getHexColorFromData(pixelData).toLowerCase();
					if(a.indexOf(color) == -1) {
						a.push(color);
					}
				}
			}
			fs.writeJson(paletteDirectory + '/' + name + '.json', {name: name, colors: a}, function(err) {
				if(!err) {
					store.dispatch("loadPalette", name);
				}
			});
		},
		hidePaletteNameView: function(state) {
			state.isPaletteNameFormVisible = false;
		},
		hideSimplifyPaletteView: function(state) {
			state.isSimplifyPaletteViewVisible = false;
		},
		setBaseWidth: function(state, value) {
			state.baseWidth = value;
		},
		setDefaultPath: function(state, value) {
			state.defaultPath = value;
		},
		setPalette: function(state, paletteData) {
			paletteData.colors.sort(colorSort);
			state.paletteData = paletteData;
		},
		setSavedPalettes: function(state, arr) {
			state.savedPalettes = arr;
		},
		setImagePath: function(state, path) {
			state.imagePath = path;
		},
		setSampleSize: function(state, value) {
			state.sampleSize = value;
		},
		showPaletteNameView: function(state) {
			state.isPaletteNameFormVisible = true;
		},
		showSimplifyPaletteView: function(state) {
			state.isSimplifyPaletteViewVisible = true;
		},
		toggleColorManager: function(state) {
			state.showColorManager = !state.showColorManager;
		},
		togglePaletteMapping: function(state) {
			state.isPaletteMappingEnabled = !state.isPaletteMappingEnabled;
		},
		updateCurrentPalette: function(state, colors) {
			state.paletteData.colors = colors;
		}
	}
});

const vm = new Vue({
	el: '#main-app',
	store: store
});

const paletteDirectory = __dirname + '/palettes';
fs.pathExists(paletteDirectory, (err, exists) => {
	if(exists) {
		fs.readdir(paletteDirectory, (err, files) => {
			if(err) {
				console.error(err);
			}
			var a = [];
			var l = files.length;
			var holder;
			while(l--) {
				holder = files[l].split(".");
				if(holder.length == 2 && holder[1].toLowerCase() == 'json') {
					a.push(holder[0]);
				}
			}
			store.commit("setSavedPalettes", a);
			if(a.length) {
				store.dispatch("loadPalette", a[0]);
			}
		});
	}
});
