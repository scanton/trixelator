(function() {
	var componentName = 'color-manager';
	var s = `
		<div :class="{'hide-color-manager': !showColorManager}"  class="` + componentName + `">
			<input type="color" />
			<select>
				<option v-for="palett in savedPalettes">{{palett}}</option>
			</select>
			{{savedPalettes}}
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			showColorManager: function() {
				return store.state.showColorManager;
			},
			savedPalettes: function() {
				console.log(store.state.savedPalettes);
				return store.state.savedPalettes;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			
		}
	});
})();
