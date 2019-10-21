(function() {
	var componentName = 'palette-name-view';
	var s = `
		<div :class="isVisible ? '' : 'hidden'" class="` + componentName + ` modal-view">
			<div class="dialog">
				<h2>Create New Palette</h2>
				<form>
					<div>
						<input type="text" v-model="name" placeholder="palette name" />
					</div>
					<div>
						<button @click="handleNewName" class="btn btn-success pull-right pull-right">
							Create New Palette
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
				return store.state.isPaletteNameFormVisible;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {
				name: ''
			}
		},
		methods: {
			handleCancel: function(e) {
				e.preventDefault();
				store.commit("hidePaletteNameView");
			},
			handleNewName: function(e) {
				e.preventDefault();
				if(this.name.length) {
					store.commit("createNewPalette", this.name);
					store.commit("hidePaletteNameView");
				}
			}
		}
	});
})();
