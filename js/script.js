const remote = require('electron').remote;
const {dialog} = require('electron').remote;

require('./custom_modules/utils/enableContextMenu.js')();


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
const getColorFromData = function(data) {
	return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
}

const eqRad = toRadians(60);
const eqSin = Math.sin(eqRad);
const eqCos = Math.cos(eqRad);

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		baseWidth: 25,
		colorList: [],
		imagePath: '/Users/satoricanton/Desktop/31105585103_4c32392ac1_k.jpg',
		sampleSize: 25
	},
	mutations: {
		colorList: function(state, list) {
			state.colorList = list;
		},
		setBaseWidth: function(state, value) {
			state.baseWidth = value;
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
