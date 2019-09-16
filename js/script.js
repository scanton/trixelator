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
const getHexColorFromData = function(data) {
	return '#' + componentToHex(data[0]) + componentToHex(data[1]) + componentToHex(data[2]);
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
		defaultPath: '/trixelator.svg'
	},
	mutations: {
		colorList: function(state, list) {
			state.colorList = list;
		},
		setBaseWidth: function(state, value) {
			state.baseWidth = value;
		},
		setDefaultPath: function(state, value) {
			state.defaultPath = value;
		},
		setImagePath: function(state, path) {
			state.imagePath = path;
		},
		setSampleSize: function(state, value) {
			state.sampleSize = value;
		}
	}
});

const vm = new Vue({
	el: '#main-app',
	store: store
});
