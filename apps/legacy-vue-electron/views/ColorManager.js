(function() {
	var componentName = 'color-manager';
	var s = `
		<div :class="{'hide-color-manager': !showColorManager}"  class="` + componentName + `">
			<div class="container-fluid">
				<div class="row" v-show="hasImagePath">
					<div class="col-xs-12 focal-input text-center">
						<h3>Adjustments</h3>
						<div class="range-slider hue-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Hue Rotate 
								</div>
								<div class="col-xs-6">
									<input v-model="globalHueAdjust" type="range" min="-0" max="360" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider saturation-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Saturate 
								</div>
								<div class="col-xs-6">
									<input v-model="globalSaturationAdjust" type="range" min="0" max="10" step="0.1" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider luminance-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Brightness
								</div>
								<div class="col-xs-6">
									<input v-model="globalLuminanceAdjust" type="range" min="0" max="2" step="0.01" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider contrast-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Contrast
								</div>
								<div class="col-xs-6">
									<input v-model="globalContrastAdjust" type="range" min="0" max="2" step="0.01" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider invert-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Invert
								</div>
								<div class="col-xs-6">
									<input v-model="globalInvertAdjust" type="range" min="0" max="1" step="0.01" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider sepia-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Sepia
								</div>
								<div class="col-xs-6">
									<input v-model="globalSepiaAdjust" type="range" min="0" max="1" step="0.01" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider grayscale-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Grayscale
								</div>
								<div class="col-xs-6">
									<input v-model="globalGrayscaleAdjust" type="range" min="0" max="1" step="0.01" class="slider" />
								</div>
							</div>
						</div>
						<div class="range-slider blur-range-slider text-center container-fluid">
							<div class="row">
								<div class="col-xs-6">
									Blur
								</div>
								<div class="col-xs-6">
									<input v-model="globalBlurAdjust" type="range" min="0" max="10" step="0.1" class="slider" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="row" v-show="hasImagePath">
					<div class="col-xs-12 focal-input" @click="handleGetNewPaletteName">
						<span class="glyphicon glyphicon-new-window"></span>
						<span class="watermark-label">Sample Palette from Image</span>
					</div>
				</div>
				<!--
				<div class="row">
					<div class="col-xs-12 focal-input" @click="toggleTrixelLevelAdjustment">
						<input type="checkbox" v-model="isTrixelLevelAdjustmentEnabled" />
						Enable Trixel Level Adjustment
					</div>
				</div>
				-->
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
								<span class="watermark-label">Simplify Palette</span>
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
				<!--
				<div class="row">
					<div class="col-xs-12 focal-input" @click="toggleColorShifting">
						<input type="checkbox" v-model="isColorShiftingEnabled" />
						Enable Color Shifting
					</div>
				</div>
				-->
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
			globalBlurAdjust: {
				get: function() {
					return store.state.globalColorAdjust.blur;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {blur: value});
				}
			},
			globalContrastAdjust: {
				get: function() {
					return store.state.globalColorAdjust.contrast;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {contrast: value});
				}
			},
			globalGrayscaleAdjust: {
				get: function() {
					return store.state.globalColorAdjust.grayscale;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {grayscale: value});
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
			globalInvertAdjust: {
				get: function() {
					return store.state.globalColorAdjust.invert;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {invert: value});
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
			globalSepiaAdjust: {
				get: function() {
					return store.state.globalColorAdjust.sepia;
				},
				set: function(value) {
					store.commit("updateGlobalColorAdjust", {sepia: value});
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
				return Boolean(store.state.imagePath.length);
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
