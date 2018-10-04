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
					<img id="trixelator-target" :src="imagePath" />
				</div>
			</div>
			<div class="row inputs">
				<div class="col-sm-12">
					<span>Base Width</span><input type="number" step="1" v-model="baseWidth" />
					<span>Sample Size</span><input type="number" step="1" v-model="sampleSize" />
					<button @click="handleGenerateMosaic" class="btn btn-default">Trixelate</button>
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
				
				var img = document.getElementById("trixelator-target");
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

				var widthSteps = Math.floor(img.width / (this.baseWidth / 2));
				//var heightSteps = Math.floor(img.height / (this.baseWidth * eqCos));

				//var pixelData = canvas.getContext('2d').getImageData(150, 200, 10, 10).data;

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
