(function() {
	var componentName = 'color-manager';
	var s = `
		<div :class="{'hide-color-manager': !showColorManager}"  class="` + componentName + `">
			<div class="container-fluid">
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
			hasImagePath: function() {
				return !Boolean(store.state.imagePath.length);
			},
			isPaletteMappingEnabled: function() {
				return store.state.isPaletteMappingEnabled;
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
			togglePaletteMapping: function(e) {
				store.commit("togglePaletteMapping");
			}
		}
	});
})();
