(function() {
	var componentName = 'trixelator';
	var s = `
		<div class="` + componentName + ` container-fluid">
			<div class="row image-preview">
				<div class="col-sm-12">
					<div @click="handleSelectImage" :class="{'show-anyway': !imagePath}" class="click-overlay">
						<span class="glyphicon glyphicon-camera"></span>
						<div class="watermark-label">Select Image</div>
					</div>
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
					<div class="trixelation-output">
						<svg></svg>
					</div>
				</div>
			</div>
			<pallette></pallette>
			<div class="inline-styles">
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
				var base = Number(this.baseWidth);
				var halfBase = base / 2;
				var baseSin = base * eqSin;
				var img = document.getElementById("trixelator-target");
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

				var widthSteps = Math.floor(img.width / halfBase);
				var heightSteps = Math.floor(img.height / baseSin);

				console.log('widthSteps: ' + widthSteps, 'heightSteps:' + heightSteps, 'totalSteps: ' + (widthSteps * heightSteps));
				
				var colorList = [];
				var pixelData, color, x, y, pointUp, hsl;
				var s = '<div class="trixelation">'
				for(y = 0; y < heightSteps; y++) {
					for(x = 0; x < widthSteps; x++) {
						pixelData = averagePixelData(canvas.getContext('2d').getImageData(x * halfBase, y * baseSin, this.sampleSize, this.sampleSize).data);
						color = getColorFromData(pixelData);
						hsl = rgbToHsl(pixelData[0], pixelData[1], pixelData[2]);
						pointUp = (x + y) % 2 ? 'point-up' : '';
						s += '<div class="trixel ' + pointUp + '" style="border-color: ' + color + '; left: ' + Math.floor(x * halfBase) + 'px; top: ' + Math.floor(y * baseSin) + 'px;"></div>';
						colorList.push({x: x, y: y, pixelData: pixelData, color: color, pointUp: pointUp, baseWidth: base, hue: hsl[0], saturation: hsl[1], luminance: hsl[2]});
					}
				}
				s += '</div>';
				$(".trixelation-output").html(s);
				$(".inline-styles").html(`
					<style>
						.trixel {
							display: inline-block;
							position: absolute;
							border-top: ` + (base + 1) + `px solid #999;
							border-left: ` + (halfBase + 1) + `px solid transparent !important;
							border-right: ` + (halfBase + 1) + `px solid transparent !important;
						}
						.trixel.point-up {
							border-bottom: ` + (base + 1) + `px solid #999;
							border-top-width: 0;
						}
					</style>
				`);
				this.$store.commit("colorList", colorList);
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
