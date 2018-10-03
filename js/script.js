const remote = require('electron').remote;
const {dialog} = require('electron').remote;

require('./custom_modules/utils/enableContextMenu.js')();

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		imagePath: '',
		baseWidth: 100,
		sampleSize: 2
	},
	mutations: {
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