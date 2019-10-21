(function() {
	var componentName = 'simplify-palette-view';
	var s = `
		<div :class="isVisible ? '' : 'hidden'" class="` + componentName + ` modal-view">
			<div class="dialog">
				<h2>Simplify Palette</h2>
				<form>
					<div>
						Remove colors within: <input type="number" v-model="simplificationFactor" />
					</div>
					<div>
						Save Result: <input type="checkbox" v-model="saveResults" />
					</div>
					<div v-show="saveResults">
						Save As: <input type="text" v-model="saveAs" />
					</div>
					<div>
						<button :disabled="(saveResults && !saveAs.length)" @click="handleSimplifyPalette" class="btn btn-success pull-right pull-right">
							Simplify Palette
						</button>
						<button @click="handleCancel" class="btn btn-warning pull-right pull-right">
							Cancel
						</button>
					</div>
				</form>
				<div class="clear"></div>
			</div>
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			isVisible: function() {
				return store.state.isSimplifyPaletteViewVisible;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {
				saveAs: '',
				saveResults: false,
				simplificationFactor: 10

			}
		},
		methods: {
			handleCancel: function(e) {
				e.preventDefault();
				store.commit("hideSimplifyPaletteView");
			},
			handleSimplifyPalette: function(e) {
				e.preventDefault();
				var f = this.simplificationFactor;
				var a = [];
				var componentVals = [];
				var colors = store.state.paletteData.colors;
				var l = colors.length;
				var c, val, diff;
				while(l--) {
					c = colors[l];
					val = hexToComponent(c);
					diff = minColorDiff(val, componentVals);
					if(diff > f) {
						a.push(c);
						componentVals.push(val);
					}
				}
				a.sort(colorSort);
				store.commit("updateCurrentPalette", a);
				store.commit("hideSimplifyPaletteView");
			}
		}
	});
})();
