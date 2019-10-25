(function() {
	var componentName = 'color-manager';
	var s = `
		<div :class="{'hide-color-manager': !showColorManager}"  class="` + componentName + `">
			<div class="container-fluid">
				<div class="row">
					<div class="col-xs-12 focal-input text-center">
						<h3>Adjustments</h3>
						<div class="range-slider red-range-slider text-center">
							R: <input v-model="globalRedAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalRedAdjust}}</span>
						</div>
						<div class="range-slider green-range-slider text-center">
							G: <input v-model="globalGreenAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalGreenAdjust}}</span>
						</div>
						<div class="range-slider blue-range-slider text-center">
							B: <input v-model="globalBlueAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalBlueAdjust}}</span>
						</div>
						<div class="range-slider hue-range-slider text-center">
							H: <input v-model="globalHueAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalHueAdjust}}</span>
						</div>
						<div class="range-slider saturation-range-slider text-center">
							S: <input v-model="globalSaturationAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalSaturationAdjust}}</span>
						</div>
						<div class="range-slider luminance-range-slider text-center">
							L: <input v-model="globalLuminanceAdjust" type="range" orient="vertical" min="-100" max="100" class="slider" />
							<span class="minor-value">{{globalLuminanceAdjust}}</span>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12 focal-input" @click="toggleTrixelLevelAdjustment">
						<input type="checkbox" v-model="isTrixelLevelAdjustmentEnabled" />
						Enable Trixel Level Adjustment
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12 focal-input" @click="togglePaletteMapping">
						<input type="checkbox" v-model="isPaletteMappingEnabled" />
						Enable Palette Mapping
					</div>
				</div>
				<div :class="isPaletteMappingEnabled ? 'palette-mapping-enabled' : 'palette-mapping-disabled'" class="row">
					<div class="col-xs-12 text-center">
						<div class="siplification-controls">
							<button @click="handleSimplifyPalette" class="btn btn-default">
								<span class="glyphicon glyphicon-filter"></span>
								<span class="watermark-label">Simplify</span>
							</button>
							<button :disabled="hasImagePath" @click="handleGetNewPaletteName" class="btn btn-default sample-colors-button">
								<span class="glyphicon glyphicon-new-window"></span>
								<span class="watermark-label">Sample</span>
							</button>
						</div>
					</div>
					<div class="cols-xs-12 text-center">
						<select @change="handlePaletteSelect">
							<option v-for="palett in savedPalettes">{{palett}}</option>
						</select>
						({{totalColors}} colors)
					</div>
					<div class="col-xs-12 palette-contro">
						<h3>{{selectedPaletteName}}</h3>
						<ul class="color-list">
							<li v-for="color in colors"><span class="swatch" :style="'background: ' + color"></span> {{color}}</li>
						</ul>
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12 focal-input" @click="toggleColorShifting">
						<input type="checkbox" v-model="isColorShiftingEnabled" />
						Enable Color Shifting
					</div>
				</div>
			</div>
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			colors: function() {
				return store.state.paletteData.colors;
			},
			globalBlueAdjust: {
				get: function() {
					return store.state.globalColorAdjust.b;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {b: value});
				}
			},
			globalGreenAdjust: {
				get: function() {
					return store.state.globalColorAdjust.g;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {g: value});
				}
			},
			globalRedAdjust: {
				get: function() {
					return store.state.globalColorAdjust.r;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {r: value});
				}
			},
			globalHueAdjust: {
				get: function() {
					return store.state.globalColorAdjust.h;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {h: value});
				}
			},
			globalSaturationAdjust: {
				get: function() {
					return store.state.globalColorAdjust.s;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {s: value});
				}
			},
			globalLuminanceAdjust: {
				get: function() {
					return store.state.globalColorAdjust.l;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {l: value});
				}
			},
			hasImagePath: function() {
				return !Boolean(store.state.imagePath.length);
			},
			isColorShiftingEnabled: function() {
				return store.state.isColorShiftingEnabled;
			},
			isPaletteMappingEnabled: function() {
				return store.state.isPaletteMappingEnabled;
			},
			isTrixelLevelAdjustmentEnabled: function() {
				return store.state.isTrixelLevelAdjustmentEnabled;
			},
			showColorManager: function() {
				return store.state.showColorManager;
			},
			savedPalettes: function() {
				return store.state.savedPalettes;
			},
			selectedPaletteName: function() {
				if(store.state.paletteData && store.state.paletteData.name) {
					return store.state.paletteData.name;
				}
				return "";
			},
			totalColors: function() {
				if(store.state.paletteData && store.state.paletteData.colors) {
					return store.state.paletteData.colors.length;
				}
				return 0;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			handleGetNewPaletteName: function(e) {
				store.commit("showPaletteNameView");
			},
			handlePaletteSelect: function(e) {
				store.dispatch("loadPalette", e.target.value);
			},
			handleSimplifyPalette: function(e) {
				store.commit("showSimplifyPaletteView");
			},
			toggleColorShifting: function(e) {
				store.commit("toggleColorShifting");
			},
			togglePaletteMapping: function(e) {
				store.commit("togglePaletteMapping");
			},
			toggleTrixelLevelAdjustment: function(e) {
				store.commit("toggleTrixelLevelAdjustment");
			}
		}
	});
})();
