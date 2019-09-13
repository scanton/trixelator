(function() {
	var componentName = 'trixelator';
	var s = `
		<div class="` + componentName + ` container-fluid">
			<div class="row inputs">
				<div class="col-sm-12">

					<button @click="handleSelectImage" :class="{'show-anyway': !imagePath}" class="btn btn-default select-image-button">
						<span class="glyphicon glyphicon-camera"></span>
						<span class="watermark-label">Select Image</span>
					</button>

					<div  class="toolbar-component">
						<span>Base Width</span><input type="number" step="1" v-model="baseWidth" />
					</div>
					<div  class="toolbar-component">
						<span>Sample Size</span><input type="number" step="1" v-model="sampleSize" />
					</div>
					<button @click="handleGenerateMosaic" class="btn btn-default">Trixelate</button>
					<button @click="handleSaveAsSvg" class="btn btn-default">Save SVG</button>
				</div>
			</div>
			<div class="row image-preview">
				<div class="col-sm-12">
					<img id="trixelator-target" :src="imagePath" />
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
			handleSaveAsSvg: function(e) {
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
				
				//var colorList = [];
				var pixelData, color, x, y, pointUp, hsl, a;
				var s = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 595.3 841.9" enable-background="new 0 0 595.3 841.9" xml:space="preserve">';
				for(y = 0; y < heightSteps; y++) {
					for(x = 0; x < widthSteps; x++) {
						pixelData = averagePixelData(canvas.getContext('2d').getImageData(x * halfBase, y * baseSin, this.sampleSize, this.sampleSize).data);
						color = getColorFromData(pixelData);
						hsl = rgbToHsl(pixelData[0], pixelData[1], pixelData[2]);
						pointUp = (x + y) % 2 ? 'point-up' : '';
						a = [];
						s += '<polygon fill="' + color + '" ';
						if(pointUp) {
						//	a.push(((x * halfBase) + halfBase) + "," + (y * baseSin));
						//	a.push((x * halfBase) + "," + (y * baseSin) + baseSin);
						//	a.push(((x * halfBase) + base) + "," + (y * baseSin) + baseSin);
							
							a.push((x * halfBase) + "," + ((y * baseSin) + baseSin));
							a.push(((x * halfBase) + base) + "," + ((y * baseSin) + baseSin));
							a.push(((x * halfBase) + halfBase) + "," + (y * baseSin));
						} else {
							a.push((x * halfBase) + "," + (y * baseSin));
							a.push(((x * halfBase) + base) + "," + (y * baseSin));
							a.push(((x * halfBase) + halfBase) + "," + ((y * baseSin) + baseSin));
						}
						s += 'points="' + (a.join(" ")) + '"';
						s += ' />';
						//left: ' + Math.floor(x * halfBase) + 'px; top: ' + Math.floor(y * baseSin) + 'px;"
						//colorList.push({x: x, y: y, pixelData: pixelData, color: color, pointUp: pointUp, baseWidth: base, hue: hsl[0], saturation: hsl[1], luminance: hsl[2]});
					}
				}
				s += '</svg>';
				console.log(s);
				//$(".trixelation-output").html(s);
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
