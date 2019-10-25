(function() {
	var componentName = 'trixelator';
	var s = `
		<div class="` + componentName + ` container-fluid">
			<div class="row inputs">
				<div class="col-sm-12">
					<button @click="handleSelectImage" :class="{'show-anyway': !imagePath}" class="btn btn-default select-image-button" title="Select Image">
						<span class="glyphicon glyphicon-camera"></span>
						<span class="watermark-label visible-lg-inline-block visible-md-inline-block">Select Image</span>
					</button>
					<button v-show="hasImagePath" :disabled="!hasImagePath" @click="toggleSubSelect" class="btn btn-default toggle-sub-select-button" title="Sub Select">
						<span class="glyphicon glyphicon-picture"></span>
						<span class="watermark-label visible-lg-inline-block visible-md-inline-block">Sub-Select</span>
					</button>
					<button @click="handleColorToggle" class="btn btn-default toggle-color-manager-button" title="Colors">
						<span class="glyphicon glyphicon-modal-window"></span>
						<span class="watermark-label visible-lg-inline-block visible-md-inline-block">Colors</span>
					</button>
					<div class="toolbar-component">
						<span>Base <span class="visible-lg-inline-block visible-md-inline-block">Width</span></span><input type="number" step="1" v-model="baseWidth" />
					</div>
					<div class="toolbar-component">
						<span>Sample <span class="visible-lg-inline-block visible-md-inline-block">Size</span></span><input type="number" step="1" v-model="sampleSize" />
					</div>
					<button v-show="hasImagePath" :disabled="!hasImagePath" @click="handleGenerateMosaic" class="btn btn-default trixelate-button" title="Trixelate">
						<span class="glyphicon glyphicon-play"></span>
						<span class="visible-lg-inline-block visible-md-inline-block">Trixelate (Preview)</span>
					</button>
					<button v-show="hasImagePath" :disabled="!hasImagePath" @click="handleSaveAsSvg" class="btn btn-default" title="Save SVG">
						<span class="glyphicon glyphicon-save"></span>
						<span class="visible-lg-inline-block visible-md-inline-block">Save SVG</span>
					</button>

					<!--<button @click="testModal" class="btn btn-default">Test Modal</button>-->
				</div>
			</div>
			<div class="row image-preview" v-show="hasImagePath">
				<div class="col-sm-12">
					<img id="trixelator-target" :src="imagePath" :style="globalFilters" />
					<div v-show="isUsingSubSelect" class="subselector-overlay">
						
					</div>
				</div>
			</div>
			<div class="row mosaic-output" v-show="hasImagePath">
				<div class="col-sm-12">
					<div class="trixelation-output" v-html="trixelationOutput" @click="handleTrixelClick">
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
			globalFilters: function() {
				return 'filter: ' + store.state.globalFilters + ';';
			},
			hasImagePath: function() {
				return Boolean(store.state.imagePath.length);
			},
			imagePath: function() {
				return store.state.imagePath;
			},
			isUsingSubSelect: function() {
				return store.state.isUsingSubSelect;
			},
			sampleSize: {
				get() {
					return store.state.sampleSize;
				},
				set(value) {
					this.$store.commit('setSampleSize', value);
				}
			},
			trixelationOutput: function() {
				return store.state.trixelationOutput;
			}
		},
		props: [],
		template: s,
		data: function() {
			return {}
		},
		methods: {
			testModal: function(e) {
				store.commit("showModalDialog", {
					title: "Modal Dialog Test",
					body: "This is a test of the Modal Dialog System.  This is only a test...",
					buttons: [
						{
							label: "Cancel",
							class: "btn btn-warning",
							handler: function(e) {
								store.commit("hideModalDialog");
							}
						},
						{
							label: "Do it",
							class: "btn btn-danger",
							handler: function(e) {
								console.log("consider it done");
							}
						}
					]
				});
			},
			generateMosaic: function(e) {
				var base = Number(this.baseWidth);
				var halfBase = base / 2;
				var baseSin = base * eqSin;
				var img = document.getElementById("trixelator-target");
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				var ctx = canvas.getContext('2d');
				if(store.state.globalFilters.length) {
					ctx.filter = store.state.globalFilters;
				}
				ctx.drawImage(img, 0, 0, img.width, img.height);

				var widthSteps = Math.floor(img.width / halfBase);
				var heightSteps = Math.floor(img.height / baseSin);
				var overlapSize = 0.75;
				var pixelData, color, x, y, pointUp, hsl, a;
				var portWidth = img.width - base;
				var portHeight = img.height - baseSin;
				var s = '<?xml version="1.0" encoding="utf-8"?>\n<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" x="0px" y="0px" viewBox="0 0 ' + portWidth + ' ' + portHeight + '" enable-background="new 0 0 ' + portWidth + ' ' + portHeight + '" xml:space="preserve"><g inkscape:groupmode="layer" inkscape:label="Layer 1"><g>';
				for(y = 0; y < heightSteps; y++) {
					for(x = 0; x < widthSteps; x++) {

			
			
						pixelData = averagePixelData(canvas.getContext('2d').getImageData(x * halfBase, y * baseSin, this.sampleSize, this.sampleSize).data);
						if(store.state.isPaletteMappingEnabled) {
							color = getHexColorFromMap(pixelData);
						} else {
							color = getHexColorFromData(pixelData);
						}
						hsl = rgbToHsl(pixelData[0], pixelData[1], pixelData[2]);
						pointUp = (x + y) % 2 ? 'point-up' : '';
						a = [];
						s += '\n<polygon fill="' + color + '" ';
						if(pointUp) {
							a.push(Math.round((x * halfBase) - overlapSize - halfBase) + "," + Math.round(((y * baseSin) + baseSin) + overlapSize));
							a.push(Math.round((x * halfBase) + base + overlapSize - halfBase) + "," + Math.round(((y * baseSin) + baseSin) + overlapSize));
							a.push(Math.round((x * halfBase)) + "," + Math.round((y * baseSin) - overlapSize));
						} else {
							a.push(Math.round((x * halfBase) - overlapSize - halfBase) + "," + Math.round((y * baseSin) - overlapSize));
							a.push(Math.round(((x * halfBase) + base) + overlapSize - halfBase) + "," + Math.round((y * baseSin) - overlapSize));
							a.push(Math.round((x * halfBase)) + "," + Math.round(((y * baseSin) + baseSin) + overlapSize));
						}
						s += 'points="' + (a.join(" ")) + '"';
						s += ' />';
					}
				}
				s += '\n</g></g></svg>';
				return s;
			},
			handleColorToggle: function() {
				this.$store.commit('toggleColorManager');
			},
			handleGenerateMosaic: function(e) {
				store.commit("setTrixelationOutput", this.generateMosaic());
			},
			handleSampleColors: function(e) {
			
			
			},
			handleSaveAsSvg: function(e) {
				var path = dialog.showSaveDialog({ title: "Save Trixelation as SVG", defaultPath: store.state.defaultPath, filters: [{name: "SVG Vector Graphics", extensions: ['svg']}] });
				if(path) {
					path = path.split(".")[0] + ".svg";
					store.commit("setDefaultPath", path);
					fs.outputFile(path, this.generateMosaic(), function(err) {
						if(err) {
							console.error(err);
						}
					});
				}
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
			},
			handleTrixelClick: function(e) {
				var color = $(e.target).attr("fill");
				if(color) {
					console.log(color);
				}
			},
			toggleSubSelect: function(e) {
				e.preventDefault();
				store.commit("toggleSubSelect");
			}
		}
	});
})();
