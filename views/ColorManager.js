(function() {
	var componentName = 'color-manager';
	var s = `
		<div :class="{'hide-color-manager': !showColorManager}"  class="` + componentName + `">
			<div class="container-fluid">
				<div class="row">
					<div class="col-xs-12">
						<input type="checkbox" v-model="isPaletteMappingEnabled" @click="togglePaletteMapping" />
						Enable Palette Mapping
					</div>
				</div>
				<div :class="isPaletteMappingEnabled ? 'palette-mapping-enabled' : 'palette-mapping-disabled'" class="row">
					<div class="col-xs-12">
						<select @change="handlePaletteSelect">
							<option v-for="palett in savedPalettes">{{palett}}</option>
						</select>
					</div>
					<div class="col-xs-12">
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
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			handlePaletteSelect: function(e) {
				store.dispatch("loadPalette", e.target.value);
			},
			togglePaletteMapping: function(e) {
				store.commit("togglePaletteMapping");
			}
		}
	});
})();
