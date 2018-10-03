(function() {
	var componentName = 'trixelator';
	var s = `
		<div class="` + componentName + ` container-fluid">
			<div class="row">
				<div class="col-sm-12">
					<button @click="handleSelectImage" class="btn btn-default">Select Image</button>
				</div>
			</div>
			<div class="row image-preview">
				<div class="col-sm-12">
					<img :src="imagePath" />
				</div>
			</div>
			<div class="row inputs">
				<div class="col-sm-12">
					<span>Base Width</span><input type="number" step="1" v-model="baseWidth" />
					<span>Sample Size</span><input type="number" step="1" v-model="sampleSize" />
					<button @click="handleGenerateMosaic" class="btn btn-default">Generate Mosaic</button>
				</div>
			</div>
			<div class="row mosaic-output">
				<div class="col-sm-12">
					<svg></svg>
				</div>
			</div>
		</div>
	`;
	
	Vue.component(componentName, {
		created: function() {
			
		},
		computed: {
			baseWidth: {
				get() {
					return store.state.baseWidth;
				},
				set(value) {
					this.$store.commit('setBaseWidth', value);
				}
			},
			imagePath: function() {
				return store.state.imagePath;
			},
			sampleSize: {
				get() {
					return store.state.sampleSize;
				},
				set(value) {
					this.$store.commit('setSampleSize', value);
				}
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			handleGenerateMosaic: function(e) {
				console.log("gen");
			},
			handleSelectImage: function(e) {
				dialog.showOpenDialog({
					title: "Select Image File",
					buttonLabel: "Use Image",
					properties: ["openFile"],
					filters: [{name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif']}]

				}, (result) => {
					if(result) {
						store.commit("setImagePath", result[0]);
					}
				});
			}
		}
	});
})();
